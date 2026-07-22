#!/usr/bin/env node
// Created by: OpenCode (AI-assisted), 2026-07-18

import { access, readFile, realpath } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

const execFileAsync = promisify(execFile);

export async function resolveExecutable(name, envPath = process.env.PATH || "") {
  if (name.includes(path.sep)) return path.resolve(name);
  for (const directory of envPath.split(path.delimiter).filter(Boolean)) {
    const candidate = path.join(directory, name);
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Continue through PATH.
    }
  }
  return null;
}

export async function inspectExecutable(name, options = {}) {
  const resolved = await resolveExecutable(name, options.path);
  if (!resolved) return { name, ok: false, error: "not found on PATH" };
  try {
    const [{ stdout }, target] = await Promise.all([
      execFileAsync(resolved, ["--version"], { timeout: 15000 }),
      realpath(resolved).catch(() => resolved),
    ]);
    return { name, ok: true, command: resolved, target, version: stdout.trim() };
  } catch (error) {
    return { name, ok: false, command: resolved, error: error.message };
  }
}

export async function inspectRuntime(rootDir = process.cwd(), options = {}) {
  const root = path.resolve(rootDir);
  const [opencode2, opencode, pluginPackageText, configText, tuiText] = await Promise.all([
    inspectExecutable("opencode2", options),
    inspectExecutable("opencode", options),
    readFile(path.join(root, ".opencode/package.json"), "utf8"),
    readFile(path.join(root, "opencode.json"), "utf8"),
    readFile(path.join(root, "tui.json"), "utf8"),
  ]);
  const pluginPackage = JSON.parse(pluginPackageText);
  const config = JSON.parse(configText);
  const tui = JSON.parse(tuiText);
  const blockers = [];
  const warnings = [];
  if (!opencode2.ok) blockers.push("opencode2 is unavailable or cannot start");
  if (!opencode.ok) blockers.push("the default opencode command is unavailable or cannot start");
  if (opencode2.ok && opencode.ok && opencode2.version !== opencode.version) {
    warnings.push(`opencode2 ${opencode2.version} differs from opencode ${opencode.version}; validate plugins against opencode2`);
  }
  if (config.default_agent !== "nexo") blockers.push("project default_agent is not nexo");
  if (config.subagent_depth !== 1) blockers.push("project subagent_depth is not 1");
  if (config.share !== "disabled") blockers.push("project sharing is not disabled");
  const plannotator = config.plugin?.find((entry) => Array.isArray(entry) && entry[0] === "@plannotator/opencode@0.23.1");
  if (!plannotator || plannotator[1]?.workflow !== "manual") {
    blockers.push("exact manual Plannotator configuration is missing");
  }
  if (config.tool_output?.max_lines !== 800 || config.tool_output?.max_bytes !== 32768) {
    blockers.push("native tool-output bounds differ from the approved values");
  }
  if (!config.compaction?.prune || config.compaction?.tail_turns !== 4) {
    blockers.push("native compaction pruning differs from the approved values");
  }
  if (!tui.plugin?.includes("./.opencode/tui/nexo-status.tsx")) {
    blockers.push("Nexo TUI status plugin is missing");
  }
  if (!tui.attention?.enabled || !tui.attention?.notifications) {
    blockers.push("TUI attention notifications are disabled");
  }
  return {
    schemaVersion: 1,
    ok: blockers.length === 0,
    target: "opencode2",
    commands: { opencode2, opencode },
    pluginApi: pluginPackage.dependencies?.["@opencode-ai/plugin"] || null,
    project: {
      model: config.model,
      defaultAgent: config.default_agent,
      pluginCount: config.plugin?.length || 0,
      tuiPluginCount: tui.plugin?.length || 0,
    },
    blockers,
    warnings,
  };
}

async function main() {
  const report = await inspectRuntime();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
