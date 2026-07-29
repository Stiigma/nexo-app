#!/usr/bin/env node

import { createHash } from "node:crypto";
import { access, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export const DEFAULT_MAX_CHARS = 10_000;
export const DEFAULT_FOCUS_PATH = "harness/control/state/focus.json";
export const DEFAULT_OUTPUT_PATH = ".agent/state/session-context.json";

const REQUIRED_ARRAY_FIELDS = [
  "constraints",
  "acceptanceCriteria",
  "verification",
];

const FULL_RESUME_SOURCES = [
  "AGENTS.md",
  "tier 1: the explicitly selected manifest and harness/control/work projection",
  "tier 2: only that task's plan, handoff, latest report, and requirement sources",
  "tier 3 for contradiction recovery only: README, WORKFLOW, tasks.md, journal, and legacy CURRENT.md/NEXT.md",
];

export function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function cleanCell(value = "") {
  return value.replace(/`/g, "").trim();
}

export function parseTaskRows(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => /^\|\s*(?:NEXO|FIAD)-\d+\s*\|/.test(line))
    .map((raw) => {
      const cells = raw
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim());
      return {
        raw,
        id: cleanCell(cells[0]),
        status: cleanCell(cells[1]),
        priority: cleanCell(cells[2]),
        title: cleanCell(cells[3]),
        plan: cleanCell(cells[4]),
        latestReport: cleanCell(cells[5]),
        nextStep: cleanCell(cells[7]),
      };
    });
}

function assertString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`focus.${field} must be a non-empty string`);
  }
}

function assertStringArray(value, field) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`focus.${field} must be a non-empty array`);
  }
  for (const [index, item] of value.entries()) {
    assertString(item, `${field}[${index}]`);
  }
}

function resolveInsideRoot(rootDir, relativePath, field) {
  assertString(relativePath, field);
  if (path.isAbsolute(relativePath)) {
    throw new Error(`focus.${field} must be relative to the repository root`);
  }
  const root = path.resolve(rootDir);
  const resolved = path.resolve(root, relativePath);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error(`focus.${field} escapes the repository root`);
  }
  return resolved;
}

export function taskLinkMatches(rootDir, tasksFile, taskLink, expectedFile) {
  if (!taskLink || path.isAbsolute(taskLink)) return false;
  const root = path.resolve(rootDir);
  const candidates = [
    path.resolve(root, taskLink),
    path.resolve(path.dirname(tasksFile), taskLink),
  ];
  return candidates.some(
    (candidate) =>
      (candidate === root || candidate.startsWith(`${root}${path.sep}`)) &&
      candidate === expectedFile,
  );
}

function validateFocusShape(focus, now) {
  if (!focus || typeof focus !== "object" || Array.isArray(focus)) {
    throw new Error("focus must be a JSON object");
  }
  if (focus.schemaVersion !== 1) {
    throw new Error("focus.schemaVersion must be 1");
  }
  assertString(focus.taskId, "taskId");
  if (!/^(?:NEXO|FIAD)-\d{4}$/.test(focus.taskId)) {
    throw new Error("focus.taskId must match NEXO-0000 or FIAD-0000");
  }
  assertString(focus.status, "status");
  if (![
    "planned",
    "active",
    "implemented",
    "blocked",
    "closed",
  ].includes(focus.status)) {
    throw new Error(`focus.status is unsupported: ${focus.status}`);
  }
  assertString(focus.updatedAt, "updatedAt");
  const updatedAt = new Date(focus.updatedAt);
  if (Number.isNaN(updatedAt.getTime())) {
    throw new Error("focus.updatedAt must be an ISO date-time");
  }
  if (!Number.isInteger(focus.maxAgeHours) || focus.maxAgeHours <= 0) {
    throw new Error("focus.maxAgeHours must be a positive integer");
  }
  const expiresAt = new Date(updatedAt.getTime() + focus.maxAgeHours * 3_600_000);
  const isStale = now.getTime() > expiresAt.getTime();
  assertString(focus.objective, "objective");
  assertString(focus.nextAction, "nextAction");
  assertString(focus.expectedReport, "expectedReport");
  for (const field of REQUIRED_ARRAY_FIELDS) {
    assertStringArray(focus[field], field);
  }
  if (!focus.sources || typeof focus.sources !== "object") {
    throw new Error("focus.sources must be an object");
  }
  for (const field of ["tasks", "plan", "handoff", "latestReport"]) {
    assertString(focus.sources[field], `sources.${field}`);
  }
  if (!focus.sourceHashes || typeof focus.sourceHashes !== "object") {
    throw new Error("focus.sourceHashes must be an object");
  }
  for (const field of ["taskRow", "plan", "handoff", "latestReport"]) {
    const digest = focus.sourceHashes[field];
    if (typeof digest !== "string" || !/^[a-f0-9]{64}$/.test(digest)) {
      throw new Error(`focus.sourceHashes.${field} must be a SHA-256 digest`);
    }
  }
  return { expiresAt, isStale };
}

function assertContainsTaskId(text, taskId, sourceName) {
  if (!text.includes(taskId)) {
    throw new Error(`${sourceName} does not reference ${taskId}`);
  }
}

function assertDigest(actualText, expected, label) {
  const actual = sha256(actualText);
  if (actual !== expected) {
    throw new Error(`${label} changed after focus.json was approved`);
  }
  return actual;
}

async function readRequired(file, label) {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(`${label} is missing: ${file}`);
    }
    throw error;
  }
}

export async function compileSessionContext(options = {}) {
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const focusRelative = options.focusPath || DEFAULT_FOCUS_PATH;
  const focusFile = resolveInsideRoot(rootDir, focusRelative, "focusPath");
  const now = options.now instanceof Date ? options.now : new Date();
  const maxChars = options.maxChars || DEFAULT_MAX_CHARS;

  const focusText = await readRequired(focusFile, "focus record");
  let focus;
  try {
    focus = JSON.parse(focusText);
  } catch (error) {
    throw new Error(`focus record is invalid JSON: ${error.message}`);
  }
  const { expiresAt, isStale } = validateFocusShape(focus, now);

  const sourceFiles = Object.fromEntries(
    Object.entries(focus.sources).map(([name, relativePath]) => [
      name,
      resolveInsideRoot(rootDir, relativePath, `sources.${name}`),
    ]),
  );
  const [tasksText, planText, handoffText, reportText] = await Promise.all([
    readRequired(sourceFiles.tasks, "task index"),
    readRequired(sourceFiles.plan, "plan"),
    readRequired(sourceFiles.handoff, "handoff"),
    readRequired(sourceFiles.latestReport, "latest report"),
  ]);

  const matches = parseTaskRows(tasksText).filter((row) => row.id === focus.taskId);
  if (matches.length !== 1) {
    throw new Error(`tasks.md must contain exactly one row for ${focus.taskId}`);
  }
  const task = matches[0];
  if (task.status !== focus.status) {
    throw new Error(`focus status ${focus.status} conflicts with tasks.md status ${task.status}`);
  }
  if (!taskLinkMatches(rootDir, sourceFiles.tasks, task.plan, sourceFiles.plan)) {
    throw new Error(`focus plan ${focus.sources.plan} conflicts with tasks.md plan ${task.plan}`);
  }
  if (!taskLinkMatches(rootDir, sourceFiles.tasks, task.latestReport, sourceFiles.latestReport)) {
    throw new Error(
      `focus latest report ${focus.sources.latestReport} conflicts with tasks.md report ${task.latestReport}`,
    );
  }

  assertContainsTaskId(planText, focus.taskId, "plan");
  assertContainsTaskId(handoffText, focus.taskId, "handoff");
  assertContainsTaskId(reportText, focus.taskId, "latest report");

  const sourceHashes = {
    taskRow: assertDigest(task.raw, focus.sourceHashes.taskRow, "tasks.md row"),
    plan: assertDigest(planText, focus.sourceHashes.plan, "plan"),
    handoff: assertDigest(handoffText, focus.sourceHashes.handoff, "handoff"),
    latestReport: assertDigest(reportText, focus.sourceHashes.latestReport, "latest report"),
  };

  const packet = {
    schemaVersion: 1,
    valid: true,
    task: {
      id: task.id,
      status: task.status,
      priority: task.priority,
      title: task.title,
    },
    objective: focus.objective,
    nextAction: focus.nextAction,
    constraints: focus.constraints,
    acceptanceCriteria: focus.acceptanceCriteria,
    verification: focus.verification,
    expectedReport: focus.expectedReport,
    freshness: {
      focusUpdatedAt: focus.updatedAt,
      expiresAt: expiresAt.toISOString(),
      status: isStale ? "stale" : "current",
    },
    warnings: isStale
      ? [
          `Focus expired at ${expiresAt.toISOString()}; validated status, links, and source hashes remain intact.`,
        ]
      : [],
    sources: focus.sources,
    sourceHashes,
    operatingRules: [
      "Use search-first and narrow reads; keep command output bounded.",
      "Run targeted checks while iterating and one full relevant acceptance gate.",
      "Preserve QA, security, type, schema, and test requirements.",
      "Do not commit, push, deploy, change external environments, or spend provider budget without explicit approval.",
      "Record control-plane evidence only for milestones or controlled work; never rewrite historical evidence.",
    ],
    fallback: {
      requiredWhen: "this packet is missing, invalid, contradictory, source-modified, or insufficient for the decision",
      read: FULL_RESUME_SOURCES,
    },
  };

  const text = `${JSON.stringify(packet, null, 2)}\n`;
  if (text.length > maxChars) {
    throw new Error(`compiled context has ${text.length} characters; limit is ${maxChars}`);
  }
  return {
    packet,
    text,
    chars: text.length,
    estimatedTokens: Math.ceil(text.length / 4),
  };
}

export async function buildSessionContext(options = {}) {
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const outputRelative = options.outputPath || DEFAULT_OUTPUT_PATH;
  const outputFile = resolveInsideRoot(rootDir, outputRelative, "outputPath");
  try {
    const result = await compileSessionContext({ ...options, rootDir });
    await mkdir(path.dirname(outputFile), { recursive: true });
    const temporary = `${outputFile}.${process.pid}.${Math.random().toString(16).slice(2)}.tmp`;
    await writeFile(temporary, result.text, "utf8");
    await rename(temporary, outputFile);
    await access(outputFile);
    return { ...result, outputFile };
  } catch (error) {
    await rm(outputFile, { force: true });
    throw error;
  }
}

export function parseCliArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--root") options.rootDir = argv[++index];
    else if (argument === "--focus") options.focusPath = argv[++index];
    else if (argument === "--output") options.outputPath = argv[++index];
    else if (argument === "--max-chars") options.maxChars = Number(argv[++index]);
    else throw new Error(`unknown argument: ${argument}`);
  }
  return options;
}

export async function runSessionContextCli(argv, defaults = {}) {
  try {
    const result = await buildSessionContext({
      ...defaults,
      ...parseCliArguments(argv),
    });
    process.stdout.write(
      `${JSON.stringify({
        ok: true,
        output: path.relative(process.cwd(), result.outputFile),
        chars: result.chars,
        estimatedTokens: result.estimatedTokens,
        warnings: result.packet.warnings,
      })}\n`,
    );
  } catch (error) {
    process.stderr.write(`session context unavailable; use full resume: ${error.message}\n`);
    process.exitCode = 1;
  }
}
