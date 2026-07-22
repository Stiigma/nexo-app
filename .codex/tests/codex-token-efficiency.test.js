"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { pathToFileURL } = require("node:url");
const toml = require("../../.opencode/node_modules/toml");

const ROOT = path.resolve(__dirname, "../..");
const CODEX_ADAPTER = pathToFileURL(
  path.join(ROOT, ".codex/scripts/build-session-context.mjs"),
);
const OPENCODE_ADAPTER = pathToFileURL(
  path.join(ROOT, ".opencode/scripts/build-session-context.mjs"),
);
const SHARED_COMPILER = pathToFileURL(
  path.join(ROOT, "harness/control/scripts/build-session-context.mjs"),
);
const FIXED_NOW = new Date("2026-07-16T20:00:00.000Z");

async function makeSyntheticRoot(sha256) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-codex-context-"));
  const files = {
    tasks: "harness/control/tasks.md",
    plan: "harness/control/plans/NEXO-9998.md",
    handoff: "harness/control/handoffs/HOFF-NEXO-9998.md",
    latestReport: "harness/control/reports/NEXO-9998-session-001.md",
    focus: "harness/control/state/focus.json",
  };
  for (const file of Object.values(files)) {
    await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true });
  }
  const taskRow = "| NEXO-9998 | active | P1 | Codex Adapter Test | `plans/NEXO-9998.md` | `reports/NEXO-9998-session-001.md` | _none_ | Verify both adapters. |";
  const tasksText = [
    "| ID | Status | Priority | Title | Plan | Latest report | Closeout | Next step |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    taskRow,
    "",
  ].join("\n");
  const planText = "# NEXO-9998 - Codex Adapter Test\n";
  const handoffText = "# Handoff\n\nTask NEXO-9998\n";
  const reportText = "# Report\n\nTask NEXO-9998\n";
  await Promise.all([
    fs.writeFile(path.join(root, files.tasks), tasksText),
    fs.writeFile(path.join(root, files.plan), planText),
    fs.writeFile(path.join(root, files.handoff), handoffText),
    fs.writeFile(path.join(root, files.latestReport), reportText),
  ]);
  const focus = {
    schemaVersion: 1,
    taskId: "NEXO-9998",
    status: "active",
    updatedAt: "2026-07-16T19:00:00.000Z",
    maxAgeHours: 24,
    objective: "Verify shared compilation.",
    nextAction: "Compare both packets.",
    constraints: ["No provider calls."],
    acceptanceCriteria: ["Packets match."],
    verification: ["node --test"],
    expectedReport: "harness/control/reports/NEXO-9998-session-002.md",
    sources: {
      tasks: files.tasks,
      plan: files.plan,
      handoff: files.handoff,
      latestReport: files.latestReport,
    },
    sourceHashes: {
      taskRow: sha256(taskRow),
      plan: sha256(planText),
      handoff: sha256(handoffText),
      latestReport: sha256(reportText),
    },
  };
  await fs.writeFile(
    path.join(root, files.focus),
    `${JSON.stringify(focus, null, 2)}\n`,
  );
  return root;
}

test("Codex and OpenCode adapters use one shared compiler and emit equal packets", async (t) => {
  const [codex, opencode, shared] = await Promise.all([
    import(CODEX_ADAPTER.href),
    import(OPENCODE_ADAPTER.href),
    import(SHARED_COMPILER.href),
  ]);
  const root = await makeSyntheticRoot(shared.sha256);
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  assert.equal(codex.compileSessionContext, shared.compileSessionContext);
  assert.equal(opencode.compileSessionContext, shared.compileSessionContext);
  const [codexPacket, opencodePacket] = await Promise.all([
    codex.buildSessionContext({ rootDir: root, now: FIXED_NOW }),
    opencode.buildSessionContext({ rootDir: root, now: FIXED_NOW }),
  ]);
  assert.equal(codexPacket.text, opencodePacket.text);
  assert.equal(
    await fs.readFile(path.join(root, ".codex/state/session-context.json"), "utf8"),
    await fs.readFile(path.join(root, ".opencode/state/session-context.json"), "utf8"),
  );
  assert.ok(codexPacket.chars <= 10_000);
});

test("Codex project config applies the bounded Terra policy", async () => {
  const config = toml.parse(
    await fs.readFile(path.join(ROOT, ".codex/config.toml"), "utf8"),
  );
  assert.equal(config.model, "gpt-5.6-terra");
  assert.equal(config.model_reasoning_effort, "high");
  assert.equal(config.plan_mode_reasoning_effort, "high");
  assert.equal(config.model_verbosity, "low");
  assert.equal(config.model_reasoning_summary, "concise");
  assert.equal(config.model_auto_compact_token_limit, 64_000);
  assert.equal(config.model_auto_compact_token_limit_scope, "total");
  assert.equal(config.tool_output_token_limit, 8_000);
  assert.equal(config.project_doc_max_bytes, 12_000);
  assert.match(config.compact_prompt, /task ID/);
  assert.match(config.compact_prompt, /verification results/);
  assert.match(config.compact_prompt, /Never claim unrun validation/);
});

test("Codex startup instructions and generated state boundary are explicit", async () => {
  const [agents, ignore] = await Promise.all([
    fs.readFile(path.join(ROOT, "AGENTS.md"), "utf8"),
    fs.readFile(path.join(ROOT, ".codex/.gitignore"), "utf8"),
  ]);
  assert.match(agents, /node \.codex\/scripts\/build-session-context\.mjs/);
  assert.match(agents, /\.codex\/state\/session-context\.json/);
  assert.match(
    agents,
    /Token\s+savings must never remove QA, security, schema, type, or test requirements/,
  );
  assert.match(ignore, /^state\/session-context\.json$/m);
});
