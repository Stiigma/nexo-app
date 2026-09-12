// V2 plugin adapter contract tests.
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

function createEventStream() {
  const pending = [];
  const waiters = [];
  return {
    push(value) {
      if (waiters.length > 0) waiters.shift()(value);
      else pending.push(value);
    },
    stream: {
      [Symbol.asyncIterator]() {
        return {
          next: () => new Promise((resolve) => {
            if (pending.length > 0) resolve({ value: pending.shift(), done: false });
            else waiters.push((value) => resolve({ value, done: false }));
          }),
          return: async () => ({ done: true }),
        };
      },
    },
  };
}

function createFakeContext(root) {
  const hooks = { tool: {}, shell: {}, session: {} };
  const state = { tools: [], prompts: [], interrupts: [], messages: [] };
  const events = createEventStream();
  const ctx = {
    location: { directory: root, project: { id: "synthetic" } },
    options: {},
    tool: {
      hook: async (name, callback) => {
        hooks.tool[name] = callback;
      },
      transform: async (callback) => {
        callback({ add: (tool) => state.tools.push(tool) });
      },
    },
    shell: {
      hook: async (name, callback) => {
        hooks.shell[name] = callback;
      },
    },
    session: {
      hook: async (name, callback) => {
        hooks.session[name] = callback;
      },
      prompt: async (input) => {
        state.prompts.push(input);
      },
      interrupt: async (input) => {
        state.interrupts.push(input);
      },
      context: async () => state.messages,
    },
    event: {
      subscribe: () => events.stream,
    },
  };
  return { ctx, hooks, state, events };
}

test("v2 adapter maps tool, shell, prompt, command and event contracts", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "v2-adapter-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.writeFile(path.join(root, "opencode.json"), JSON.stringify({
    command: {
      probe: { template: "PROBE-CTX $ARGUMENTS tail" },
      exact: { template: "EXACT-BODY" },
    },
  }));

  const calls = { events: [] };
  const factory = () => ({
    "tool.execute.before": (input, output) => {
      if (input.tool === "shell") output.args.command = `rewritten(${output.args.command})`;
      if (input.tool === "blocked") throw new Error("denied");
    },
    "shell.env": (_input, output) => {
      output.env.PLANNOTATOR_SHARE = "disabled";
    },
    "chat.message": (_input, output) => {
      for (const part of output.parts) part.text = part.text.replace("SECRET", "[redacted]");
    },
    "command.execute.before": (input, output) => {
      if (input.command === "probe") output.parts.push({ type: "text", text: "CTX-ADDED" });
      if (input.command === "exact") output.parts.push({ type: "text", text: "CTX-EXACT" });
    },
    tool: {
      synthetic_status: {
        description: "Synthetic status",
        execute: async (args) => ({ output: `status:${args.filter || ""}`, metadata: { repoCount: 1 } }),
      },
    },
    event: async ({ event }) => {
      calls.events.push(event);
    },
  });

  const { createV2Plugin } = await import("../lib/v2-plugin-adapter.mjs");
  const { ctx, hooks, state, events } = createFakeContext(root);
  const plugin = createV2Plugin({
    id: "synthetic",
    factory,
    toolSchemas: { synthetic_status: { type: "object", properties: { filter: { type: "string" } }, additionalProperties: false } },
  });
  await plugin.setup(ctx);

  const toolEvent = { tool: "shell", sessionID: "ses_1", id: "call_1", input: { command: "ls" } };
  await hooks.tool["execute.before"](toolEvent);
  assert.equal(toolEvent.input.command, "rewritten(ls)");

  const blockedEvent = { tool: "blocked", sessionID: "ses_1", id: "call_2", input: {} };
  await assert.rejects(() => hooks.tool["execute.before"](blockedEvent), /denied/);

  const shellEvent = { command: "ls", cwd: root, timeout: 1000, shell: "bash", env: {} };
  await hooks.shell["create.before"](shellEvent);
  assert.equal(shellEvent.env.PLANNOTATOR_SHARE, "disabled");

  const promptEvent = { sessionID: "ses_1", messageID: "msg_1", prompt: { text: "hello SECRET" }, delivery: "steer" };
  await hooks.session.prompt(promptEvent);
  assert.equal(promptEvent.prompt.text, "hello [redacted]");

  const commandEvent = { sessionID: "ses_1", messageID: "msg_2", prompt: { text: "PROBE-CTX ARG-1 tail" }, delivery: "steer" };
  await hooks.session.prompt(commandEvent);
  assert.ok(commandEvent.prompt.text.startsWith("CTX-ADDED\n\n"));
  assert.ok(commandEvent.prompt.text.endsWith("PROBE-CTX ARG-1 tail"));

  const exactEvent = { sessionID: "ses_1", messageID: "msg_3", prompt: { text: "EXACT-BODY\n\nwith args" }, delivery: "steer" };
  await hooks.session.prompt(exactEvent);
  assert.ok(exactEvent.prompt.text.startsWith("CTX-EXACT\n\n"));

  assert.equal(state.tools.length, 1);
  assert.equal(state.tools[0].name, "synthetic_status");
  assert.deepEqual(state.tools[0].input, { type: "object", properties: { filter: { type: "string" } }, additionalProperties: false });
  const toolResult = await state.tools[0].execute({ filter: "hu" });
  assert.equal(toolResult.content, "status:hu");
  assert.deepEqual(toolResult.metadata, { repoCount: 1 });

  state.messages = [{
    id: "assistant_1",
    role: "assistant",
    sessionID: "ses_1",
    providerID: "synthetic",
    modelID: "model-1",
    cost: 0.25,
    tokens: { input: 100, output: 20, reasoning: 0, cache: { read: 300, write: 0 } },
    time: { completed: Date.now() },
  }];
  events.push({ type: "session.execution.succeeded", data: { sessionID: "ses_1" } });
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(calls.events.length, 1);
  assert.equal(calls.events[0].type, "message.updated");
  assert.equal(calls.events[0].properties.info.id, "assistant_1");
  assert.equal(calls.events[0].properties.info.tokens.cache.read, 300);

  events.push({ type: "session.execution.succeeded", data: { sessionID: "ses_1" } });
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(calls.events.length, 1, "duplicate assistant message must not be re-emitted");
});

test("command matcher handles mid-template arguments, exact bodies, and alias collisions", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "v2-matcher-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.writeFile(path.join(root, "opencode.json"), JSON.stringify({
    command: {
      "probe:mid": { template: "prefix $ARGUMENTS suffix" },
      "probe:exact": { template: "EXACT-BODY" },
      "probe:alias-a": { template: "Shared alias template" },
      "probe:alias-b": { template: "Shared alias template" },
    },
  }));

  const { buildCommandMatchers, matchCommand } = await import("../lib/v2-plugin-adapter.mjs");
  const matchers = buildCommandMatchers(root);

  assert.deepEqual(matchCommand(matchers, "prefix ARG-1 suffix"), { name: "probe:mid", arguments: "ARG-1" });
  assert.deepEqual(matchCommand(matchers, "prefix two words here suffix"), { name: "probe:mid", arguments: "two words here" });
  assert.deepEqual(matchCommand(matchers, "EXACT-BODY"), { name: "probe:exact", arguments: "" });
  assert.deepEqual(matchCommand(matchers, "EXACT-BODY\n\nwith extra user text"), { name: "probe:exact", arguments: "with extra user text" });
  assert.equal(matchCommand(matchers, "unrelated user prompt"), null);
  // Identical templates (governed aliases) resolve to the first declared
  // command; both alias names route through the same generic handler.
  assert.equal(matchCommand(matchers, "Shared alias template").name, "probe:alias-a");
});

test("compaction and context hooks forward V1 output into V2 event parts", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "v2-compaction-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.writeFile(path.join(root, "opencode.json"), JSON.stringify({ command: {} }));

  const factory = () => ({
    "experimental.chat.system.transform": (_input, output) => {
      output.system.push("CTX-SYSTEM");
    },
    "experimental.session.compacting": (_input, output) => {
      output.context.push("CTX-COMPACT-A", { text: "CTX-COMPACT-B" });
    },
  });

  const { createV2Plugin } = await import("../lib/v2-plugin-adapter.mjs");
  const { ctx, hooks } = createFakeContext(root);
  const plugin = createV2Plugin({ id: "synthetic-hooks", factory });
  await plugin.setup(ctx);

  const contextEvent = { sessionID: "ses_1", agent: "fiad", model: { providerID: "p", id: "m" }, system: [] };
  await hooks.session.context(contextEvent);
  assert.deepEqual(contextEvent.system, [{ type: "text", text: "CTX-SYSTEM" }]);

  const compactionEvent = { sessionID: "ses_1", agent: "fiad", model: { providerID: "p", id: "m" }, system: [] };
  await hooks.session.compaction(compactionEvent);
  assert.deepEqual(compactionEvent.system, [
    { type: "text", text: "CTX-COMPACT-A" },
    { type: "text", text: "CTX-COMPACT-B" },
  ]);
});
