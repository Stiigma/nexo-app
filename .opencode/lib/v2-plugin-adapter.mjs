// V2 plugin adapter — runs legacy (V1-style) plugin factories on the OpenCode V2 plugin API.
//
// Why: V1 plugin implementations do not run on V2. This adapter calls the existing
// factory (returning V1 hooks) and translates V1 hook contracts to V2 registrations.
// The plugin logic files stay untouched, so the V1 rollback runtime keeps working.
//
// Mapping notes (V1 -> V2):
//   tool.execute.before   -> ctx.tool.hook("execute.before")      (event.input is written back)
//   tool.execute.after    -> ctx.tool.hook("execute.after")
//   shell.env             -> ctx.shell.hook("create.before")      (event.env is written back)
//   chat.message          -> ctx.session.hook("prompt")           (prompt.text sanitization)
//   experimental.chat.system.transform -> ctx.session.hook("context")
//   experimental.session.compacting    -> ctx.session.hook("compaction")
//   event({event})        -> ctx.event.subscribe() + synthesized V1 "message.updated"
//                            from session.execution.succeeded (deduped by message id)
//   command.execute.before -> ctx.session.hook("prompt") matched against project command
//                            templates (V2 has no global command hook)
//   tool map              -> ctx.tool.transform(editor.add)
//
// Behavior differences to review: command guards only block prompts whose text matches
// the configured command templates; compaction `output.context` becomes extra system text.

import fs from "node:fs";
import path from "node:path";

function createClientShim(ctx) {
  return {
    app: {
      log: async (input) => {
        try {
          const body = input?.body ?? input;
          console.log(`[plugin] ${JSON.stringify(body)}`);
        } catch {
          /* logging is best-effort */
        }
      },
    },
    session: {
      promptAsync: async ({ path: target, body }) => {
        const sessionID = target?.id;
        if (!sessionID) return;
        const text = (body?.parts || []).map((part) => part?.text).filter((value) => typeof value === "string").join("\n");
        if (!text) return;
        await ctx.session.prompt({ sessionID, text });
      },
      abort: async ({ path: target }) => {
        const sessionID = target?.id;
        if (!sessionID) return;
        await ctx.session.interrupt({ sessionID, continue: false });
      },
    },
  };
}

function loadCommandTemplates(rootDir) {
  const candidates = ["opencode.json", "opencode.jsonc", ".opencode/opencode.json", ".opencode/opencode.jsonc"];
  for (const relative of candidates) {
    const file = path.join(rootDir, relative);
    try {
      const raw = fs.readFileSync(file, "utf8");
      const config = JSON.parse(raw);
      const map = config.commands || config.command;
      if (map && typeof map === "object") return map;
    } catch {
      /* keep looking */
    }
  }
  return {};
}

export function buildCommandMatchers(rootDir) {
  const templates = loadCommandTemplates(rootDir);
  return Object.entries(templates)
    .map(([name, definition]) => {
      const template = typeof definition === "string" ? definition : definition?.template;
      if (typeof template !== "string" || template.trim() === "") return null;
      const marker = "$ARGUMENTS";
      const index = template.indexOf(marker);
      if (index === -1) return { name, prefix: template, suffix: "", exactly: true };
      return {
        name,
        prefix: template.slice(0, index),
        suffix: template.slice(index + marker.length),
        exactly: false,
      };
    })
    .filter(Boolean);
}

export function matchCommand(matchers, text) {
  for (const matcher of matchers) {
    if (matcher.exactly) {
      if (text.trim() === matcher.prefix.trim()) return { name: matcher.name, arguments: "" };
      if (text.startsWith(matcher.prefix)) {
        const rest = text.slice(matcher.prefix.length).replace(/^\s+/, "");
        if (rest && !rest.includes("\n\n\n")) return { name: matcher.name, arguments: rest };
      }
      continue;
    }
    if (!text.startsWith(matcher.prefix)) continue;
    if (!text.endsWith(matcher.suffix)) continue;
    const start = matcher.prefix.length;
    const end = text.length - matcher.suffix.length;
    return { name: matcher.name, arguments: text.slice(start, end) };
  }
  return null;
}

function normalizeMessageInfo(info, sessionID) {
  if (!info || typeof info !== "object") return null;
  const tokens = info.tokens || {};
  return {
    id: info.id,
    role: info.role ?? (info.type === "assistant" ? "assistant" : info.type),
    sessionID: info.sessionID ?? sessionID,
    providerID: info.providerID ?? info.provider?.id,
    modelID: info.modelID ?? info.model?.id,
    agent: info.agent ?? info.mode,
    cost: Number(info.cost) || 0,
    tokens: {
      input: Number(tokens.input) || 0,
      output: Number(tokens.output) || 0,
      reasoning: Number(tokens.reasoning) || 0,
      cache: {
        read: Number(tokens.cache?.read) || 0,
        write: Number(tokens.cache?.write) || 0,
      },
    },
    time: {
      created: info.time?.created,
      completed: info.time?.completed,
    },
  };
}

function registerToolHooks(ctx, hooks) {
  if (hooks["tool.execute.before"]) {
    const hook = hooks["tool.execute.before"];
    return ctx.tool.hook("execute.before", async (event) => {
      const v1Input = { tool: event.tool, sessionID: event.sessionID, callID: event.id, agent: event.agent };
      const v1Output = { args: event.input };
      await hook(v1Input, v1Output);
      event.input = v1Output.args;
    });
  }
  return null;
}

function registerToolAfterHooks(ctx, hooks) {
  if (hooks["tool.execute.after"]) {
    const hook = hooks["tool.execute.after"];
    return ctx.tool.hook("execute.after", async (event) => {
      const v1Input = { tool: event.tool, sessionID: event.sessionID, callID: event.id };
      await hook(v1Input, event);
    });
  }
  return null;
}

function registerShellHooks(ctx, hooks) {
  if (hooks["shell.env"]) {
    const hook = hooks["shell.env"];
    return ctx.shell.hook("create.before", async (event) => {
      const v1Output = { env: event.env };
      await hook({}, v1Output);
      event.env = v1Output.env;
    });
  }
  return null;
}

function registerPromptHooks(ctx, hooks, matchers) {
  const chatMessage = hooks["chat.message"];
  const commandBefore = hooks["command.execute.before"];
  if (!chatMessage && !commandBefore) return null;

  return ctx.session.hook("prompt", async (event) => {
    if (chatMessage) {
      const part = { type: "text", text: event.prompt.text };
      const v1Output = { parts: [part] };
      await chatMessage({ sessionID: event.sessionID, messageID: event.messageID }, v1Output);
      const sanitized = (v1Output.parts || [])
        .filter((entry) => entry?.type === "text" && typeof entry.text === "string")
        .map((entry) => entry.text)
        .join("");
      if (sanitized !== event.prompt.text) event.prompt.text = sanitized;
    }

    if (commandBefore) {
      const matched = matchCommand(matchers, event.prompt.text);
      if (matched) {
        const v1Input = { command: matched.name, sessionID: event.sessionID, arguments: matched.arguments };
        const v1Output = { parts: [] };
        await commandBefore(v1Input, v1Output);
        const injected = (v1Output.parts || [])
          .filter((entry) => typeof entry?.text === "string" && entry.text)
          .map((entry) => entry.text)
          .join("\n\n");
        if (injected) event.prompt.text = `${injected}\n\n${event.prompt.text}`;
      }
    }
  });
}

function registerContextHooks(ctx, hooks) {
  if (hooks["experimental.chat.system.transform"]) {
    const hook = hooks["experimental.chat.system.transform"];
    return ctx.session.hook("context", async (event) => {
      const v1Output = { system: [] };
      await hook({ sessionID: event.sessionID, agent: event.agent, model: event.model }, v1Output);
      for (const entry of v1Output.system || []) {
        if (typeof entry === "string" && entry) event.system.push({ type: "text", text: entry });
        else if (entry && typeof entry === "object") event.system.push(entry);
      }
    });
  }
  return null;
}

function registerCompactionHooks(ctx, hooks) {
  if (hooks["experimental.session.compacting"]) {
    const hook = hooks["experimental.session.compacting"];
    return ctx.session.hook("compaction", async (event) => {
      const v1Output = { context: [] };
      await hook({ sessionID: event.sessionID, agent: event.agent, model: event.model }, v1Output);
      for (const entry of v1Output.context || []) {
        const text = typeof entry === "string" ? entry : entry?.text;
        if (typeof text === "string" && text) event.system.push({ type: "text", text });
      }
    });
  }
  return null;
}

function registerEventBridge(ctx, hooks) {
  if (!hooks.event) return null;
  const hook = hooks.event;
  const controller = new AbortController();
  const emitted = new Set();

  (async () => {
    try {
      for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
        const type = event?.type;
        if (type !== "session.execution.succeeded" && type !== "session.idle") continue;
        const sessionID = event?.data?.sessionID;
        if (!sessionID) continue;
        let messages = [];
        try {
          messages = await ctx.session.context({ sessionID });
        } catch {
          continue;
        }
        for (const message of messages) {
          const info = normalizeMessageInfo(message, sessionID);
          if (!info || info.role !== "assistant") continue;
          if (!Number.isFinite(Number(info.time?.completed))) continue;
          const key = `${sessionID}:${info.id}`;
          if (emitted.has(key)) continue;
          emitted.add(key);
          try {
            await hook({ event: { type: "message.updated", properties: { info } } });
          } catch {
            /* plugin event handlers must never break the bridge */
          }
        }
      }
    } catch {
      /* aborted subscription */
    }
  })();

  return () => controller.abort();
}

function defaultInputSchema() {
  return { type: "object", properties: {}, additionalProperties: true };
}

function registerTools(ctx, hooks, schemaOverrides) {
  const toolMap = hooks.tool;
  if (!toolMap || typeof toolMap !== "object") return null;
  const entries = Object.entries(toolMap);
  if (entries.length === 0) return null;
  return ctx.tool.transform((editor) => {
    for (const [name, definition] of entries) {
      if (!definition || typeof definition !== "object") continue;
      editor.add({
        name,
        description: definition.description || name,
        input: schemaOverrides[name] || defaultInputSchema(),
        async execute(input) {
          const result = await definition.execute(input || {});
          if (typeof result === "string") return { content: result };
          if (Array.isArray(result)) return { content: result };
          if (result && typeof result === "object") {
            return { content: result.output ?? result.content ?? "", metadata: result.metadata };
          }
          return { content: String(result ?? "") };
        },
      });
    }
  });
}

export function createV2Plugin({ id, factory, options = {}, toolSchemas = {} }) {
  return {
    id,
    async setup(ctx) {
      const v1Input = {
        directory: ctx.location?.directory,
        worktree: ctx.location?.directory,
        client: createClientShim(ctx),
        project: ctx.location?.project,
      };
      const hooks = (await factory(v1Input, options)) || {};
      const matchers = buildCommandMatchers(ctx.location?.directory || process.cwd());

      await registerToolHooks(ctx, hooks);
      await registerToolAfterHooks(ctx, hooks);
      await registerShellHooks(ctx, hooks);
      await registerPromptHooks(ctx, hooks, matchers);
      await registerContextHooks(ctx, hooks);
      await registerCompactionHooks(ctx, hooks);
      const disposeEvents = registerEventBridge(ctx, hooks);
      await registerTools(ctx, hooks, toolSchemas);

      return () => {
        if (typeof disposeEvents === "function") disposeEvents();
      };
    },
  };
}
