// Created by: OpenCode (AI-assisted), 2026-07-18
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { pathToFileURL } = require("node:url");

const MODULE_URL = pathToFileURL(
  path.resolve(__dirname, "../../harness/control/scripts/control-engine.mjs"),
);
const TASK_ID = "NEXO-9999";

async function loadEngine() {
  return import(MODULE_URL.href);
}

function architectureEvaluation(decision = "approved", taskId = TASK_ID) {
  return [
    `# ${taskId} Architecture`,
    "",
    "## Metadata",
    "",
    `- Task ID: \`${taskId}\``,
    "",
    "## Architecture Decision Evaluation",
    "",
    `- Decision: ${decision}`,
    "- Selected option: direct contract validation",
    "- Rationale: smallest deterministic change",
    "- Pattern decision: none",
    "- Reversibility: remove the validation contract",
    "",
  ].join("\n");
}

function dependencyEvaluation(decision = "approved", taskId = TASK_ID) {
  return [
    `# ${taskId} Dependency`,
    "",
    "## Metadata",
    "",
    `- Task ID: \`${taskId}\``,
    "",
    "## Dependency Decision Evaluation",
    "",
    `- Decision: ${decision}`,
    "- Selected identity: no new dependency",
    "- Rationale: the standard library is sufficient",
    "- Required user approval: none",
    "- Verification: focused and complete tests",
    "- Upgrade path: governed runtime task",
    "- Rollback path: revert plain source changes",
    "",
  ].join("\n");
}

function externalApprovalEvaluation(decision = "approved", taskId = TASK_ID) {
  return [
    `# ${taskId} External Approval`,
    "",
    "## Metadata",
    "",
    `- Task ID: \`${taskId}\``,
    "",
    "## External Approval Evaluation",
    "",
    `- Decision: ${decision}`,
    "- Approval scope: one bounded external action",
    "- Approver: local operator",
    "- Evidence: explicit task-bound approval record",
    "- Constraints: no broader account or environment mutation",
    "",
  ].join("\n");
}

function qaReview(decision = "pass", taskId = TASK_ID) {
  return [
    `# ${taskId} QA`,
    "",
    "## Metadata",
    "",
    `- Task ID: \`${taskId}\``,
    "",
    "## QA Decision Evaluation",
    "",
    `- Decision: ${decision}`,
    "- Reviewed evidence: implementation and verification report",
    "- Findings: no blocking quality finding",
    "- Residual risk: structural evidence remains self-asserted",
    "",
  ].join("\n");
}

function securityReview(decision = "approved", taskId = TASK_ID) {
  return [
    `# ${taskId} Security`,
    "",
    "## Metadata",
    "",
    `- Task ID: \`${taskId}\``,
    "",
    "## Security Decision Evaluation",
    "",
    `- Decision: ${decision}`,
    "- Reviewed evidence: trust boundaries and regression evidence",
    "- Findings: no blocking security finding",
    "- Residual risk: local evidence has no cryptographic provenance",
    "",
  ].join("\n");
}

async function write(root, relativePath, content) {
  const file = path.join(root, relativePath);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}

async function makeRoot(overrides = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-control-engine-"));
  const taskStatus = overrides.taskStatus || "active";
  const manifestStatus = overrides.manifestStatus || taskStatus;
  const plan = `harness/control/plans/${TASK_ID}.md`;
  const handoff = `harness/control/handoffs/HOFF-${TASK_ID}.md`;
  const taskRow = `| ${TASK_ID} | ${taskStatus} | P0 | Synthetic Engine Task | \`plans/${TASK_ID}.md\` | _none_ | _none_ | Continue. |`;
  await write(
    root,
    "harness/control/tasks.md",
    [
      "| ID | Status | Priority | Title | Plan | Latest report | Closeout | Next step |",
      "| --- | --- | --- | --- | --- | --- | --- | --- |",
      taskRow,
      "",
    ].join("\n"),
  );
  await write(
    root,
    plan,
    architectureEvaluation(),
  );
  await write(root, handoff, `# Handoff\n\n- Task ID: \`${TASK_ID}\`\n`);

  const manifest = {
    schemaVersion: 1,
    taskId: TASK_ID,
    status: manifestStatus,
    updatedAt: "2026-07-18T18:00:00-07:00",
    requirements: {
      architectureDecision: true,
      dependencyApproval: false,
      migrationPlan: false,
      qaReview: true,
      securityReview: true,
      externalApproval: false,
    },
    artifacts: {
      plan,
      handoff,
      investigation: null,
      architectureDecision: plan,
      dependencyApproval: null,
      migrationPlan: null,
      report: null,
      implementation: null,
      qa: null,
      security: null,
      closeout: null,
      externalApproval: null,
    },
    verification: [],
    ...overrides.manifest,
  };
  await write(
    root,
    `harness/control/state/tasks/${TASK_ID}.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return { root, manifest, taskRow };
}

async function addImplementationEvidence(root, manifest) {
  const report = `harness/control/reports/${TASK_ID}-session-001.md`;
  const implementation = `harness/control/implementations/IMPL-${TASK_ID}.md`;
  await write(
    root,
    report,
    `# ${TASK_ID} Report\n\n## Verification Performed\n\n- \`node --test .opencode/tests/*.test.js\`: passed.\n`,
  );
  await write(root, implementation, `# ${TASK_ID} Implementation\n`);
  manifest.artifacts.report = report;
  manifest.artifacts.implementation = implementation;
  manifest.verification = ["node --test .opencode/tests/*.test.js"];
  await write(
    root,
    `harness/control/state/tasks/${TASK_ID}.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

async function addCloseEvidence(root, manifest, qaDecision = "pass") {
  const qa = `harness/control/reports/${TASK_ID}-qa.md`;
  const security = `harness/control/security/SEC-${TASK_ID}.md`;
  const closeout = `harness/control/closeouts/${TASK_ID}.md`;
  await write(root, qa, qaReview(qaDecision));
  await write(root, security, securityReview());
  await write(root, closeout, `# ${TASK_ID} Closeout\n`);
  manifest.artifacts.qa = qa;
  manifest.artifacts.security = security;
  manifest.artifacts.closeout = closeout;
  await write(
    root,
    `harness/control/state/tasks/${TASK_ID}.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

test("allows the build gate from synchronized active state", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, true);
  assert.equal(decision.operation.name, "build");
  assert.deepEqual(decision.blockers, []);
});

test("fails closed when manifest and task index statuses conflict", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root } = await makeRoot({ manifestStatus: "implemented" });
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "STATE_CONFLICT"));
});

test("fails closed when the manifest plan conflicts with the task row", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const otherPlan = "harness/control/plans/OTHER.md";
  await write(root, otherPlan, `# ${TASK_ID} Other Plan\n\n## Decision Log\n`);
  manifest.artifacts.plan = otherPlan;
  manifest.artifacts.architectureDecision = otherPlan;
  await write(
    root,
    `harness/control/state/tasks/${TASK_ID}.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "PLAN_CONFLICT"));
});

test("requires declared pre-build evidence", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root } = await makeRoot({
    manifest: {
      requirements: {
        architectureDecision: true,
        dependencyApproval: true,
        migrationPlan: false,
        qaReview: true,
        securityReview: true,
        externalApproval: false,
      },
    },
  });
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "EVIDENCE_MISSING"));
});

test("rejects a non-approved architecture decision evaluation", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await write(
    root,
    manifest.artifacts.architectureDecision,
    architectureEvaluation("deferred"),
  );

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "REVIEW_NOT_APPROVED"));
});

test("requires the dependency decision evaluation contract", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const dependency = `harness/control/decisions/${TASK_ID}-dependency.md`;
  await write(
    root,
    dependency,
    `# ${TASK_ID} Dependency\n\n## Metadata\n\n- Task ID: \`${TASK_ID}\`\n\n- Decision: approved\n`,
  );
  manifest.requirements.dependencyApproval = true;
  manifest.artifacts.dependencyApproval = dependency;
  await write(
    root,
    `harness/control/state/tasks/${TASK_ID}.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "EVIDENCE_INVALID"));
});

test("rejects ambiguous architecture decision evaluations", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await write(
    root,
    manifest.artifacts.architectureDecision,
    architectureEvaluation().replace("- Decision: approved", "- Decision: approved\n- Decision: rejected"),
  );

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(
    decision.blockers.some((blocker) => blocker.code === "REVIEW_DECISION_AMBIGUOUS"),
  );
});

test("rejects a decision outside the evaluation section", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const content = architectureEvaluation()
    .replace("- Decision: approved\n", "")
    .replace("## Architecture Decision Evaluation", "- Decision: approved\n\n## Architecture Decision Evaluation");
  await write(root, manifest.artifacts.architectureDecision, content);

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(
    decision.blockers.some((blocker) => blocker.code === "REVIEW_DECISION_AMBIGUOUS"),
  );
});

test("rejects duplicate evaluation headings", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await write(
    root,
    manifest.artifacts.architectureDecision,
    architectureEvaluation().replace(
      "## Architecture Decision Evaluation",
      "## Architecture Decision Evaluation\n\n## Architecture Decision Evaluation",
    ),
  );

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(
    decision.blockers.some((blocker) => blocker.code === "REVIEW_DECISION_AMBIGUOUS"),
  );
});

test("ignores decision fields inside fenced examples", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await write(
    root,
    manifest.artifacts.architectureDecision,
    architectureEvaluation("deferred").replace(
      "- Decision: deferred",
      "```markdown\n- Decision: approved\n```\n- Decision: deferred",
    ),
  );

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "REVIEW_NOT_APPROVED"));
});

test("rejects shorter or pseudo-closing backtick fences", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await write(
    root,
    manifest.artifacts.architectureDecision,
    [
      "````markdown",
      "fenced example",
      "``` not a valid closer",
      architectureEvaluation(),
    ].join("\n"),
  );

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "EVIDENCE_INVALID"));
});

test("keeps content hidden behind shorter tilde fence markers", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await write(
    root,
    manifest.artifacts.architectureDecision,
    ["~~~~markdown", "~~~", architectureEvaluation(), "~~~~", ""].join("\n"),
  );

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "EVIDENCE_TASK_MISMATCH"));
});

test("recognizes unclosed backtick fences with tilde-leading info strings", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await write(
    root,
    manifest.artifacts.architectureDecision,
    ["```~markdown", architectureEvaluation(), ""].join("\n"),
  );

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "EVIDENCE_INVALID"));
});

test("recognizes unclosed tilde fences with backtick-leading info strings", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await write(
    root,
    manifest.artifacts.architectureDecision,
    ["~~~`markdown", architectureEvaluation(), ""].join("\n"),
  );

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "EVIDENCE_INVALID"));
});

test("accepts evidence after normally closed opposite-info fences", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await write(
    root,
    manifest.artifacts.architectureDecision,
    [
      "```~markdown",
      "- Decision: rejected",
      "```",
      "~~~`markdown",
      "- Decision: rejected",
      "~~~",
      architectureEvaluation(),
    ].join("\n"),
  );

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, true);
});

test("requires exact task metadata in decision evaluations", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await write(
    root,
    manifest.artifacts.architectureDecision,
    `${architectureEvaluation("approved", "NEXO-9998")}\nRelated: ${TASK_ID}\n`,
  );

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "EVIDENCE_TASK_MISMATCH"));
});

test("requires non-placeholder evaluation fields", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await write(
    root,
    manifest.artifacts.architectureDecision,
    architectureEvaluation().replace("- Rationale: smallest deterministic change", "- Rationale: TBD"),
  );

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "EVIDENCE_INVALID"));
});

test("rejects artifact paths that escape the repository", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root } = await makeRoot({
    manifest: {
      artifacts: {
        plan: "../../outside.md",
        handoff: null,
        investigation: null,
        architectureDecision: "../../outside.md",
        dependencyApproval: null,
        migrationPlan: null,
        report: null,
        implementation: null,
        qa: null,
        security: null,
        closeout: null,
        externalApproval: null,
      },
    },
  });
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "UNSAFE_PATH"));
});

test("rejects repository files outside canonical evidence directories", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await write(root, ".env", `${TASK_ID}\n## Decision Log\n`);
  manifest.artifacts.plan = ".env";
  manifest.artifacts.architectureDecision = ".env";
  await write(
    root,
    `harness/control/state/tasks/${TASK_ID}.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "EVIDENCE_PATH_NOT_ALLOWED"));
});

test("rejects dot-segment traversal into another repository directory", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const forged = "harness/control/decisions/forged.md";
  await write(root, forged, architectureEvaluation());
  manifest.artifacts.architectureDecision = "harness/control/plans/../decisions/forged.md";
  await write(
    root,
    `harness/control/state/tasks/${TASK_ID}.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "EVIDENCE_PATH_NOT_ALLOWED"));
});

test("rejects canonical evidence symlinks to disallowed repository directories", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const forged = "harness/control/decisions/forged.md";
  await write(root, forged, architectureEvaluation());
  await fs.rm(path.join(root, manifest.artifacts.plan));
  await fs.symlink("../decisions/forged.md", path.join(root, manifest.artifacts.plan));

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "EVIDENCE_PATH_NOT_ALLOWED"));
});

test("rejects canonical evidence symlinks that resolve outside the repository", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-control-evidence-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  t.after(() => fs.rm(outside, { recursive: true, force: true }));
  const outsidePlan = path.join(outside, "plan.md");
  await fs.writeFile(outsidePlan, `# ${TASK_ID} Plan\n\n## Decision Log\n`);
  await fs.rm(path.join(root, manifest.artifacts.plan));
  await fs.symlink(outsidePlan, path.join(root, manifest.artifacts.plan));

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "UNSAFE_PATH"));
});

test("requires report, implementation record, and verification before implemented", async (t) => {
  const { evaluateTransition } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const blocked = await evaluateTransition({ rootDir: root, taskId: TASK_ID, to: "implemented" });
  assert.equal(blocked.ok, false);
  assert.ok(blocked.blockers.some((blocker) => blocker.code === "EVIDENCE_MISSING"));

  await addImplementationEvidence(root, manifest);
  const allowed = await evaluateTransition({ rootDir: root, taskId: TASK_ID, to: "implemented" });
  assert.equal(allowed.ok, true);
});

test("requires the report to record every declared verification command", async (t) => {
  const { evaluateTransition } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await addImplementationEvidence(root, manifest);
  await write(
    root,
    manifest.artifacts.report,
    `# ${TASK_ID} Report\n\n## Verification Performed\n\n- A different check passed.\n`,
  );

  const decision = await evaluateTransition({ rootDir: root, taskId: TASK_ID, to: "implemented" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "VERIFICATION_NOT_RECORDED"));
});

test("revalidates pre-build decisions before implemented", async (t) => {
  const { evaluateTransition } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await addImplementationEvidence(root, manifest);
  await write(root, manifest.artifacts.architectureDecision, architectureEvaluation("deferred"));

  const decision = await evaluateTransition({ rootDir: root, taskId: TASK_ID, to: "implemented" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "REVIEW_NOT_APPROVED"));
});

test("revalidates pre-build decisions before review and close", async (t) => {
  const { evaluateGate, evaluateTransition } = await loadEngine();
  const { root, manifest } = await makeRoot({ taskStatus: "implemented" });
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await addImplementationEvidence(root, manifest);
  await addCloseEvidence(root, manifest, "pass");
  await write(root, manifest.artifacts.architectureDecision, architectureEvaluation("rejected"));

  const review = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "qa" });
  const close = await evaluateTransition({ rootDir: root, taskId: TASK_ID, to: "closed" });

  assert.equal(review.ok, false);
  assert.equal(close.ok, false);
  assert.ok(review.blockers.some((blocker) => blocker.code === "REVIEW_NOT_APPROVED"));
  assert.ok(close.blockers.some((blocker) => blocker.code === "REVIEW_NOT_APPROVED"));
});

test("requires an exact external approval evaluation when declared", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const approval = `harness/control/decisions/${TASK_ID}-external-approval.md`;
  await write(root, approval, `# ${TASK_ID} Approval\n\n- Task ID: \`${TASK_ID}\`\n\n- Decision: approved\n`);
  manifest.requirements.externalApproval = true;
  manifest.artifacts.externalApproval = approval;
  await write(
    root,
    `harness/control/state/tasks/${TASK_ID}.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "EVIDENCE_INVALID"));
});

test("accepts a complete exact external approval evaluation", async (t) => {
  const { evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const approval = `harness/control/decisions/${TASK_ID}-external-approval.md`;
  await write(root, approval, externalApprovalEvaluation());
  manifest.requirements.externalApproval = true;
  manifest.artifacts.externalApproval = approval;
  await write(
    root,
    `harness/control/state/tasks/${TASK_ID}.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  const decision = await evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" });

  assert.equal(decision.ok, true);
});

test("requires approved QA and security decisions before close", async (t) => {
  const { evaluateTransition } = await loadEngine();
  const { root, manifest } = await makeRoot({ taskStatus: "implemented" });
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await addImplementationEvidence(root, manifest);
  await addCloseEvidence(root, manifest, "conditional pass");

  const blocked = await evaluateTransition({ rootDir: root, taskId: TASK_ID, to: "closed" });
  assert.equal(blocked.ok, false);
  assert.ok(blocked.blockers.some((blocker) => blocker.code === "REVIEW_NOT_APPROVED"));

  await addCloseEvidence(root, manifest, "pass");
  const allowed = await evaluateTransition({ rootDir: root, taskId: TASK_ID, to: "closed" });
  assert.equal(allowed.ok, true);
});

test("rejects review evidence with ambiguous decision fields", async (t) => {
  const { evaluateTransition } = await loadEngine();
  const { root, manifest } = await makeRoot({ taskStatus: "implemented" });
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await addImplementationEvidence(root, manifest);
  await addCloseEvidence(root, manifest, "pass");
  await fs.appendFile(path.join(root, manifest.artifacts.qa), "\n- Decision: blocked\n");

  const decision = await evaluateTransition({ rootDir: root, taskId: TASK_ID, to: "closed" });

  assert.equal(decision.ok, false);
  assert.ok(
    decision.blockers.some((blocker) => blocker.code === "REVIEW_DECISION_AMBIGUOUS"),
  );
});

test("rejects QA evidence bound to another task", async (t) => {
  const { evaluateTransition } = await loadEngine();
  const { root, manifest } = await makeRoot({ taskStatus: "implemented" });
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await addImplementationEvidence(root, manifest);
  await addCloseEvidence(root, manifest, "pass");
  await write(root, manifest.artifacts.qa, `${qaReview("pass", "NEXO-9998")}\nRelated: ${TASK_ID}\n`);

  const decision = await evaluateTransition({ rootDir: root, taskId: TASK_ID, to: "closed" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "EVIDENCE_TASK_MISMATCH"));
});

test("rejects security decisions outside their evaluation section", async (t) => {
  const { evaluateTransition } = await loadEngine();
  const { root, manifest } = await makeRoot({ taskStatus: "implemented" });
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await addImplementationEvidence(root, manifest);
  await addCloseEvidence(root, manifest, "pass");
  const malformed = securityReview()
    .replace("- Decision: approved\n", "")
    .replace("## Security Decision Evaluation", "- Decision: approved\n\n## Security Decision Evaluation");
  await write(root, manifest.artifacts.security, malformed);

  const decision = await evaluateTransition({ rootDir: root, taskId: TASK_ID, to: "closed" });

  assert.equal(decision.ok, false);
  assert.ok(
    decision.blockers.some((blocker) => blocker.code === "REVIEW_DECISION_AMBIGUOUS"),
  );
});

test("allows implemented work to return to active for governed rework", async (t) => {
  const { evaluateTransition } = await loadEngine();
  const { root } = await makeRoot({ taskStatus: "implemented" });
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const decision = await evaluateTransition({ rootDir: root, taskId: TASK_ID, to: "active" });

  assert.equal(decision.ok, true);
  assert.equal(decision.operation.name, "implemented->active");
});

test("rejects undeclared lifecycle transitions without mutating state", async (t) => {
  const { evaluateTransition } = await loadEngine();
  const { root } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const tasksFile = path.join(root, "harness/control/tasks.md");
  const manifestFile = path.join(root, `harness/control/state/tasks/${TASK_ID}.json`);
  const before = await Promise.all([fs.readFile(tasksFile, "utf8"), fs.readFile(manifestFile, "utf8")]);

  const decision = await evaluateTransition({ rootDir: root, taskId: TASK_ID, to: "closed" });

  assert.equal(decision.ok, false);
  assert.ok(decision.blockers.some((blocker) => blocker.code === "INVALID_TRANSITION"));
  assert.deepEqual(
    await Promise.all([fs.readFile(tasksFile, "utf8"), fs.readFile(manifestFile, "utf8")]),
    before,
  );
});

test("rejects malformed manifests as invalid input", async (t) => {
  const { ControlEngineInputError, evaluateGate } = await loadEngine();
  const { root, manifest } = await makeRoot();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  manifest.requirements.qaReview = "yes";
  await write(
    root,
    `harness/control/state/tasks/${TASK_ID}.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  await assert.rejects(
    evaluateGate({ rootDir: root, taskId: TASK_ID, gate: "build" }),
    (error) => error instanceof ControlEngineInputError && /qaReview must be boolean/.test(error.message),
  );
});
