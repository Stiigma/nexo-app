"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { createBudgetGuard } = require("../lib/nexo-budget-guard.cjs");

const FIXED_NOW = new Date("2026-07-07T17:00:00.000Z");

async function makeRoot(policyPatch = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-budget-guard-"));
  await fs.mkdir(path.join(root, "harness/control/state"), { recursive: true });
  await fs.mkdir(path.join(root, "harness/control/reports"), { recursive: true });
  await fs.writeFile(
    path.join(root, "harness/control/tasks.md"),
    [
      "| ID | Status | Priority | Title | Plan | Latest report | Closeout | Next step |",
      "| --- | --- | --- | --- | --- | --- | --- | --- |",
      "| NEXO-9999 | active | P0 | Synthetic Active Task | `plans/NEXO-9999.md` | _none_ | _none_ | Continue. |",
      "| NEXO-9998 | active | P1 | Other Active Task | `plans/NEXO-9998.md` | _none_ | _none_ | Continue separately. |",
      "",
    ].join("\n"),
  );
  const policy = {
    currency: "USD",
    limits: {
      session: { soft: 0.4, hard: 0.5 },
      task: { soft: 2, hard: 2.5 },
      ...policyPatch.limits,
    },
    behavior: {
      request_handoff_on_soft: true,
      abort_on_hard: true,
      minimum_handoff_margin_usd: 0.05,
      abort_when_handoff_margin_exhausted: true,
      ...policyPatch.behavior,
    },
    paths: {
      ledger: ".opencode/state/budget-ledger.json",
      bindings: ".opencode/state/session-bindings.json",
      focus: "harness/control/state/focus.json",
      tasks: "harness/control/tasks.md",
      reports: "harness/control/reports",
    },
  };
  await fs.writeFile(
    path.join(root, "harness/control/state/budget-policy.json"),
    `${JSON.stringify(policy, null, 2)}\n`,
  );
  return root;
}

function assistantMessage({ id, sessionID = "session-1", cost, completed = true }) {
  return {
    type: "message.updated",
    properties: {
      info: {
        id,
        sessionID,
        role: "assistant",
        parentID: "parent",
        modelID: "synthetic-model",
        providerID: "synthetic-provider",
        mode: "build",
        path: { cwd: "/tmp", root: "/tmp" },
        cost,
        tokens: {
          input: 10,
          output: 20,
          reasoning: 3,
          cache: { read: 4, write: 5 },
        },
        time: completed
          ? { created: FIXED_NOW.getTime() - 1000, completed: FIXED_NOW.getTime() }
          : { created: FIXED_NOW.getTime() - 1000 },
      },
    },
  };
}

function makeClient() {
  const prompts = [];
  const aborts = [];
  return {
    prompts,
    aborts,
    client: {
      session: {
        promptAsync: async (input) => {
          prompts.push(input);
        },
        abort: async (input) => {
          aborts.push(input);
        },
      },
    },
  };
}

async function readLedger(root) {
  return JSON.parse(
    await fs.readFile(path.join(root, ".opencode/state/budget-ledger.json"), "utf8"),
  );
}

async function bind(guard, sessionID = "session-1", taskID = "NEXO-9999", command = "nexo:build") {
  const output = { parts: [] };
  await guard.commandBefore({ command, sessionID, arguments: taskID }, output);
  assert.equal(output.parts.length, 1);
  assert.match(output.parts[0].text, new RegExp(taskID));
}

test("counts each completed assistant message once and ignores incomplete messages", async (t) => {
  const root = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const { client, prompts, aborts } = makeClient();
  const guard = createBudgetGuard({ rootDir: root, client, now: () => FIXED_NOW });
  await bind(guard);

  await guard.event({ event: assistantMessage({ id: "msg-1", cost: 0.25 }) });
  await guard.event({ event: assistantMessage({ id: "msg-1", cost: 0.25 }) });
  await guard.event({ event: assistantMessage({ id: "msg-incomplete", cost: 0.25, completed: false }) });

  const ledger = await readLedger(root);
  assert.equal(ledger.sessions["session-1"].cost, 0.25);
  assert.equal(ledger.tasks["NEXO-9999"].cost, 0.25);
  assert.equal(ledger.bindings["session-1"].taskID, "NEXO-9999");
  assert.equal(ledger.models["synthetic-provider/synthetic-model"].cost, 0.25);
  assert.equal(ledger.agents.nexo.tokens.reasoning, 3);
  assert.equal(ledger.phases.build.tokens.cache.read, 4);
  assert.deepEqual(Object.keys(ledger.messages), ["msg-1"]);
  assert.equal(prompts.length, 0);
  assert.equal(aborts.length, 0);
});

test("requests one soft-limit handoff for the session threshold", async (t) => {
  const root = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const { client, prompts, aborts } = makeClient();
  const guard = createBudgetGuard({ rootDir: root, client, now: () => FIXED_NOW });
  await bind(guard);

  await guard.event({ event: assistantMessage({ id: "msg-1", cost: 0.25 }) });
  await guard.event({ event: assistantMessage({ id: "msg-2", cost: 0.15 }) });
  await guard.event({ event: assistantMessage({ id: "msg-3", cost: 0.01 }) });

  const ledger = await readLedger(root);
  assert.equal(ledger.sessions["session-1"].cost, 0.41);
  assert.ok(ledger.sessions["session-1"].softLimitTriggeredAt);
  assert.ok(ledger.sessions["session-1"].handoffRequestedAt);
  assert.equal(prompts.length, 1);
  assert.match(prompts[0].body.parts[0].text, /Session spend: \$0\.4000/);
  assert.equal(aborts.length, 0);
});

test("aborts at the session hard limit and writes an automatic report", async (t) => {
  const root = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const { client, prompts, aborts } = makeClient();
  const guard = createBudgetGuard({ rootDir: root, client, now: () => FIXED_NOW });
  await bind(guard);

  await guard.event({ event: assistantMessage({ id: "msg-hard", cost: 0.5 }) });

  const ledger = await readLedger(root);
  assert.ok(ledger.sessions["session-1"].hardLimitTriggeredAt);
  assert.equal(prompts.length, 0);
  assert.equal(aborts.length, 1);
  assert.equal(aborts[0].path.id, "session-1");
  assert.match(ledger.sessions["session-1"].autoReport, /^harness\/control\/reports\/2026-07-07\/NEXO-9999-budget-hard-limit-/);
  await fs.access(path.join(root, ledger.sessions["session-1"].autoReport));
});

test("tracks task totals across sessions and triggers task soft then hard limits", async (t) => {
  const root = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const { client, prompts, aborts } = makeClient();
  const guard = createBudgetGuard({ rootDir: root, client, now: () => FIXED_NOW });

  for (let index = 1; index <= 6; index += 1) {
    await bind(guard, `session-${index}`);
    await guard.event({
      event: assistantMessage({
        id: `task-soft-${index}`,
        sessionID: `session-${index}`,
        cost: 0.39,
      }),
    });
  }
  let ledger = await readLedger(root);
  assert.equal(ledger.tasks["NEXO-9999"].cost, 2.34);
  assert.ok(ledger.tasks["NEXO-9999"].softLimitTriggeredAt);
  assert.equal(prompts.length, 1);
  assert.equal(aborts.length, 0);

  await bind(guard, "session-7");
  await guard.event({
    event: assistantMessage({
      id: "task-hard-7",
      sessionID: "session-7",
      cost: 0.39,
    }),
  });
  ledger = await readLedger(root);
  assert.equal(ledger.tasks["NEXO-9999"].cost, 2.73);
  assert.ok(ledger.tasks["NEXO-9999"].hardLimitTriggeredAt);
  assert.equal(prompts.length, 1);
  assert.equal(aborts.length, 1);
});

test("injects budget state into compaction context", async (t) => {
  const root = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const { client } = makeClient();
  const guard = createBudgetGuard({ rootDir: root, client, now: () => FIXED_NOW });
  await bind(guard);

  await guard.event({ event: assistantMessage({ id: "msg-1", cost: 0.2 }) });
  const output = { context: [] };
  await guard.compacting({ sessionID: "session-1" }, output);

  assert.equal(output.context.length, 1);
  assert.match(output.context[0], /Nexo budget state/);
  assert.match(output.context[0], /NEXO-9999/);
  assert.match(output.context[0], /budget-ledger\.json/);
});

test("does not guess a task for an unbound session when several tasks are active", async (t) => {
  const root = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const { client } = makeClient();
  const guard = createBudgetGuard({ rootDir: root, client, now: () => FIXED_NOW });

  await guard.event({ event: assistantMessage({ id: "unbound", sessionID: "no-command", cost: 0.1 }) });

  const ledger = await readLedger(root);
  assert.equal(ledger.tasks.UNBOUND_SESSION.cost, 0.1);
  assert.equal(ledger.tasks["NEXO-9999"], undefined);
  assert.equal(ledger.tasks["NEXO-9998"], undefined);
});

test("keeps concurrent session costs on their explicit task bindings", async (t) => {
  const root = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const { client } = makeClient();
  const guard = createBudgetGuard({ rootDir: root, client, now: () => FIXED_NOW });
  await bind(guard, "session-a", "NEXO-9999", "nexo:build");
  await bind(guard, "session-b", "NEXO-9998", "nexo:qa");

  await guard.event({ event: assistantMessage({ id: "task-a", sessionID: "session-a", cost: 0.12 }) });
  await guard.event({ event: assistantMessage({ id: "task-b", sessionID: "session-b", cost: 0.08 }) });

  const ledger = await readLedger(root);
  assert.equal(ledger.tasks["NEXO-9999"].cost, 0.12);
  assert.equal(ledger.tasks["NEXO-9998"].cost, 0.08);
  assert.equal(ledger.agents.nexo.cost, 0.2);
  assert.equal(ledger.phases.build.cost, 0.12);
  assert.equal(ledger.phases.qa.cost, 0.08);
  assert.equal(ledger.phases.build.cost, 0.12);
  assert.equal(ledger.phases.qa.cost, 0.08);
});

test("records content-free tool counts and duration in the existing ledger", async (t) => {
  const root = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  let elapsed = 1_000;
  const guard = createBudgetGuard({
    rootDir: root,
    now: () => FIXED_NOW,
    clock: () => elapsed,
  });
  await bind(guard);

  const input = {
    tool: "bash",
    sessionID: "session-1",
    callID: "call-1",
    args: { command: "contains-sensitive-content" },
  };
  guard.toolBefore(input);
  elapsed = 1_137;
  await guard.toolAfter(input, {
    title: "sensitive title",
    output: "sensitive output",
    metadata: { secret: "sensitive metadata" },
  });
  await guard.toolAfter(input, { output: "duplicate" });

  const ledger = await readLedger(root);
  assert.equal(ledger.version, 3);
  assert.deepEqual(ledger.sessions["session-1"].toolCalls, {
    total: 1,
    durationMs: 137,
    byTool: { bash: { count: 1, durationMs: 137 } },
  });
  assert.equal(ledger.tasks["NEXO-9999"].toolCalls.total, 1);
  assert.equal(ledger.tools.bash.total, 1);
  assert.equal(Object.keys(ledger.toolCalls).length, 1);
  const serialized = JSON.stringify(ledger);
  assert.doesNotMatch(serialized, /contains-sensitive-content|sensitive title|sensitive output|sensitive metadata|duplicate/);
});

test("serializes tool and message ledger writes without losing either update", async (t) => {
  const root = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const guard = createBudgetGuard({ rootDir: root, now: () => FIXED_NOW });
  await bind(guard);

  guard.toolBefore({ tool: "read", sessionID: "session-1", callID: "call-1" });
  await Promise.all([
    guard.toolAfter({ tool: "read", sessionID: "session-1", callID: "call-1" }),
    guard.event({ event: assistantMessage({ id: "msg-1", cost: 0.1 }) }),
  ]);

  const ledger = await readLedger(root);
  assert.equal(ledger.sessions["session-1"].cost, 0.1);
  assert.equal(ledger.sessions["session-1"].toolCalls.total, 1);
});
