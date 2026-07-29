#!/usr/bin/env node
// Created by: Codex (AI-assisted), 2026-07-29

import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_SCENARIOS = "harness/control/evals/agent-behavior.json";
const MAX_RESPONSE_CHARS = 40_000;

function isInside(candidate, root) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function readJsonInside(rootDir, relativePath, label) {
  if (!relativePath || path.isAbsolute(relativePath) || relativePath.includes("\\")) {
    throw new Error(`${label} must be a portable project-relative path`);
  }
  const normalized = path.posix.normalize(relativePath);
  if (normalized !== relativePath || normalized === ".." || normalized.startsWith("../")) {
    throw new Error(`${label} escapes the project`);
  }
  const [root, file] = await Promise.all([realpath(rootDir), realpath(path.resolve(rootDir, normalized))]);
  if (!isInside(file, root)) throw new Error(`${label} resolves outside the project`);
  return JSON.parse(await readFile(file, "utf8"));
}

function compile(pattern) {
  return new RegExp(pattern, "iu");
}

export function evaluateResponse(scenario, response) {
  if (!scenario || typeof scenario !== "object") throw new Error("scenario must be an object");
  if (typeof response !== "string" || !response.trim()) throw new Error("response must be a non-empty string");
  if (response.length > MAX_RESPONSE_CHARS) throw new Error(`response exceeds ${MAX_RESPONSE_CHARS} characters`);
  const missing = scenario.requiredPatterns.filter((pattern) => !compile(pattern).test(response));
  const prohibited = scenario.forbiddenPatterns.filter((pattern) => compile(pattern).test(response));
  return {
    scenarioId: scenario.id,
    role: scenario.role,
    pass: missing.length === 0 && prohibited.length === 0,
    required: scenario.requiredPatterns.length,
    matched: scenario.requiredPatterns.length - missing.length,
    missing,
    prohibited,
    note: "Regex contract check only; human decision-quality review remains required.",
  };
}

export async function runEvaluation(options = {}) {
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const scenarios = await readJsonInside(rootDir, options.scenarios || DEFAULT_SCENARIOS, "scenario file");
  if (scenarios.schemaVersion !== 1 || !Array.isArray(scenarios.scenarios)) {
    throw new Error("scenario file must use schemaVersion 1");
  }
  const input = await readJsonInside(rootDir, options.input, "input");
  const matches = scenarios.scenarios.filter((scenario) => scenario.id === input.scenarioId);
  if (matches.length !== 1) throw new Error(`unknown or duplicate scenario: ${input.scenarioId}`);
  return evaluateResponse(matches[0], input.response);
}

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--root") options.rootDir = argv[++index];
    else if (argument === "--input") options.input = argv[++index];
    else if (argument === "--scenarios") options.scenarios = argv[++index];
    else throw new Error(`unknown argument: ${argument}`);
  }
  if (!options.input) throw new Error("--input is required");
  return options;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = await runEvaluation(parseArguments(process.argv.slice(2)));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (!result.pass) process.exitCode = 2;
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ pass: false, error: error.message })}\n`);
    process.exitCode = 1;
  }
}

