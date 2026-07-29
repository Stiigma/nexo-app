#!/usr/bin/env node
// Created by: Codex (AI-assisted), 2026-07-29

import { mkdir, readFile, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const TASK_ID = /^NEXO-\d{4}$/;
const STATUSES = new Set(["planned", "active", "implemented", "blocked", "closed"]);
const CONTROL_LEVELS = new Set(["normal", "controlled"]);
const PRIORITIES = new Set(["P0", "P1", "P2", "P3"]);
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
const REQUIREMENT_KEYS = [
  "architectureDecision",
  "dependencyApproval",
  "migrationPlan",
  "qaReview",
  "securityReview",
  "externalApproval",
  "releaseReadiness",
];

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const nowIso = (clock) => clock().toISOString();

function assertObject(value, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${field} must be an object`);
}

function assertString(value, field) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} must be a non-empty string`);
}

function stringArray(value, field) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || !entry.trim())) {
    throw new Error(`${field} must be an array of non-empty strings`);
  }
  return [...new Set(value.map((entry) => entry.trim()))];
}

function cleanCell(value = "") {
  return value.replaceAll("`", "").trim();
}

export function parseTaskRows(markdown) {
  return markdown.split(/\r?\n/).flatMap((raw, index) => {
    if (!/^\|\s*NEXO-\d{4}\s*\|/.test(raw)) return [];
    const cells = raw.slice(1, -1).split("|").map((cell) => cell.trim());
    return [{
      raw,
      index,
      id: cleanCell(cells[0]),
      status: cleanCell(cells[1]),
      priority: cleanCell(cells[2]),
      title: cleanCell(cells[3]),
      plan: cleanCell(cells[4]),
      latestReport: cleanCell(cells[5]),
      closeout: cleanCell(cells[6]),
      nextStep: cleanCell(cells[7]),
    }];
  });
}

function markdownCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ").trim();
}

function taskLink(relativePath) {
  if (!relativePath) return "_none_";
  return `\`${relativePath.replace(/^harness\/control\//, "")}\``;
}

function renderTaskRow(manifest) {
  const continuity = manifest.continuity;
  return [
    manifest.taskId,
    manifest.status,
    manifest.priority || "P1",
    markdownCell(manifest.title || continuity?.objective || manifest.taskId),
    taskLink(manifest.artifacts.plan),
    taskLink(manifest.artifacts.report),
    taskLink(manifest.artifacts.closeout),
    markdownCell(continuity?.nextStep || "Define the next action before resuming."),
  ].join(" | ").replace(/^/, "| ").concat(" |");
}

function validateContinuity(value) {
  assertObject(value, "manifest.continuity");
  for (const key of ["objective", "summary", "nextStep"]) assertString(value[key], `manifest.continuity.${key}`);
  for (const key of ["decisions", "openQuestions"]) stringArray(value[key], `manifest.continuity.${key}`);
  if (value.checkpointedAt !== null) {
    assertString(value.checkpointedAt, "manifest.continuity.checkpointedAt");
    if (Number.isNaN(new Date(value.checkpointedAt).getTime())) {
      throw new Error("manifest.continuity.checkpointedAt must be an ISO date-time or null");
    }
  }
}

export function validateManifest(manifest, expectedTaskId = manifest?.taskId) {
  assertObject(manifest, "manifest");
  if (manifest.schemaVersion !== 1) throw new Error("manifest.schemaVersion must be 1");
  if (!TASK_ID.test(manifest.taskId || "") || manifest.taskId !== expectedTaskId) throw new Error("manifest.taskId is invalid");
  if (!STATUSES.has(manifest.status)) throw new Error(`unsupported manifest status: ${manifest.status}`);
  assertString(manifest.updatedAt, "manifest.updatedAt");
  if (Number.isNaN(new Date(manifest.updatedAt).getTime())) throw new Error("manifest.updatedAt must be an ISO date-time");
  assertObject(manifest.requirements, "manifest.requirements");
  for (const key of REQUIREMENT_KEYS) {
    if (key === "releaseReadiness" && manifest.requirements[key] === undefined) continue;
    if (typeof manifest.requirements[key] !== "boolean") throw new Error(`manifest.requirements.${key} must be boolean`);
  }
  assertObject(manifest.artifacts, "manifest.artifacts");
  for (const key of ARTIFACT_KEYS) {
    const value = manifest.artifacts[key];
    if (key === "releaseReadiness" && value === undefined) continue;
    if (value !== null && (typeof value !== "string" || !value.trim())) {
      throw new Error(`manifest.artifacts.${key} must be a relative path or null`);
    }
  }
  if (!Array.isArray(manifest.verification) || manifest.verification.some((entry) => typeof entry !== "string" || !entry.trim())) {
    throw new Error("manifest.verification must be an array of non-empty strings");
  }
  if (manifest.controlLevel !== undefined && !CONTROL_LEVELS.has(manifest.controlLevel)) {
    throw new Error("manifest.controlLevel must be normal or controlled");
  }
  if (manifest.title !== undefined) assertString(manifest.title, "manifest.title");
  if (manifest.priority !== undefined && !PRIORITIES.has(manifest.priority)) throw new Error("manifest.priority is invalid");
  if (manifest.continuity !== undefined) validateContinuity(manifest.continuity);
  if (manifest.contract !== undefined) {
    assertObject(manifest.contract, "manifest.contract");
    stringArray(manifest.contract.requirementSources, "manifest.contract.requirementSources");
    stringArray(manifest.contract.acceptanceCriteria, "manifest.contract.acceptanceCriteria");
  }
  return manifest;
}

function resolveInside(rootDir, relativePath) {
  if (typeof relativePath !== "string" || path.isAbsolute(relativePath) || relativePath.includes("\\")) {
    throw new Error("path must be portable and project-relative");
  }
  const root = path.resolve(rootDir);
  const resolved = path.resolve(root, relativePath);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) throw new Error("path escapes the project");
  return resolved;
}

async function readJson(file, rootDir) {
  const [canonicalRoot, canonicalFile] = await Promise.all([realpath(rootDir), realpath(file)]);
  const relative = path.relative(canonicalRoot, canonicalFile);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("JSON source resolves outside the project");
  return JSON.parse(await readFile(canonicalFile, "utf8"));
}

async function atomicWrite(file, content) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.${Math.random().toString(16).slice(2)}.tmp`;
  try {
    await writeFile(temporary, content, { encoding: "utf8", mode: 0o600 });
    await rename(temporary, file);
  } finally {
    await rm(temporary, { force: true });
  }
}

async function withLock(rootDir, name, work) {
  const lock = resolveInside(rootDir, `harness/control/state/.${name}.lock`);
  const started = Date.now();
  await mkdir(path.dirname(lock), { recursive: true });
  while (true) {
    try {
      await mkdir(lock);
      break;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      const age = await stat(lock).then((value) => Date.now() - value.mtimeMs).catch(() => 0);
      if (age > 30_000) {
        await rm(lock, { recursive: true, force: true });
        continue;
      }
      if (Date.now() - started > 4_000) throw new Error(`timed out waiting for ${name} state lock`);
      await wait(10);
    }
  }
  try {
    return await work();
  } finally {
    await rm(lock, { recursive: true, force: true });
  }
}

function list(items, empty = "- None.") {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : empty;
}

function renderProjection(manifest) {
  const continuity = manifest.continuity;
  return `# ${manifest.taskId} - ${manifest.title}

> Generated from \`harness/control/state/tasks/${manifest.taskId}.json\`.
> Update it with \`nexo-work continuity checkpoint\`; do not edit this projection directly.

## State

- Control level: ${manifest.controlLevel}
- Status: ${manifest.status}
- Priority: ${manifest.priority}
- Last checkpoint: ${continuity.checkpointedAt || "not checkpointed"}

## Objective

${continuity.objective}

## Current Summary

${continuity.summary}

## Decisions

${list(continuity.decisions)}

## Open Questions

${list(continuity.openQuestions)}

## Requirement Sources

${list(manifest.contract.requirementSources)}

## Acceptance Criteria

${list(manifest.contract.acceptanceCriteria)}

## Verification

${list(manifest.verification)}

## Next Step

${continuity.nextStep}
`;
}

async function writeProjection(rootDir, manifest) {
  await atomicWrite(resolveInside(rootDir, `harness/control/work/${manifest.taskId}.md`), renderProjection(manifest));
}

async function saveManifest(rootDir, manifest) {
  validateManifest(manifest);
  await atomicWrite(
    resolveInside(rootDir, `harness/control/state/tasks/${manifest.taskId}.json`),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

async function loadManifest(rootDir, taskId) {
  if (!TASK_ID.test(taskId || "")) throw new Error("task must match NEXO-0000");
  return validateManifest(await readJson(resolveInside(rootDir, `harness/control/state/tasks/${taskId}.json`), rootDir), taskId);
}

async function manifestFiles(rootDir) {
  const directory = resolveInside(rootDir, "harness/control/state/tasks");
  const { readdir } = await import("node:fs/promises");
  return (await readdir(directory)).filter((name) => /^NEXO-\d{4}\.json$/.test(name)).sort();
}

async function loadAll(rootDir) {
  return Promise.all((await manifestFiles(rootDir)).map((name) =>
    readJson(resolveInside(rootDir, `harness/control/state/tasks/${name}`), rootDir).then((value) => validateManifest(value)),
  ));
}

async function updateTaskIndex(rootDir, manifest, { create = false } = {}) {
  const file = resolveInside(rootDir, "harness/control/tasks.md");
  const text = await readFile(file, "utf8");
  const lines = text.split(/\r?\n/);
  const rows = parseTaskRows(text).filter((row) => row.id === manifest.taskId);
  if (create && rows.length) throw new Error(`${manifest.taskId} already exists in tasks.md`);
  if (!create && rows.length !== 1) throw new Error(`tasks.md must contain one row for ${manifest.taskId}`);
  const row = renderTaskRow(manifest);
  if (create) {
    const fiadIndex = lines.findIndex((line) => /^\|\s*FIAD-\d{4}\s*\|/.test(line));
    if (fiadIndex >= 0) lines.splice(fiadIndex, 0, row);
    else lines.push(row);
  } else {
    lines[rows[0].index] = row;
  }
  await atomicWrite(file, `${lines.join("\n").replace(/\n+$/, "")}\n`);
}

async function nextTaskId(rootDir) {
  const tasks = parseTaskRows(await readFile(resolveInside(rootDir, "harness/control/tasks.md"), "utf8"));
  const manifests = await loadAll(rootDir);
  const numbers = [...tasks.map((task) => task.id), ...manifests.map((manifest) => manifest.taskId)]
    .map((id) => Number(id.slice(5)));
  return `NEXO-${String(Math.max(0, ...numbers) + 1).padStart(4, "0")}`;
}

function normalizeCreate(input) {
  assertObject(input, "continuity input");
  assertString(input.title, "continuity.title");
  assertString(input.objective, "continuity.objective");
  const priority = input.priority || "P1";
  if (!PRIORITIES.has(priority)) throw new Error("continuity.priority must be P0, P1, P2, or P3");
  return {
    title: input.title.trim(),
    objective: input.objective.trim(),
    summary: (input.summary || "Idea recorded; implementation has not started.").trim(),
    decisions: stringArray(input.decisions || [], "continuity.decisions"),
    openQuestions: stringArray(input.openQuestions || [], "continuity.openQuestions"),
    requirementSources: stringArray(input.requirementSources || [], "continuity.requirementSources"),
    acceptanceCriteria: stringArray(input.acceptanceCriteria || [], "continuity.acceptanceCriteria"),
    verification: stringArray(input.verification || [], "continuity.verification"),
    nextStep: (input.nextStep || "Confirm the intended outcome and define the smallest implementation slice.").trim(),
    priority,
  };
}

async function createContinuity(rootDir, input, clock) {
  const normalized = normalizeCreate(input);
  return withLock(rootDir, "continuity-index", async () => {
    const taskId = await nextTaskId(rootDir);
    const workPath = `harness/control/work/${taskId}.md`;
    const manifest = {
      schemaVersion: 1,
      taskId,
      status: "planned",
      updatedAt: nowIso(clock),
      title: normalized.title,
      priority: normalized.priority,
      controlLevel: "normal",
      continuity: {
        objective: normalized.objective,
        summary: normalized.summary,
        decisions: normalized.decisions,
        openQuestions: normalized.openQuestions,
        nextStep: normalized.nextStep,
        checkpointedAt: null,
      },
      contract: {
        requirementSources: normalized.requirementSources,
        acceptanceCriteria: normalized.acceptanceCriteria,
      },
      requirements: Object.fromEntries(REQUIREMENT_KEYS.map((key) => [key, false])),
      artifacts: Object.fromEntries(ARTIFACT_KEYS.map((key) => [key, key === "plan" ? workPath : null])),
      verification: normalized.verification,
    };
    await saveManifest(rootDir, manifest);
    await writeProjection(rootDir, manifest);
    await updateTaskIndex(rootDir, manifest, { create: true });
    return { ok: true, taskId, manifest: `harness/control/state/tasks/${taskId}.json`, projection: workPath };
  });
}

function normalizeCheckpoint(input) {
  assertObject(input, "continuity checkpoint");
  const allowed = new Set(["summary", "decisions", "openQuestions", "nextStep", "requirementSources", "acceptanceCriteria", "verification"]);
  for (const key of Object.keys(input)) if (!allowed.has(key)) throw new Error(`unsupported checkpoint field: ${key}`);
  const normalized = {};
  for (const key of ["summary", "nextStep"]) {
    if (input[key] !== undefined) {
      assertString(input[key], `checkpoint.${key}`);
      normalized[key] = input[key].trim();
    }
  }
  for (const key of ["decisions", "openQuestions", "requirementSources", "acceptanceCriteria", "verification"]) {
    if (input[key] !== undefined) normalized[key] = stringArray(input[key], `checkpoint.${key}`);
  }
  if (!Object.keys(normalized).length) throw new Error("checkpoint requires at least one changed field");
  return normalized;
}

async function checkpointContinuity(rootDir, taskId, input, clock) {
  const patch = normalizeCheckpoint(input);
  return withLock(rootDir, `continuity-${taskId}`, async () => {
    const manifest = await loadManifest(rootDir, taskId);
    if (!manifest.continuity) throw new Error(`${taskId} has no continuity record`);
    manifest.continuity = {
      ...manifest.continuity,
      ...Object.fromEntries(Object.entries(patch).filter(([key]) => ["summary", "decisions", "openQuestions", "nextStep"].includes(key))),
      checkpointedAt: nowIso(clock),
    };
    manifest.contract = {
      requirementSources: patch.requirementSources ?? manifest.contract?.requirementSources ?? [],
      acceptanceCriteria: patch.acceptanceCriteria ?? manifest.contract?.acceptanceCriteria ?? [],
    };
    manifest.verification = patch.verification ?? manifest.verification;
    manifest.updatedAt = nowIso(clock);
    await saveManifest(rootDir, manifest);
    await writeProjection(rootDir, manifest);
    await updateTaskIndex(rootDir, manifest);
    return { ok: true, taskId, checkpointedAt: manifest.continuity.checkpointedAt };
  });
}

function searchTokens(value) {
  return new Set(String(value || "").toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || []);
}

async function findContinuity(rootDir, options = {}) {
  const query = searchTokens(options.query);
  const manifests = (await loadAll(rootDir)).filter((manifest) => manifest.continuity);
  const matches = manifests.flatMap((manifest) => {
    if (options.controlLevel && manifest.controlLevel !== options.controlLevel) return [];
    const continuity = manifest.continuity;
    const haystack = searchTokens([
      manifest.title,
      continuity.objective,
      continuity.summary,
      continuity.nextStep,
      ...continuity.decisions,
      ...continuity.openQuestions,
    ].join(" "));
    const score = [...query].filter((token) => haystack.has(token)).length;
    if (query.size && score === 0) return [];
    return [{
      taskId: manifest.taskId,
      title: manifest.title,
      status: manifest.status,
      controlLevel: manifest.controlLevel,
      objective: continuity.objective,
      summary: continuity.summary,
      nextStep: continuity.nextStep,
      checkpointedAt: continuity.checkpointedAt,
      score,
    }];
  });
  matches.sort((left, right) => right.score - left.score || left.taskId.localeCompare(right.taskId));
  return { ok: true, matches, requiresExplicitSelection: matches.length !== 1 };
}

async function resumeContinuity(rootDir, taskId) {
  const manifest = await loadManifest(rootDir, taskId);
  if (!manifest.continuity) throw new Error(`${taskId} has no continuity record`);
  return {
    ok: true,
    taskId,
    title: manifest.title,
    status: manifest.status,
    controlLevel: manifest.controlLevel || "controlled",
    continuity: manifest.continuity,
    contract: manifest.contract || { requirementSources: [], acceptanceCriteria: [] },
    verification: manifest.verification,
    requiresExplicitConfirmation: true,
  };
}

async function promoteContinuity(rootDir, taskId, clock) {
  return withLock(rootDir, `continuity-${taskId}`, async () => {
    const manifest = await loadManifest(rootDir, taskId);
    if (!manifest.continuity) throw new Error(`${taskId} has no continuity record`);
    if (manifest.controlLevel !== "controlled") {
      manifest.controlLevel = "controlled";
      manifest.continuity.summary = `${manifest.continuity.summary} Promoted to Controlled after crossing a governed risk boundary.`;
      manifest.continuity.checkpointedAt = nowIso(clock);
      manifest.updatedAt = nowIso(clock);
      await saveManifest(rootDir, manifest);
      await writeProjection(rootDir, manifest);
      await updateTaskIndex(rootDir, manifest);
    }
    return { ok: true, taskId, controlLevel: "controlled", sameTaskId: true };
  });
}

async function doctor(rootDir) {
  const manifests = await loadAll(rootDir);
  const tasksText = await readFile(resolveInside(rootDir, "harness/control/tasks.md"), "utf8");
  const rows = parseTaskRows(tasksText);
  const problems = [];
  for (const manifest of manifests) {
    const matches = rows.filter((row) => row.id === manifest.taskId);
    if (matches.length !== 1) problems.push(`${manifest.taskId}: tasks.md contains ${matches.length} rows`);
    else if (matches[0].status !== manifest.status) problems.push(`${manifest.taskId}: status differs from tasks.md`);
    if (manifest.continuity) {
      const projection = resolveInside(rootDir, `harness/control/work/${manifest.taskId}.md`);
      await stat(projection).catch(() => problems.push(`${manifest.taskId}: continuity projection is missing`));
    }
  }
  const governedIds = new Set(manifests.map((manifest) => manifest.taskId));
  for (const row of rows) {
    if (Number(row.id.slice(5)) >= 46 && !governedIds.has(row.id)) {
      problems.push(`${row.id}: governed task manifest is missing`);
    }
  }
  return { ok: problems.length === 0, manifests: manifests.length, continuity: manifests.filter((value) => value.continuity).length, problems };
}

function parse(argv) {
  const positionals = [];
  const flags = {};
  const repeatable = new Set(["decision", "open-question", "requirement-source", "acceptance", "verify"]);
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) positionals.push(value);
    else if (repeatable.has(value.slice(2))) {
      flags[value.slice(2)] = flags[value.slice(2)] || [];
      flags[value.slice(2)].push(argv[++index]);
    } else flags[value.slice(2)] = argv[++index];
  }
  return { positionals, flags };
}

function createFlags(flags) {
  return {
    title: flags.title,
    objective: flags.objective,
    summary: flags.summary,
    decisions: flags.decision,
    openQuestions: flags["open-question"],
    requirementSources: flags["requirement-source"],
    acceptanceCriteria: flags.acceptance,
    verification: flags.verify,
    nextStep: flags["next-step"],
    priority: flags.priority,
  };
}

function checkpointFlags(flags) {
  return Object.fromEntries(Object.entries({
    summary: flags.summary,
    decisions: flags.decision,
    openQuestions: flags["open-question"],
    requirementSources: flags["requirement-source"],
    acceptanceCriteria: flags.acceptance,
    verification: flags.verify,
    nextStep: flags["next-step"],
  }).filter(([, value]) => value !== undefined));
}

export async function runNexoWorkCli(argv, options = {}) {
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const clock = options.clock || (() => new Date());
  const { positionals, flags } = parse(argv);
  const [domain, action, argument] = positionals;
  let result;
  if (domain === "continuity" && action === "create") result = await createContinuity(rootDir, createFlags(flags), clock);
  else if (domain === "continuity" && action === "checkpoint") result = await checkpointContinuity(rootDir, flags.task || argument, checkpointFlags(flags), clock);
  else if (domain === "continuity" && action === "find") result = await findContinuity(rootDir, { query: flags.query, controlLevel: flags.level });
  else if (domain === "continuity" && action === "resume") result = await resumeContinuity(rootDir, flags.task || argument);
  else if (domain === "continuity" && action === "promote") result = await promoteContinuity(rootDir, flags.task || argument, clock);
  else if (domain === "doctor") result = await doctor(rootDir);
  else throw new Error("command must be continuity create|checkpoint|find|resume|promote or doctor");
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    await runNexoWorkCli(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ ok: false, error: error.message })}\n`);
    process.exitCode = 1;
  }
}
