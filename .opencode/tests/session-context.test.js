"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { pathToFileURL } = require("node:url");

const MODULE_URL = pathToFileURL(path.join(__dirname, "../scripts/build-session-context.mjs"));
const FIXED_NOW = new Date("2026-07-15T20:00:00.000Z");

async function loadCompiler() {
  return import(MODULE_URL.href);
}

async function makeRoot(overrides = {}) {
  const { sha256 } = await loadCompiler();
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-session-context-"));
  const files = {
    tasks: "harness/control/tasks.md",
    plan: "harness/control/plans/NEXO-9999.md",
    handoff: "harness/control/handoffs/HOFF-NEXO-9999.md",
    latestReport: "harness/control/reports/NEXO-9999-session-001.md",
    focus: "harness/control/state/focus.json",
  };
  for (const file of Object.values(files)) {
    await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true });
  }
  const taskRow = `| NEXO-9999 | ${overrides.taskStatus || "active"} | P0 | Synthetic Task | \`plans/NEXO-9999.md\` | \`reports/NEXO-9999-session-001.md\` | _none_ | Continue safely. |`;
  const tasksText = [
    "| ID | Status | Priority | Title | Plan | Latest report | Closeout | Next step |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    taskRow,
    "",
  ].join("\n");
  const planText = overrides.planText || "# NEXO-9999 - Synthetic Plan\n";
  const handoffText = overrides.handoffText || "# Handoff\n\n- Task ID: `NEXO-9999`\n";
  const reportText = overrides.reportText || "# Report\n\n- Task: `NEXO-9999`\n";
  await fs.writeFile(path.join(root, files.tasks), tasksText);
  await fs.writeFile(path.join(root, files.plan), planText);
  await fs.writeFile(path.join(root, files.handoff), handoffText);
  await fs.writeFile(path.join(root, files.latestReport), reportText);

  const focus = {
    schemaVersion: 1,
    taskId: "NEXO-9999",
    status: overrides.focusStatus || "active",
    updatedAt: overrides.updatedAt || "2026-07-15T19:00:00.000Z",
    maxAgeHours: overrides.maxAgeHours || 24,
    objective: "Prove compact context generation.",
    nextAction: "Run synthetic verification.",
    constraints: ["No paid calls."],
    acceptanceCriteria: ["Packet is deterministic."],
    verification: ["node --test .opencode/tests/*.test.js"],
    expectedReport: "harness/control/reports/NEXO-9999-session-002.md",
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
    ...overrides.focus,
  };
  await fs.writeFile(path.join(root, files.focus), `${JSON.stringify(focus, null, 2)}\n`);
  return { root, files };
}

test("builds a deterministic packet below the hard character limit", async (t) => {
  const { buildSessionContext } = await loadCompiler();
  const { root } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const first = await buildSessionContext({ rootDir: root, now: FIXED_NOW });
  const second = await buildSessionContext({ rootDir: root, now: FIXED_NOW });

  assert.equal(first.text, second.text);
  assert.equal(first.packet.task.id, "NEXO-9999");
  assert.ok(first.chars <= 10_000);
  assert.equal(first.estimatedTokens, Math.ceil(first.chars / 4));
  assert.equal(
    await fs.readFile(path.join(root, ".opencode/state/session-context.json"), "utf8"),
    first.text,
  );
});

test("fails closed and deletes an old packet when focus is stale", async (t) => {
  const { buildSessionContext } = await loadCompiler();
  const { root } = await makeRoot({ updatedAt: "2026-07-01T00:00:00.000Z", maxAgeHours: 1 });
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const output = path.join(root, ".opencode/state/session-context.json");
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, "stale packet");

  await assert.rejects(
    buildSessionContext({ rootDir: root, now: FIXED_NOW }),
    /focus is stale/,
  );
  await assert.rejects(fs.access(output), /ENOENT/);
});

test("rejects a status conflict with tasks.md", async (t) => {
  const { buildSessionContext } = await loadCompiler();
  const { root } = await makeRoot({ focusStatus: "implemented", taskStatus: "active" });
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  await assert.rejects(
    buildSessionContext({ rootDir: root, now: FIXED_NOW }),
    /conflicts with tasks\.md status/,
  );
});

test("rejects linked source changes after focus approval", async (t) => {
  const { buildSessionContext } = await loadCompiler();
  const { root, files } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.appendFile(path.join(root, files.plan), "\nUnapproved change.\n");

  await assert.rejects(
    buildSessionContext({ rootDir: root, now: FIXED_NOW }),
    /plan changed after focus\.json was approved/,
  );
});

test("rejects packets that exceed the configured limit", async (t) => {
  const { buildSessionContext } = await loadCompiler();
  const { root } = await makeRoot({
    focus: { constraints: ["x".repeat(600)] },
  });
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  await assert.rejects(
    buildSessionContext({ rootDir: root, now: FIXED_NOW, maxChars: 500 }),
    /compiled context has .* limit is 500/,
  );
});
