#!/usr/bin/env node
// Created by: OpenCode (AI-assisted), 2026-07-18

import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { parseTaskRows, taskLinkMatches } from "./build-session-context.mjs";

const STATUSES = new Set(["planned", "active", "implemented", "blocked", "closed"]);
const GATES = new Set(["build", "qa", "security", "release", "close"]);
const REQUIREMENT_KEYS = [
  "architectureDecision",
  "dependencyApproval",
  "migrationPlan",
  "qaReview",
  "securityReview",
  "externalApproval",
  "releaseReadiness",
];
const ARTIFACT_KEYS = [
  "plan",
  "handoff",
  "investigation",
  "architectureDecision",
  "dependencyApproval",
  "migrationPlan",
  "report",
  "implementation",
  "qa",
  "security",
  "closeout",
  "externalApproval",
  "releaseReadiness",
];
const TRANSITIONS = new Set([
  "planned->active",
  "planned->blocked",
  "active->implemented",
  "active->blocked",
  "blocked->active",
  "implemented->active",
  "implemented->blocked",
  "implemented->closed",
]);
const ARTIFACT_PREFIXES = {
  plan: ["harness/control/plans/", "harness/control/work/"],
  handoff: ["harness/control/handoffs/"],
  investigation: ["harness/control/investigations/"],
  architectureDecision: ["harness/control/plans/", "harness/control/decisions/", "docs/adr/"],
  dependencyApproval: ["harness/control/plans/", "harness/control/decisions/", "harness/control/reports/"],
  migrationPlan: ["harness/control/plans/", "harness/control/handoffs/", "harness/control/decisions/"],
  report: ["harness/control/reports/"],
  implementation: ["harness/control/implementations/"],
  qa: ["harness/control/reports/"],
  security: ["harness/control/security/"],
  closeout: ["harness/control/closeouts/"],
  externalApproval: ["harness/control/reports/", "harness/control/decisions/"],
  releaseReadiness: ["harness/control/reports/"],
};
const PRE_BUILD_EVALUATIONS = {
  architectureDecision: {
    evaluationHeading: "Architecture Decision Evaluation",
    decision: "approved",
    requiredFields: ["Selected option", "Rationale", "Pattern decision", "Reversibility"],
  },
  dependencyApproval: {
    evaluationHeading: "Dependency Decision Evaluation",
    decision: "approved",
    requiredFields: [
      "Selected identity",
      "Rationale",
      "Required user approval",
      "Verification",
      "Upgrade path",
      "Rollback path",
    ],
  },
  externalApproval: {
    evaluationHeading: "External Approval Evaluation",
    decision: "approved",
    requiredFields: ["Approval scope", "Approver", "Evidence", "Constraints"],
  },
};
const REVIEW_EVALUATIONS = {
  qa: {
    evaluationHeading: "QA Decision Evaluation",
    decision: "pass",
    requiredFields: ["Reviewed evidence", "Findings", "Residual risk"],
  },
  security: {
    evaluationHeading: "Security Decision Evaluation",
    decision: "approved",
    requiredFields: ["Reviewed evidence", "Findings", "Residual risk"],
  },
  release: {
    evaluationHeading: "Release Readiness Evaluation",
    decision: "pass",
    requiredFields: [
      "Reviewed evidence",
      "Health and smoke checks",
      "Rollback trigger",
      "Recovery owner",
      "Residual risk",
    ],
  },
};

export class ControlEngineInputError extends Error {
  constructor(message) {
    super(message);
    this.name = "ControlEngineInputError";
    this.code = "INVALID_INPUT";
  }
}

function assertString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ControlEngineInputError(`${field} must be a non-empty string`);
  }
}

function validateTaskId(taskId) {
  assertString(taskId, "taskId");
  if (!/^(?:NEXO|FIAD)-\d{4}$/.test(taskId)) {
    throw new ControlEngineInputError("taskId must match NEXO-0000 or FIAD-0000");
  }
}

function validateManifest(manifest, taskId) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new ControlEngineInputError("task manifest must be a JSON object");
  }
  if (manifest.schemaVersion !== 1) {
    throw new ControlEngineInputError("task manifest schemaVersion must be 1");
  }
  if (manifest.taskId !== taskId) {
    throw new ControlEngineInputError(`task manifest identifies ${manifest.taskId}, expected ${taskId}`);
  }
  if (!STATUSES.has(manifest.status)) {
    throw new ControlEngineInputError(`unsupported manifest status: ${manifest.status}`);
  }
  assertString(manifest.updatedAt, "manifest.updatedAt");
  if (Number.isNaN(new Date(manifest.updatedAt).getTime())) {
    throw new ControlEngineInputError("manifest.updatedAt must be an ISO date-time");
  }
  if (!manifest.requirements || typeof manifest.requirements !== "object") {
    throw new ControlEngineInputError("manifest.requirements must be an object");
  }
  for (const key of Object.keys(manifest.requirements)) {
    if (!REQUIREMENT_KEYS.includes(key)) {
      throw new ControlEngineInputError(`unsupported manifest requirement: ${key}`);
    }
  }
  for (const key of REQUIREMENT_KEYS) {
    if (key === "releaseReadiness" && manifest.requirements[key] === undefined) continue;
    if (typeof manifest.requirements[key] !== "boolean") {
      throw new ControlEngineInputError(`manifest.requirements.${key} must be boolean`);
    }
  }
  if (!manifest.artifacts || typeof manifest.artifacts !== "object") {
    throw new ControlEngineInputError("manifest.artifacts must be an object");
  }
  for (const key of Object.keys(manifest.artifacts)) {
    if (!ARTIFACT_KEYS.includes(key)) {
      throw new ControlEngineInputError(`unsupported manifest artifact: ${key}`);
    }
  }
  for (const key of ARTIFACT_KEYS) {
    const value = manifest.artifacts[key];
    if (key === "releaseReadiness" && value === undefined) continue;
    if (value !== null && (typeof value !== "string" || value.trim() === "")) {
      throw new ControlEngineInputError(`manifest.artifacts.${key} must be a relative path or null`);
    }
  }
  if (manifest.controlLevel !== undefined && !["normal", "controlled"].includes(manifest.controlLevel)) {
    throw new ControlEngineInputError("manifest.controlLevel must be normal or controlled");
  }
  if (manifest.title !== undefined) assertString(manifest.title, "manifest.title");
  if (manifest.priority !== undefined && !/^P[0-3]$/.test(manifest.priority)) {
    throw new ControlEngineInputError("manifest.priority must be P0, P1, P2, or P3");
  }
  if (manifest.continuity !== undefined) {
    if (!manifest.continuity || typeof manifest.continuity !== "object" || Array.isArray(manifest.continuity)) {
      throw new ControlEngineInputError("manifest.continuity must be an object");
    }
    for (const key of ["objective", "summary", "nextStep"]) {
      assertString(manifest.continuity[key], `manifest.continuity.${key}`);
    }
    for (const key of ["decisions", "openQuestions"]) {
      if (!Array.isArray(manifest.continuity[key]) || manifest.continuity[key].some((value) => typeof value !== "string" || !value.trim())) {
        throw new ControlEngineInputError(`manifest.continuity.${key} must be an array of non-empty strings`);
      }
    }
  }
  if (manifest.contract !== undefined) {
    if (!manifest.contract || typeof manifest.contract !== "object" || Array.isArray(manifest.contract)) {
      throw new ControlEngineInputError("manifest.contract must be an object");
    }
    for (const key of ["requirementSources", "acceptanceCriteria"]) {
      if (!Array.isArray(manifest.contract[key]) || manifest.contract[key].some((value) => typeof value !== "string" || !value.trim())) {
        throw new ControlEngineInputError(`manifest.contract.${key} must be an array of non-empty strings`);
      }
    }
  }
  const releaseRequired = manifest.requirements.releaseReadiness === true;
  const releaseArtifact = manifest.artifacts.releaseReadiness ?? null;
  if (releaseRequired && !releaseArtifact) {
    throw new ControlEngineInputError("manifest requires a releaseReadiness artifact");
  }
  if (!releaseRequired && releaseArtifact) {
    throw new ControlEngineInputError("manifest releaseReadiness artifact requires its requirement flag");
  }
  if (
    !Array.isArray(manifest.verification) ||
    manifest.verification.some((command) => typeof command !== "string" || command.trim() === "")
  ) {
    throw new ControlEngineInputError("manifest.verification must be an array of non-empty strings");
  }
}

async function readJson(file, label) {
  let text;
  try {
    text = await readFile(file, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new ControlEngineInputError(`${label} is missing: ${file}`);
    }
    throw error;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new ControlEngineInputError(`${label} is invalid JSON: ${error.message}`);
  }
}

function resolveInsideRoot(rootDir, relativePath) {
  if (path.isAbsolute(relativePath)) return null;
  const root = path.resolve(rootDir);
  const resolved = path.resolve(root, relativePath);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) return null;
  return resolved;
}

function artifactPathIsAllowed(name, relativePath) {
  if (relativePath.includes("\\")) return false;
  const normalized = path.posix.normalize(relativePath);
  if (normalized !== relativePath || normalized.startsWith("../")) return false;
  return ARTIFACT_PREFIXES[name].some((prefix) => normalized.startsWith(prefix));
}

async function realArtifactPathIsAllowed(context, name, actualFile) {
  for (const prefix of ARTIFACT_PREFIXES[name]) {
    try {
      const canonicalDirectory = await realpath(path.join(context.realRoot, prefix));
      if (actualFile.startsWith(`${canonicalDirectory}${path.sep}`)) return true;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return false;
}

function visibleMarkdown(text) {
  const visible = [];
  let fence = null;
  for (const line of text.split(/\r?\n/)) {
    if (fence !== null) {
      const closing = line.match(/^ {0,3}(`{3,}|~{3,})[\t ]*$/)?.[1];
      if (
        closing &&
        closing[0] === fence.character &&
        closing.length >= fence.length
      ) {
        fence = null;
      }
      continue;
    }
    const opening =
      line.match(/^ {0,3}(`{3,})[^`]*$/)?.[1] ||
      line.match(/^ {0,3}(~{3,}).*$/)?.[1];
    if (opening) {
      fence = { character: opening[0], length: opening.length };
      continue;
    }
    visible.push(line);
  }
  return { lines: visible, unterminatedFence: fence !== null };
}

function validateEvaluation(markdown, taskId, options) {
  const lines = markdown.lines;
  const taskIds = lines.flatMap((line) => {
    const match = line.match(/^- Task ID:\s*`((?:NEXO|FIAD)-\d{4})`\s*$/);
    return match ? [match[1]] : [];
  });
  if (taskIds.length !== 1 || taskIds[0] !== taskId) {
    return {
      code: "EVIDENCE_TASK_MISMATCH",
      message: `evaluation must contain exactly one Task ID metadata field for ${taskId}`,
    };
  }

  const heading = `## ${options.evaluationHeading}`;
  const headingIndexes = lines.flatMap((line, index) => (line === heading ? [index] : []));
  if (headingIndexes.length === 0) {
    return {
      code: "EVIDENCE_INVALID",
      message: `evaluation must contain one ${heading} heading`,
    };
  }
  if (headingIndexes.length > 1) {
    return {
      code: "REVIEW_DECISION_AMBIGUOUS",
      message: `evaluation must contain exactly one ${heading} heading`,
    };
  }
  const sectionStart = headingIndexes[0] + 1;
  const nextHeading = lines.findIndex((line, index) => index >= sectionStart && /^#{1,2}\s+/.test(line));
  const sectionEnd = nextHeading === -1 ? lines.length : nextHeading;

  const decisions = lines.flatMap((line, index) => {
    const match = line.match(/^- Decision:\s*(.+?)\s*$/);
    return match ? [{ index, value: match[1].toLowerCase() }] : [];
  });
  if (
    decisions.length !== 1 ||
    decisions[0].index < sectionStart ||
    decisions[0].index >= sectionEnd
  ) {
    return {
      code: "REVIEW_DECISION_AMBIGUOUS",
      message: "evaluation must contain exactly one decision field inside its evaluation section",
    };
  }
  if (decisions[0].value !== options.decision) {
    return {
      code: "REVIEW_NOT_APPROVED",
      message: `evaluation decision must be ${options.decision}`,
    };
  }

  const fields = new Map();
  for (const line of lines.slice(sectionStart, sectionEnd)) {
    const match = line.match(/^- ([^:]+):\s*(.*?)\s*$/);
    if (!match || match[1] === "Decision") continue;
    if (fields.has(match[1])) {
      return {
        code: "EVIDENCE_INVALID",
        message: `evaluation field ${match[1]} must appear exactly once`,
      };
    }
    fields.set(match[1], match[2]);
  }
  for (const required of options.requiredFields) {
    const value = fields.get(required);
    if (!value || /^(?:tbd|todo|unknown|n\/a|-)$/i.test(value)) {
      return {
        code: "EVIDENCE_INVALID",
        message: `evaluation field ${required} must contain a non-placeholder value`,
      };
    }
  }
  return null;
}

function createDecision(task, manifest, operation, manifestPath) {
  return {
    schemaVersion: 1,
    ok: true,
    task: task
      ? { id: task.id, status: task.status, priority: task.priority, title: task.title }
      : { id: manifest.taskId, status: null, priority: null, title: null },
    manifest: {
      path: manifestPath,
      status: manifest.status,
      updatedAt: manifest.updatedAt,
    },
    operation,
    checks: [],
    blockers: [],
  };
}

function addCheck(decision, name, ok, message, evidence = null) {
  decision.checks.push({ name, ok, message, evidence });
}

function addBlocker(decision, code, message) {
  if (!decision.blockers.some((blocker) => blocker.code === code && blocker.message === message)) {
    decision.blockers.push({ code, message });
  }
  decision.ok = false;
}

async function loadContext({ rootDir, taskId, operation }) {
  validateTaskId(taskId);
  const root = path.resolve(rootDir || process.cwd());
  const realRoot = await realpath(root);
  const manifestRelative = `harness/control/state/tasks/${taskId}.json`;
  const manifestFile = path.join(root, manifestRelative);
  const tasksFile = path.join(root, "harness/control/tasks.md");
  const [manifest, tasksText] = await Promise.all([
    readJson(manifestFile, "task manifest"),
    readFile(tasksFile, "utf8").catch((error) => {
      if (error?.code === "ENOENT") {
        throw new ControlEngineInputError(`task index is missing: ${tasksFile}`);
      }
      throw error;
    }),
  ]);
  validateManifest(manifest, taskId);
  const matches = parseTaskRows(tasksText).filter((task) => task.id === taskId);
  const task = matches.length === 1 ? matches[0] : null;
  const decision = createDecision(task, manifest, operation, manifestRelative);

  if (matches.length !== 1) {
    addCheck(decision, "task-index-entry", false, `tasks.md contains ${matches.length} rows for ${taskId}`);
    addBlocker(decision, "TASK_INDEX_CONFLICT", `tasks.md must contain exactly one row for ${taskId}`);
  } else {
    addCheck(decision, "task-index-entry", true, `tasks.md contains one row for ${taskId}`);
    const synchronized = task.status === manifest.status;
    addCheck(
      decision,
      "state-synchronization",
      synchronized,
      synchronized
        ? `manifest and tasks.md agree on ${task.status}`
        : `manifest is ${manifest.status} while tasks.md is ${task.status}`,
    );
    if (!synchronized) {
      addBlocker(
        decision,
        "STATE_CONFLICT",
        `manifest status ${manifest.status} conflicts with tasks.md status ${task.status}`,
      );
    }
  }

  const artifactFiles = {};
  for (const [name, relativePath] of Object.entries(manifest.artifacts)) {
    if (relativePath === null) continue;
    const resolved = resolveInsideRoot(root, relativePath);
    if (!resolved) {
      artifactFiles[name] = null;
      addCheck(decision, `artifact-path:${name}`, false, `${relativePath} escapes the repository`, relativePath);
      addBlocker(decision, "UNSAFE_PATH", `manifest.artifacts.${name} escapes the repository`);
    } else if (!artifactPathIsAllowed(name, relativePath)) {
      artifactFiles[name] = null;
      addCheck(
        decision,
        `artifact-path:${name}`,
        false,
        `${relativePath} is outside the canonical ${name} evidence directories`,
        relativePath,
      );
      addBlocker(
        decision,
        "EVIDENCE_PATH_NOT_ALLOWED",
        `manifest.artifacts.${name} is outside its canonical evidence directories`,
      );
    } else {
      artifactFiles[name] = resolved;
    }
  }

  if (task) {
    const planMatches = taskLinkMatches(root, tasksFile, task.plan, artifactFiles.plan);
    addCheck(
      decision,
      "plan-synchronization",
      planMatches,
      planMatches
        ? "manifest plan matches the tasks.md plan link"
        : `manifest plan ${manifest.artifacts.plan || "missing"} conflicts with tasks.md plan ${task.plan}`,
      manifest.artifacts.plan,
    );
    if (!planMatches) {
      addBlocker(decision, "PLAN_CONFLICT", "manifest plan conflicts with the canonical task row");
    }
  }

  return { root, realRoot, task, manifest, artifactFiles, decision };
}

function checkStatus(context, allowed) {
  const { task, decision } = context;
  const ok = task !== null && allowed.includes(task.status);
  addCheck(
    decision,
    "operation-status",
    ok,
    ok ? `status ${task.status} is allowed` : `status ${task?.status || "missing"} is not one of ${allowed.join(", ")}`,
  );
  if (!ok) {
    addBlocker(decision, "STATUS_NOT_ALLOWED", `operation requires status ${allowed.join(" or ")}`);
  }
}

async function checkArtifact(context, name, options = {}) {
  const { manifest, artifactFiles, decision } = context;
  const relativePath = manifest.artifacts[name];
  if (!relativePath) {
    addCheck(decision, `artifact:${name}`, false, `${name} evidence is not declared`);
    addBlocker(decision, "EVIDENCE_MISSING", `${name} evidence is required`);
    return null;
  }
  const file = artifactFiles[name];
  if (!file) return null;

  let text;
  try {
    const actualFile = await realpath(file);
    if (actualFile !== context.realRoot && !actualFile.startsWith(`${context.realRoot}${path.sep}`)) {
      addCheck(decision, `artifact:${name}`, false, `${relativePath} resolves outside the repository`, relativePath);
      addBlocker(decision, "UNSAFE_PATH", `${name} evidence resolves outside the repository`);
      return null;
    }
    if (!(await realArtifactPathIsAllowed(context, name, actualFile))) {
      addCheck(
        decision,
        `artifact:${name}`,
        false,
        `${relativePath} resolves outside the canonical ${name} evidence directories`,
        relativePath,
      );
      addBlocker(
        decision,
        "EVIDENCE_PATH_NOT_ALLOWED",
        `${name} evidence resolves outside its canonical directories`,
      );
      return null;
    }
    text = await readFile(actualFile, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    addCheck(decision, `artifact:${name}`, false, `${relativePath} is missing`, relativePath);
    addBlocker(decision, "EVIDENCE_MISSING", `${name} evidence file is missing`);
    return null;
  }

  if (!text.includes(manifest.taskId)) {
    addCheck(decision, `artifact:${name}`, false, `${relativePath} does not reference ${manifest.taskId}`, relativePath);
    addBlocker(decision, "EVIDENCE_TASK_MISMATCH", `${name} evidence does not reference ${manifest.taskId}`);
    return null;
  }
  const markdown = visibleMarkdown(text);
  if (
    markdown.unterminatedFence &&
    (options.heading || options.evaluationHeading || options.decision)
  ) {
    addCheck(decision, `artifact:${name}`, false, `${relativePath} has an unterminated fence`, relativePath);
    addBlocker(decision, "EVIDENCE_INVALID", `${name} evidence has an unterminated fence`);
    return null;
  }
  const visibleText = markdown.lines.join("\n");
  if (options.heading && !options.heading.test(visibleText)) {
    addCheck(decision, `artifact:${name}`, false, `${relativePath} lacks its required heading`, relativePath);
    addBlocker(decision, "EVIDENCE_INVALID", `${name} evidence lacks its required heading`);
    return null;
  }
  if (options.evaluationHeading) {
    const invalid = validateEvaluation(markdown, manifest.taskId, options);
    if (invalid) {
      addCheck(decision, `artifact:${name}`, false, `${relativePath}: ${invalid.message}`, relativePath);
      addBlocker(decision, invalid.code, `${name} ${invalid.message}`);
      return null;
    }
  }
  if (options.decision) {
    const decisions = markdown.lines.flatMap((line) => {
      const match = line.match(/^- Decision:\s*(.+?)\s*$/);
      return match ? [match[1]] : [];
    });
    if (decisions.length !== 1) {
      addCheck(
        decision,
        `artifact:${name}`,
        false,
        `${relativePath} contains ${decisions.length} decision fields, expected exactly one`,
        relativePath,
      );
      addBlocker(
        decision,
        "REVIEW_DECISION_AMBIGUOUS",
        `${name} evidence must contain exactly one decision field`,
      );
      return null;
    }
    const recorded = decisions[0].toLowerCase();
    if (recorded !== options.decision) {
      addCheck(
        decision,
        `artifact:${name}`,
        false,
        `${relativePath} decision is ${recorded || "missing"}, expected ${options.decision}`,
        relativePath,
      );
      addBlocker(decision, "REVIEW_NOT_APPROVED", `${name} decision must be ${options.decision}`);
      return null;
    }
  }

  addCheck(decision, `artifact:${name}`, true, `${relativePath} is valid`, relativePath);
  return text;
}

async function checkExecutionSource(context) {
  const names = ["handoff", "investigation"].filter((name) => context.manifest.artifacts[name]);
  if (names.length === 0) {
    addCheck(context.decision, "execution-source", false, "no handoff or investigation is declared");
    addBlocker(context.decision, "EVIDENCE_MISSING", "build requires a handoff or investigation");
    return;
  }
  for (const name of names) await checkArtifact(context, name);
}

async function checkPreBuildRequirements(context) {
  for (const name of [
    "architectureDecision",
    "dependencyApproval",
    "migrationPlan",
    "externalApproval",
  ]) {
    if (context.manifest.requirements[name]) {
      await checkArtifact(context, name, PRE_BUILD_EVALUATIONS[name]);
    } else {
      addCheck(context.decision, `requirement:${name}`, true, `${name} is explicitly not required`);
    }
  }
}

function checkVerification(context, reportText) {
  const declared = context.manifest.verification.length > 0;
  addCheck(
    context.decision,
    "verification",
    declared,
    declared
      ? `${context.manifest.verification.length} verification command(s) declared`
      : "no verification commands are declared",
  );
  if (!declared) {
    addBlocker(context.decision, "VERIFICATION_MISSING", "at least one verification command is required");
    return;
  }
  if (!reportText) return;
  for (const command of context.manifest.verification) {
    const recorded = reportText.includes(command);
    addCheck(
      context.decision,
      `verification-record:${command}`,
      recorded,
      recorded ? "verification command is recorded in the report" : "verification command is absent from the report",
      context.manifest.artifacts.report,
    );
    if (!recorded) {
      addBlocker(
        context.decision,
        "VERIFICATION_NOT_RECORDED",
        `report does not record verification command: ${command}`,
      );
    }
  }
}

async function checkImplementationEvidence(context) {
  const reportText = await checkArtifact(context, "report", {
    heading: /^## Verification(?: Performed)?\s*$/m,
  });
  await checkArtifact(context, "implementation");
  checkVerification(context, reportText);
}

async function checkBuild(context, allowedStatuses = ["active"]) {
  checkStatus(context, allowedStatuses);
  await checkArtifact(context, "plan");
  await checkExecutionSource(context);
  await checkPreBuildRequirements(context);
}

async function checkReview(context) {
  checkStatus(context, ["active", "implemented"]);
  await checkPreBuildRequirements(context);
  await checkImplementationEvidence(context);
}

async function checkClose(context) {
  checkStatus(context, ["implemented"]);
  await checkPreBuildRequirements(context);
  await checkImplementationEvidence(context);
  await checkArtifact(context, "closeout");
  if (context.manifest.requirements.qaReview) {
    await checkArtifact(context, "qa", REVIEW_EVALUATIONS.qa);
  } else {
    addCheck(context.decision, "requirement:qaReview", true, "qaReview is explicitly not required");
  }
  if (context.manifest.requirements.securityReview) {
    await checkArtifact(context, "security", REVIEW_EVALUATIONS.security);
  } else {
    addCheck(context.decision, "requirement:securityReview", true, "securityReview is explicitly not required");
  }
  if (context.manifest.requirements.releaseReadiness) {
    await checkArtifact(context, "releaseReadiness", REVIEW_EVALUATIONS.release);
  } else {
    addCheck(context.decision, "requirement:releaseReadiness", true, "releaseReadiness is explicitly not required");
  }
}

async function checkRelease(context) {
  checkStatus(context, ["active", "implemented"]);
  await checkPreBuildRequirements(context);
  await checkImplementationEvidence(context);
  if (!context.manifest.requirements.releaseReadiness) {
    addCheck(context.decision, "requirement:releaseReadiness", false, "release readiness is not required by the task");
    addBlocker(context.decision, "RELEASE_NOT_REQUIRED", "release gate requires requirements.releaseReadiness=true");
    return;
  }
  await checkArtifact(context, "releaseReadiness", REVIEW_EVALUATIONS.release);
}

export async function inspectTask(options) {
  const context = await loadContext({
    ...options,
    operation: { type: "inspect", name: "state" },
  });
  return context.decision;
}

export async function evaluateGate(options) {
  if (!GATES.has(options.gate)) {
    throw new ControlEngineInputError(`unsupported gate: ${options.gate}`);
  }
  const context = await loadContext({
    ...options,
    operation: { type: "gate", name: options.gate },
  });
  if (options.gate === "build") await checkBuild(context);
  else if (options.gate === "qa" || options.gate === "security") await checkReview(context);
  else if (options.gate === "release") await checkRelease(context);
  else await checkClose(context);
  return context.decision;
}

export async function evaluateTransition(options) {
  if (!STATUSES.has(options.to)) {
    throw new ControlEngineInputError(`unsupported target status: ${options.to}`);
  }
  const context = await loadContext({
    ...options,
    operation: { type: "transition", name: `${options.taskId}->${options.to}`, to: options.to },
  });
  const from = context.task?.status || context.manifest.status;
  context.decision.operation.name = `${from}->${options.to}`;
  const transition = `${from}->${options.to}`;
  if (!TRANSITIONS.has(transition)) {
    addCheck(context.decision, "lifecycle-transition", false, `${transition} is not declared`);
    addBlocker(context.decision, "INVALID_TRANSITION", `${transition} is not an allowed lifecycle transition`);
    return context.decision;
  }
  addCheck(context.decision, "lifecycle-transition", true, `${transition} is declared`);

  if (
    transition === "planned->active" ||
    transition === "blocked->active" ||
    transition === "implemented->active"
  ) {
    await checkBuild(context, [from]);
  } else if (transition === "active->implemented") {
    checkStatus(context, ["active"]);
    await checkPreBuildRequirements(context);
    await checkImplementationEvidence(context);
  } else if (transition === "implemented->closed") {
    await checkClose(context);
  } else {
    checkStatus(context, [from]);
  }
  return context.decision;
}

function parseCliArguments(argv) {
  const [command, ...rest] = argv;
  if (!command || !["inspect", "gate", "transition"].includes(command)) {
    throw new ControlEngineInputError("command must be inspect, gate, or transition");
  }
  const options = { command };
  for (let index = 0; index < rest.length; index += 1) {
    const flag = rest[index];
    const value = rest[++index];
    if (!value) throw new ControlEngineInputError(`${flag} requires a value`);
    if (flag === "--root") options.rootDir = value;
    else if (flag === "--task") options.taskId = value;
    else if (flag === "--name") options.gate = value;
    else if (flag === "--to") options.to = value;
    else throw new ControlEngineInputError(`unknown argument: ${flag}`);
  }
  validateTaskId(options.taskId);
  if (command === "gate" && !options.gate) throw new ControlEngineInputError("gate requires --name");
  if (command === "transition" && !options.to) {
    throw new ControlEngineInputError("transition requires --to");
  }
  return options;
}

export async function runControlEngineCli(argv) {
  try {
    const options = parseCliArguments(argv);
    let decision;
    if (options.command === "inspect") decision = await inspectTask(options);
    else if (options.command === "gate") decision = await evaluateGate(options);
    else decision = await evaluateTransition(options);
    process.stdout.write(`${JSON.stringify(decision, null, 2)}\n`);
    if (!decision.ok) process.exitCode = 2;
  } catch (error) {
    const output = {
      schemaVersion: 1,
      ok: false,
      error: {
        code: error?.code || "CONTROL_ENGINE_ERROR",
        message: error?.message || String(error),
      },
    };
    process.stderr.write(`${JSON.stringify(output, null, 2)}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await runControlEngineCli(process.argv.slice(2));
}
