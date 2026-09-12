// Focused test for the V2 nexo-status data assembly.
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

async function moduleUnderTest() {
  return import("../plugins/nexo-status/lib/status-data.mjs");
}

async function makeFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-status-"));
  await Promise.all([
    fs.mkdir(path.join(root, ".opencode/state"), { recursive: true }),
    fs.mkdir(path.join(root, "harness/control/state"), { recursive: true }),
  ]);
  await fs.writeFile(
    path.join(root, ".opencode/state/session-bindings.json"),
    JSON.stringify({ sessions: { ses_1: { taskID: "NEXO-0042" } } }),
  );
  await fs.writeFile(
    path.join(root, ".opencode/state/budget-ledger.json"),
    JSON.stringify({
      sessions: { ses_1: { cost: 0.3, tokens: { input: 8000, output: 2000 }, toolCalls: { total: 4 } } },
      tasks: { "NEXO-0042": { cost: 2.25, tokens: { input: 30000, output: 9000 } } },
    }),
  );
  await fs.writeFile(
    path.join(root, "harness/control/state/budget-policy.json"),
    JSON.stringify({ limits: { session: { soft: 1.5, hard: 2 } } }),
  );
  await fs.writeFile(
    path.join(root, "harness/control/state/focus.json"),
    JSON.stringify({ taskId: "NEXO-0042", status: "planned" }),
  );
  return root;
}

test("collects bound task, ledger, limits, and focus for a session", async () => {
  const { collectStatus } = await moduleUnderTest();
  const root = await makeFixture();
  const status = collectStatus(root, "ses_1");
  assert.equal(status.taskID, "NEXO-0042");
  assert.equal(status.focus, "NEXO-0042");
  assert.equal(status.status, "planned");
  assert.equal(status.session.cost, 0.3);
  assert.equal(status.session.toolCalls.total, 4);
  assert.equal(status.task.cost, 2.25);
  assert.equal(status.limits.session.soft, 1.5);
});

test("falls back to UNBOUND/NO-FOCUS without state files", async () => {
  const { collectStatus } = await moduleUnderTest();
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-status-empty-"));
  const status = collectStatus(root, "ses_missing");
  assert.equal(status.taskID, "UNBOUND");
  assert.equal(status.focus, "NO-FOCUS");
  assert.equal(status.status, "unknown");
  assert.deepEqual(status.session, {});
  assert.deepEqual(status.task, {});
  assert.deepEqual(status.limits, {});
});

test("formats money and compact token counts", async () => {
  const { money, compact, readJson } = await moduleUnderTest();
  assert.equal(money(1.5), "$1.50");
  assert.equal(money(undefined), "$0.00");
  assert.equal(compact(999), "999");
  assert.equal(compact(8000), "8.0k");
  assert.equal(compact(2_250_000), "2.3m");
  assert.deepEqual(readJson("/nonexistent/nexo-status.json", { fallback: true }), { fallback: true });
});
