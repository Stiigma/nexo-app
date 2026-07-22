"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

const DEFAULT_POLICY = {
  currency: "USD",
  limits: {
    session: { soft: 0.4, hard: 0.5 },
    task: { soft: 2, hard: 2.5 },
  },
  behavior: {
    request_handoff_on_soft: true,
    abort_on_hard: true,
    minimum_handoff_margin_usd: 0.05,
    abort_when_handoff_margin_exhausted: true,
  },
  paths: {
    ledger: ".opencode/state/budget-ledger.json",
    bindings: ".opencode/state/session-bindings.json",
    focus: "harness/control/state/focus.json",
    tasks: "harness/control/tasks.md",
    reports: "harness/control/reports",
  },
};

function nowIso(now) {
  return now().toISOString();
}

function localDate(now) {
  const date = now();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function fileStamp(now) {
  return now().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function money(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function addMoney(left, right) {
  return Number((money(left) + money(right)).toFixed(8));
}

function emptyTokens() {
  return {
    input: 0,
    output: 0,
    reasoning: 0,
    cache: {
      read: 0,
      write: 0,
    },
  };
}

function emptyToolCalls() {
  return {
    total: 0,
    durationMs: 0,
    byTool: {},
  };
}

function normalizeTokens(tokens) {
  return {
    input: Number(tokens?.input) || 0,
    output: Number(tokens?.output) || 0,
    reasoning: Number(tokens?.reasoning) || 0,
    cache: {
      read: Number(tokens?.cache?.read) || 0,
      write: Number(tokens?.cache?.write) || 0,
    },
  };
}

function addTokens(left, right) {
  const normalized = normalizeTokens(right);
  left.input += normalized.input;
  left.output += normalized.output;
  left.reasoning += normalized.reasoning;
  left.cache.read += normalized.cache.read;
  left.cache.write += normalized.cache.write;
  return left;
}

function mergePolicy(raw) {
  return {
    ...DEFAULT_POLICY,
    ...raw,
    limits: {
      session: {
        ...DEFAULT_POLICY.limits.session,
        ...raw?.limits?.session,
      },
      task: {
        ...DEFAULT_POLICY.limits.task,
        ...raw?.limits?.task,
      },
    },
    behavior: {
      ...DEFAULT_POLICY.behavior,
      ...raw?.behavior,
    },
    paths: {
      ...DEFAULT_POLICY.paths,
      ...raw?.paths,
    },
  };
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error && error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
}

function newLedger(policy, now) {
  const createdAt = nowIso(now);
  return {
    version: 3,
    currency: policy.currency,
    createdAt,
    updatedAt: createdAt,
    messages: {},
    sessions: {},
    tasks: {},
    bindings: {},
    models: {},
    agents: {},
    phases: {},
    toolCalls: {},
    tools: {},
  };
}

function ensureLedgerShape(ledger, policy, now) {
  const shaped = ledger && typeof ledger === "object" ? ledger : newLedger(policy, now);
  shaped.version = 3;
  shaped.currency = shaped.currency || policy.currency;
  shaped.createdAt = shaped.createdAt || nowIso(now);
  shaped.updatedAt = shaped.updatedAt || shaped.createdAt;
  shaped.messages = shaped.messages || {};
  shaped.sessions = shaped.sessions || {};
  shaped.tasks = shaped.tasks || {};
  shaped.bindings = shaped.bindings || {};
  shaped.models = shaped.models || {};
  shaped.agents = shaped.agents || {};
  shaped.phases = shaped.phases || {};
  shaped.toolCalls = shaped.toolCalls || {};
  shaped.tools = shaped.tools || {};
  return shaped;
}

function ensureScope(map, id, now) {
  if (!map[id]) {
    map[id] = {
      id,
      cost: 0,
      tokens: emptyTokens(),
      messageIDs: [],
      createdAt: nowIso(now),
      updatedAt: nowIso(now),
    };
  }
  return map[id];
}

function parseTaskRows(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => /^\|\s*(?:NEXO|FIAD)-\d+\s*\|/.test(line))
    .map((line) => {
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim());
      return {
        id: cells[0],
        status: cells[1],
        priority: cells[2],
        title: cells[3],
        plan: cells[4]?.replace(/`/g, ""),
      };
    });
}

async function readTasks(rootDir, policy) {
  const tasksPath = path.join(rootDir, policy.paths.tasks);
  try {
    return parseTaskRows(await fs.readFile(tasksPath, "utf8"));
  } catch (error) {
    if (error && error.code === "ENOENT") return [];
    throw error;
  }
}

async function readTask(rootDir, policy, taskID) {
  if (!taskID || taskID === "UNBOUND_SESSION") return null;
  return (await readTasks(rootDir, policy)).find((task) => task.id === taskID) || null;
}

async function readFocusedTask(rootDir, policy) {
  const focus = await readJson(path.join(rootDir, policy.paths.focus), null);
  if (!focus?.taskId) return null;
  return readTask(rootDir, policy, focus.taskId);
}

function taskIDFromArguments(argumentsText = "") {
  return argumentsText.match(/\b(?:NEXO|FIAD)-\d{4}\b/)?.[0] || null;
}

function commandMetadata(command) {
  const action = command.split(":")[1] || "unknown";
  const phases = {
    resume: "operational",
    doctor: "qa",
    plan: "plan",
    spec: "spec",
    design: "design",
    build: "build",
    qa: "qa",
    security: "security",
    infra: "infra",
    handoff: "handoff",
    close: "closeout",
    bind: "operational",
  };
  return { agent: "nexo", phase: phases[action] || action };
}

function isCompletedAssistantMessage(info) {
  return (
    info &&
    info.role === "assistant" &&
    info.id &&
    info.sessionID &&
    info.time &&
    Number.isFinite(Number(info.time.completed))
  );
}

function summaryIdentity(info, binding) {
  return {
    model: [info.providerID, info.modelID].filter(Boolean).join("/") || "unknown",
    agent: binding?.agent || info.agent || info.mode || "unknown",
    phase: binding?.phase || info.mode || "unknown",
  };
}

function countSummary(map, id, cost, tokens, messageID, now) {
  const scope = ensureScope(map, id || "unknown", now);
  scope.cost = addMoney(scope.cost, cost);
  scope.tokens = addTokens(scope.tokens || emptyTokens(), tokens);
  scope.messageIDs.push(messageID);
  scope.updatedAt = nowIso(now);
  return scope;
}

function addToolSummary(scope, tool, durationMs) {
  scope.toolCalls = scope.toolCalls || emptyToolCalls();
  scope.toolCalls.total += 1;
  scope.toolCalls.durationMs += durationMs;
  const summary = scope.toolCalls.byTool[tool] || { count: 0, durationMs: 0 };
  summary.count += 1;
  summary.durationMs += durationMs;
  scope.toolCalls.byTool[tool] = summary;
}

function countToolCall(ledger, input, taskContext, binding, durationMs, now) {
  if (!input?.sessionID || !input.callID || !input.tool) return { counted: false };
  const key = JSON.stringify([input.sessionID, input.callID]);
  if (ledger.toolCalls[key]) return { counted: false };

  const completedAt = nowIso(now);
  const taskID = taskContext?.id || "UNBOUND_SESSION";
  const session = ensureScope(ledger.sessions, input.sessionID, now);
  const task = ensureScope(ledger.tasks, taskID, now);
  const tool = String(input.tool);
  const boundedDurationMs = Math.max(0, Math.round(Number(durationMs) || 0));

  ledger.toolCalls[key] = {
    callID: input.callID,
    sessionID: input.sessionID,
    taskID,
    tool,
    durationMs: boundedDurationMs,
    completedAt,
  };

  session.taskIDs = session.taskIDs || [];
  if (!session.taskIDs.includes(taskID)) session.taskIDs.push(taskID);
  session.currentTaskID = taskID;
  if (binding?.agent) session.agent = binding.agent;
  if (binding?.phase) session.phase = binding.phase;
  addToolSummary(session, tool, boundedDurationMs);
  session.updatedAt = completedAt;

  addToolSummary(task, tool, boundedDurationMs);
  task.updatedAt = completedAt;

  const toolSummary = ledger.tools[tool] || {
    id: tool,
    total: 0,
    durationMs: 0,
    createdAt: completedAt,
    updatedAt: completedAt,
  };
  toolSummary.total += 1;
  toolSummary.durationMs += boundedDurationMs;
  toolSummary.updatedAt = completedAt;
  ledger.tools[tool] = toolSummary;
  ledger.updatedAt = completedAt;

  return { counted: true, session, task, taskID };
}

function countMessage(ledger, info, taskContext, binding, now) {
  if (ledger.messages[info.id]) {
    return { counted: false };
  }

  const completedAt = Number(info.time.completed);
  const taskID = taskContext?.id || "UNBOUND_SESSION";
  const session = ensureScope(ledger.sessions, info.sessionID, now);
  const task = ensureScope(ledger.tasks, taskID, now);
  const cost = money(info.cost);
  const tokens = normalizeTokens(info.tokens);
  const countedAt = nowIso(now);
  const summary = summaryIdentity(info, binding);

  ledger.messages[info.id] = {
    id: info.id,
    sessionID: info.sessionID,
    taskID,
    cost,
    tokens,
    providerID: info.providerID,
    modelID: info.modelID,
    model: summary.model,
    agent: summary.agent,
    phase: summary.phase,
    completedAt,
    countedAt,
  };

  session.taskIDs = session.taskIDs || [];
  if (!session.taskIDs.includes(taskID)) session.taskIDs.push(taskID);
  session.currentTaskID = taskID;
  session.agent = summary.agent;
  session.phase = summary.phase;
  session.model = summary.model;
  session.cost = addMoney(session.cost, cost);
  session.tokens = addTokens(session.tokens || emptyTokens(), tokens);
  session.messageIDs.push(info.id);
  session.updatedAt = countedAt;

  task.cost = addMoney(task.cost, cost);
  task.tokens = addTokens(task.tokens || emptyTokens(), tokens);
  task.messageIDs.push(info.id);
  task.updatedAt = countedAt;

  countSummary(ledger.models, summary.model, cost, tokens, info.id, now);
  countSummary(ledger.agents, summary.agent, cost, tokens, info.id, now);
  countSummary(ledger.phases, summary.phase, cost, tokens, info.id, now);

  ledger.updatedAt = countedAt;

  return { counted: true, session, task, taskID };
}

function mark(scope, field, now, reason) {
  if (!scope[field]) {
    scope[field] = nowIso(now);
    scope.lastLimitReason = reason;
    return true;
  }
  return false;
}

function remainingHardBudget(policy, session, task) {
  return Math.min(
    policy.limits.session.hard - money(session?.cost),
    policy.limits.task.hard - money(task?.cost),
  );
}

function overLimit(scope, threshold) {
  return money(scope?.cost) >= money(threshold);
}

function formatUsd(value) {
  return `$${money(value).toFixed(4)}`;
}

function promptText({ policy, activeTask, session, task, scopes, reason }) {
  const taskLabel = activeTask ? `${activeTask.id} - ${activeTask.title}` : "UNBOUND_SESSION";
  return [
    `Nexo budget guard reached the ${reason} limit for ${scopes.join(", ")}.`,
    "",
    `Active task: ${taskLabel}`,
    `Session spend: ${formatUsd(session.cost)} / soft ${formatUsd(policy.limits.session.soft)} / hard ${formatUsd(policy.limits.session.hard)}`,
    `Task spend: ${formatUsd(task.cost)} / soft ${formatUsd(policy.limits.task.soft)} / hard ${formatUsd(policy.limits.task.hard)}`,
    "",
    "Stop implementation now. Create a continuity handoff or session report in harness/control/ that records what changed, verification performed, open risks, and the recommended next step. Do not continue feature work after that record is written.",
  ].join("\n");
}

async function createAutoReport({ rootDir, policy, activeTask, session, task, scopes, reason, now, messageID }) {
  const date = localDate(now);
  const taskID = activeTask?.id || "UNBOUND_SESSION";
  const reportDir = path.join(rootDir, policy.paths.reports, date);
  const suffix = messageID ? `-${String(messageID).slice(0, 8)}` : "";
  const reportPath = path.join(
    reportDir,
    `${taskID}-budget-${reason}-${fileStamp(now)}${suffix}.md`,
  );

  await fs.mkdir(reportDir, { recursive: true });
  await fs.writeFile(
    reportPath,
    [
      `# ${taskID} Budget ${reason} Report`,
      "",
      "## Metadata",
      "",
      `- Date: ${date}`,
      "- Agent: nexo-budget-guard",
      `- Task: ${activeTask ? `${activeTask.id} - ${activeTask.title}` : "UNBOUND_SESSION"}`,
      `- Status: automatic ${reason} budget report`,
      "",
      "## What Was Done",
      "",
      `- OpenCode budget guard created this minimal continuity report because ${scopes.join(", ")} reached a budget limit and there was not enough safe margin to request a model-written handoff.`,
      "",
      "## Budget State",
      "",
      `- Session: ${formatUsd(session.cost)} / soft ${formatUsd(policy.limits.session.soft)} / hard ${formatUsd(policy.limits.session.hard)}`,
      `- Task: ${formatUsd(task.cost)} / soft ${formatUsd(policy.limits.task.soft)} / hard ${formatUsd(policy.limits.task.hard)}`,
      `- Counted session messages: ${session.messageIDs.length}`,
      `- Counted task messages: ${task.messageIDs.length}`,
      "",
      "## Verification Performed",
      "",
      "- Budget state was derived from completed OpenCode assistant messages and persisted in `.opencode/state/budget-ledger.json`.",
      "",
      "## Open Items",
      "",
      "- A human or next agent should inspect the worktree and create a fuller handoff if this report was produced during active implementation.",
      "",
      "## Recommended Next Step",
      "",
      "- Resume from the latest control-plane state, then continue only after confirming the budget policy allows more work.",
      "",
    ].join("\n"),
  );

  return path.relative(rootDir, reportPath);
}

function relativePolicyState(policy, session, task, activeTask) {
  return {
    currency: policy.currency,
    activeTask: activeTask
      ? { id: activeTask.id, title: activeTask.title, status: activeTask.status }
      : null,
    session: {
      cost: money(session?.cost),
      soft: policy.limits.session.soft,
      hard: policy.limits.session.hard,
      messages: session?.messageIDs?.length || 0,
      softLimitTriggeredAt: session?.softLimitTriggeredAt,
      hardLimitTriggeredAt: session?.hardLimitTriggeredAt,
    },
    task: {
      cost: money(task?.cost),
      soft: policy.limits.task.soft,
      hard: policy.limits.task.hard,
      messages: task?.messageIDs?.length || 0,
      softLimitTriggeredAt: task?.softLimitTriggeredAt,
      hardLimitTriggeredAt: task?.hardLimitTriggeredAt,
    },
  };
}

function createBudgetGuard(options = {}) {
  const rootDir = options.rootDir || options.directory || process.cwd();
  const client = options.client;
  const now = options.now || (() => new Date());
  const clock = options.clock || (() => Date.now());
  const logger = options.logger || console;
  const policyFile = options.policyFile || path.join(rootDir, DEFAULT_POLICY.paths.tasks, "..", "state", "budget-policy.json");
  let queue = Promise.resolve();
  const toolStarts = new Map();

  async function enqueue(work, message) {
    queue = queue.then(work).catch((error) => {
      logger.error?.(message, error);
    });
    await queue;
  }

  async function loadPolicy() {
    return mergePolicy(await readJson(policyFile, DEFAULT_POLICY));
  }

  async function loadLedger(policy) {
    const ledgerFile = path.join(rootDir, policy.paths.ledger);
    return ensureLedgerShape(await readJson(ledgerFile, newLedger(policy, now)), policy, now);
  }

  async function saveLedger(policy, ledger) {
    await writeJson(path.join(rootDir, policy.paths.ledger), ledger);
  }

  async function loadBindings(policy) {
    const bindings = await readJson(path.join(rootDir, policy.paths.bindings), null);
    if (!bindings || typeof bindings !== "object" || typeof bindings.sessions !== "object") {
      return { version: 1, sessions: {} };
    }
    return { version: 1, sessions: bindings.sessions };
  }

  async function saveBindings(policy, bindings) {
    await writeJson(path.join(rootDir, policy.paths.bindings), bindings);
  }

  async function bindSession({ sessionID, taskID, command, agent, phase }) {
    if (!sessionID) throw new Error("session binding requires a sessionID");
    const policy = await loadPolicy();
    const task = await readTask(rootDir, policy, taskID);
    if (!task) throw new Error(`cannot bind ${sessionID}: task ${taskID} is not registered`);
    const bindings = await loadBindings(policy);
    const binding = {
      sessionID,
      taskID: task.id,
      taskTitle: task.title,
      command,
      agent,
      phase,
      boundAt: nowIso(now),
    };
    bindings.sessions[sessionID] = binding;
    await saveBindings(policy, bindings);
    return { binding, task };
  }

  async function bindingForSession(policy, sessionID) {
    const bindings = await loadBindings(policy);
    return bindings.sessions[sessionID] || null;
  }

  async function requestHandoff(sessionID, text) {
    if (!client?.session?.promptAsync) return;
    await client.session.promptAsync({
      path: { id: sessionID },
      query: { directory: rootDir },
      body: {
        parts: [{ type: "text", text }],
      },
    });
  }

  async function abortSession(sessionID) {
    if (!client?.session?.abort) return;
    await client.session.abort({
      path: { id: sessionID },
      query: { directory: rootDir },
    });
  }

  async function enforce(policy, ledger, info, activeTask, session, task) {
    const hardScopes = [];
    const softScopes = [];

    if (overLimit(session, policy.limits.session.hard) && mark(session, "hardLimitTriggeredAt", now, "session hard limit")) {
      hardScopes.push("session");
    }
    if (overLimit(task, policy.limits.task.hard) && mark(task, "hardLimitTriggeredAt", now, "task hard limit")) {
      hardScopes.push("task");
    }

    if (hardScopes.length > 0) {
      const report = await createAutoReport({
        rootDir,
        policy,
        activeTask,
        session,
        task,
        scopes: hardScopes,
        reason: "hard-limit",
        now,
        messageID: info.id,
      });
      session.autoReport = report;
      task.autoReport = report;
      ledger.updatedAt = nowIso(now);
      await saveLedger(policy, ledger);
      if (policy.behavior.abort_on_hard) {
        await abortSession(info.sessionID);
      }
      return;
    }

    if (
      policy.behavior.request_handoff_on_soft &&
      overLimit(session, policy.limits.session.soft) &&
      !session.handoffRequestedAt &&
      mark(session, "softLimitTriggeredAt", now, "session soft limit")
    ) {
      softScopes.push("session");
    }
    if (
      policy.behavior.request_handoff_on_soft &&
      overLimit(task, policy.limits.task.soft) &&
      !task.handoffRequestedAt &&
      mark(task, "softLimitTriggeredAt", now, "task soft limit")
    ) {
      softScopes.push("task");
    }

    if (softScopes.length === 0) {
      await saveLedger(policy, ledger);
      return;
    }

    const remaining = remainingHardBudget(policy, session, task);
    if (remaining <= money(policy.behavior.minimum_handoff_margin_usd)) {
      const report = await createAutoReport({
        rootDir,
        policy,
        activeTask,
        session,
        task,
        scopes: softScopes,
        reason: "soft-limit-no-margin",
        now,
        messageID: info.id,
      });
      session.autoReport = report;
      task.autoReport = report;
      session.handoffRequestedAt = session.handoffRequestedAt || nowIso(now);
      task.handoffRequestedAt = task.handoffRequestedAt || nowIso(now);
      ledger.updatedAt = nowIso(now);
      await saveLedger(policy, ledger);
      if (policy.behavior.abort_when_handoff_margin_exhausted) {
        await abortSession(info.sessionID);
      }
      return;
    }

    session.handoffRequestedAt = session.handoffRequestedAt || nowIso(now);
    task.handoffRequestedAt = task.handoffRequestedAt || nowIso(now);
    ledger.updatedAt = nowIso(now);
    await saveLedger(policy, ledger);
    await requestHandoff(
      info.sessionID,
      promptText({ policy, activeTask, session, task, scopes: softScopes, reason: "soft" }),
    );
  }

  async function commandBefore(input, output) {
    const command = input?.command || "";
    if (!command.startsWith("nexo:")) return;
    const policy = await loadPolicy();
    let taskID = taskIDFromArguments(input.arguments || "");
    if (!taskID) {
      if (command === "nexo:bind") {
        throw new Error("nexo:bind requires an explicit NEXO-0000 or FIAD-0000 task ID");
      }
      taskID = (await readFocusedTask(rootDir, policy))?.id || null;
    }
    if (!taskID) {
      throw new Error(`${command} cannot bind its session because focus.json has no registered task`);
    }
    const metadata = commandMetadata(command);
    const { binding } = await bindSession({
      sessionID: input.sessionID,
      taskID,
      command,
      ...metadata,
    });
    output.parts = output.parts || [];
    output.parts.push({
      type: "text",
      text: `Budget binding: ${binding.taskID}; agent=${binding.agent}; phase=${binding.phase}.`,
      synthetic: true,
    });
  }

  async function handleMessageUpdated(event) {
    if (event?.type !== "message.updated") return;
    const info = event.properties?.info;
    if (!isCompletedAssistantMessage(info)) return;

    const policy = await loadPolicy();
    const ledger = await loadLedger(policy);
    const binding = await bindingForSession(policy, info.sessionID);
    const activeTask = binding ? await readTask(rootDir, policy, binding.taskID) : null;
    if (binding && !activeTask) {
      logger.error?.(`[nexo-budget-guard] registered binding points to missing task ${binding.taskID}`);
    }
    if (binding) ledger.bindings[info.sessionID] = binding;
    const counted = countMessage(ledger, info, activeTask, binding, now);
    if (!counted.counted) return;

    await enforce(policy, ledger, info, activeTask, counted.session, counted.task);
  }

  function toolBefore(input) {
    if (!input?.sessionID || !input.callID || !input.tool) return;
    toolStarts.set(JSON.stringify([input.sessionID, input.callID]), clock());
  }

  async function handleToolAfter(input) {
    if (!input?.sessionID || !input.callID || !input.tool) return;
    const key = JSON.stringify([input.sessionID, input.callID]);
    const completed = clock();
    const started = toolStarts.get(key);
    toolStarts.delete(key);

    const policy = await loadPolicy();
    const ledger = await loadLedger(policy);
    const binding = await bindingForSession(policy, input.sessionID);
    const activeTask = binding ? await readTask(rootDir, policy, binding.taskID) : null;
    if (binding && !activeTask) {
      logger.error?.(`[nexo-budget-guard] registered binding points to missing task ${binding.taskID}`);
    }
    if (binding) ledger.bindings[input.sessionID] = binding;
    const counted = countToolCall(
      ledger,
      input,
      activeTask,
      binding,
      started === undefined ? 0 : completed - started,
      now,
    );
    if (counted.counted) await saveLedger(policy, ledger);
  }

  async function toolAfter(input) {
    await enqueue(
      () => handleToolAfter(input),
      "[nexo-budget-guard] failed to process tool telemetry",
    );
  }

  async function event(input) {
    await enqueue(
      () => handleMessageUpdated(input.event),
      "[nexo-budget-guard] failed to process event",
    );
  }

  async function compacting(input, output) {
    try {
      const policy = await loadPolicy();
      const ledger = await loadLedger(policy);
      const binding = await bindingForSession(policy, input.sessionID);
      const activeTask = binding ? await readTask(rootDir, policy, binding.taskID) : null;
      const taskID = activeTask?.id || "UNBOUND_SESSION";
      const session = ledger.sessions[input.sessionID] || ensureScope(ledger.sessions, input.sessionID, now);
      const task = ledger.tasks[taskID] || ensureScope(ledger.tasks, taskID, now);
      const state = relativePolicyState(policy, session, task, activeTask);
      state.binding = binding;

      output.context.push(
        [
          "Nexo budget state:",
          JSON.stringify(state, null, 2),
          "Budget ledger path: .opencode/state/budget-ledger.json",
          "Budget policy path: harness/control/state/budget-policy.json",
        ].join("\n"),
      );
    } catch (error) {
      logger.error?.("[nexo-budget-guard] failed to add compaction context", error);
    }
  }

  async function getState(sessionID) {
    const policy = await loadPolicy();
    const ledger = await loadLedger(policy);
    const binding = await bindingForSession(policy, sessionID);
    const activeTask = binding ? await readTask(rootDir, policy, binding.taskID) : null;
    const taskID = activeTask?.id || "UNBOUND_SESSION";
    const state = relativePolicyState(
      policy,
      ledger.sessions[sessionID],
      ledger.tasks[taskID],
      activeTask,
    );
    state.binding = binding;
    return state;
  }

  return {
    event,
    toolBefore,
    toolAfter,
    commandBefore,
    bindSession,
    compacting,
    getState,
    loadPolicy,
    loadLedger,
    readFocusedTask: () => readFocusedTask(rootDir, DEFAULT_POLICY),
  };
}

async function NexoBudgetGuardPlugin(input, options = {}) {
  const guard = createBudgetGuard({
    rootDir: options.rootDir || input.directory,
    directory: input.directory,
    client: input.client,
  });

  return {
    event: guard.event,
    "command.execute.before": guard.commandBefore,
    "tool.execute.before": guard.toolBefore,
    "tool.execute.after": guard.toolAfter,
    "experimental.session.compacting": guard.compacting,
  };
}

NexoBudgetGuardPlugin.id = "nexo-budget-guard";
NexoBudgetGuardPlugin.server = NexoBudgetGuardPlugin;
NexoBudgetGuardPlugin.createBudgetGuard = createBudgetGuard;
NexoBudgetGuardPlugin.DEFAULT_POLICY = DEFAULT_POLICY;
NexoBudgetGuardPlugin._private = {
  parseTaskRows,
  isCompletedAssistantMessage,
  normalizeTokens,
  countToolCall,
};

module.exports = NexoBudgetGuardPlugin;
module.exports.default = NexoBudgetGuardPlugin;
module.exports.server = NexoBudgetGuardPlugin;
module.exports.createBudgetGuard = createBudgetGuard;
module.exports.DEFAULT_POLICY = DEFAULT_POLICY;
module.exports._private = NexoBudgetGuardPlugin._private;
