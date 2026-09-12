#!/usr/bin/env node
// Created by: OpenCode (AI-assisted), 2026-07-18
// Updated 2026-09-12: OpenCode V2 runtime checks, V1 rollback checks kept.

import { access, readFile, realpath } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

const execFileAsync = promisify(execFile);

const REQUIRED_RUNTIME_VERSION = "2.0.2";
const REQUIRED_V2_PLUGIN_FILES = [
  ".opencode/lib/v2-plugin-adapter.mjs",
  ".opencode/plugins/nexo-productivity-v2.js",
  ".opencode/plugins/nexo-budget-guard-v2.js",
  ".opencode/plugins/isyte-ops-v2.js",
  ".opencode/plugins/nexo-status/index.js",
  ".opencode/plugins/nexo-status/tui.tsx",
  ".opencode/plugins/nexo-status/package.json",
  ".opencode/optional-plugins/graphify-v2.js",
];
const REQUIRED_V1_ROLLBACK_FILES = [
  ".opencode/plugins/nexo-productivity.mjs",
  ".opencode/plugins/nexo-budget-guard.mjs",
  ".opencode/plugins/isyte-ops.mjs",
  ".opencode/tui/nexo-status.tsx",
  ".opencode/optional-plugins/graphify.js",
];

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
  const [opencode2, opencode, pluginPackageText, configText, localConfigText, tuiText] = await Promise.all([
    inspectExecutable("opencode2", options),
    inspectExecutable("opencode", options),
    readFile(path.join(root, ".opencode/package.json"), "utf8"),
    readFile(path.join(root, "opencode.json"), "utf8"),
    readFile(path.join(root, ".opencode/opencode.json"), "utf8"),
    readFile(path.join(root, "tui.json"), "utf8"),
  ]);
  const pluginPackage = JSON.parse(pluginPackageText);
  const config = JSON.parse(configText);
  const localConfig = JSON.parse(localConfigText);
  const tui = JSON.parse(tuiText);
  const blockers = [];
  const warnings = [];

  if (!opencode2.ok) blockers.push("opencode2 is unavailable or cannot start");
  else if (!opencode2.version.includes(REQUIRED_RUNTIME_VERSION)) {
    blockers.push(`opencode2 runtime ${opencode2.version} does not match required ${REQUIRED_RUNTIME_VERSION}`);
  }
  if (!opencode.ok) warnings.push("optional opencode command is unavailable; this project targets opencode2");
  else if (opencode2.ok && opencode.version !== opencode2.version) {
    warnings.push(`opencode ${opencode.version} differs from opencode2 ${opencode2.version}; validate plugins against opencode2`);
  }

  if (config.default_agent !== "nexo") blockers.push("project default_agent is not nexo");
  if (config.subagent_depth !== 1 && config.experimental?.subagent_depth !== 1) {
    blockers.push("project subagent_depth is not 1");
  }
  if (config.share !== "disabled") blockers.push("project sharing is not disabled");

  const plannotatorV1 = config.plugin?.find((entry) => Array.isArray(entry) && entry[0] === "@plannotator/opencode@0.23.1");
  if (!plannotatorV1 || plannotatorV1[1]?.workflow !== "manual") {
    blockers.push("V1 rollback manual Plannotator configuration is missing");
  }
  const plannotatorV2 = config.plugins?.find((entry) => {
    const pkg = typeof entry === "string" ? entry : entry?.package;
    return pkg === "@plannotator/opencode@0.27.14";
  });
  if (!plannotatorV2) blockers.push("OpenCode V2 Plannotator entry (@plannotator/opencode@0.27.14) is missing");
  else if ((plannotatorV2.options?.workflow ?? "manual") !== "manual") {
    blockers.push("OpenCode V2 Plannotator must stay in manual workflow");
  }

  if (config.tool_output?.max_lines !== 800 || config.tool_output?.max_bytes !== 32768) {
    blockers.push("native tool-output bounds differ from the approved values");
  }
  if (config.compaction?.auto !== true) blockers.push("compaction auto is not enabled");
  const keepTokens = config.compaction?.keep?.tokens;
  if (keepTokens === undefined) {
    if (config.compaction?.preserve_recent_tokens === 24000) {
      warnings.push("compaction.keep.tokens is missing; OpenCode V2 ignores the V1 preserve_recent_tokens key");
    } else {
      warnings.push("compaction retained-token budget differs from the approved value");
    }
  } else if (keepTokens !== 24000) {
    warnings.push("compaction retained-token budget differs from the approved value");
  }

  const graphifyLoaded = config.plugin?.some((entry) =>
    String(Array.isArray(entry) ? entry[0] : entry).includes("graphify"),
  );
  if (graphifyLoaded) blockers.push("Graphify is loaded by default instead of remaining opt-in");
  const vercelToken = localConfig.mcp?.vercel?.environment?.VERCEL_API_TOKEN;
  if (vercelToken !== "{env:VERCEL_API_TOKEN}") {
    blockers.push("Vercel MCP token must come from VERCEL_API_TOKEN");
  }

  if (!tui.plugin?.includes("./.opencode/tui/nexo-status.tsx")) {
    warnings.push("V1 rollback TUI status plugin entry is missing from tui.json");
  }
  if (!tui.attention?.enabled || !tui.attention?.notifications) {
    warnings.push("V1 rollback TUI attention notifications are disabled (V2 uses the global cli.json)");
  }

  for (const relative of REQUIRED_V2_PLUGIN_FILES) {
    await access(path.join(root, relative)).catch(() => {
      blockers.push(`required OpenCode V2 plugin entry is missing: ${relative}`);
    });
  }
  for (const relative of REQUIRED_V1_ROLLBACK_FILES) {
    await access(path.join(root, relative)).catch(() => {
      warnings.push(`V1 rollback file is missing: ${relative}`);
    });
  }

  const graphifyAvailable = await access(path.join(root, ".opencode/optional-plugins/graphify.js"))
    .then(() => true)
    .catch(() => false);
  if (graphifyAvailable) warnings.push("Graphify is available locally but is not loaded by default");

  const pluginApi = pluginPackage.dependencies?.["@opencode/plugin"] || null;
  if (pluginApi !== REQUIRED_RUNTIME_VERSION) {
    warnings.push(`local plugin API dependency is ${pluginApi || "missing"}; expected @opencode/plugin ${REQUIRED_RUNTIME_VERSION}`);
  }

  return {
    schemaVersion: 2,
    ok: blockers.length === 0,
    target: "opencode2",
    commands: { opencode2, opencode },
    pluginApi,
    project: {
      model: config.model,
      defaultAgent: config.default_agent,
      pluginCount: config.plugin?.length || 0,
      v2PluginCount: config.plugins?.length || 0,
      v2PluginFiles: REQUIRED_V2_PLUGIN_FILES.length,
      tuiPluginCount: tui.plugin?.length || 0,
      graphifyLoaded,
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
