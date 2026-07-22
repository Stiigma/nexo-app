// Created by: OpenCode (AI-assisted), 2026-07-18
"use strict";

const path = require("node:path");

// Keep the only external productivity plugin local-only before it initializes.
process.env.PLANNOTATOR_SHARE = "disabled";
process.env.PLANNOTATOR_REMOTE = "0";

const JWT_RE = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;
const BCRYPT_RE = /\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}/g;
const BASE64_RE = /\b[A-Za-z0-9+/]{300,}={0,2}\b/g;
const SECRET_ASSIGNMENT_RE = /(\b(?:sig|token|access_token|refresh_token|api[_-]?key|secret|password)\b["']?\s*[:=]\s*["']?)([^\s,;&"'}]{8,})/gi;
const BEARER_RE = /(\bBearer\s+)[A-Za-z0-9._~+/-]{8,}={0,2}/gi;
const SAFE_ENV_FILES = new Set([".env.example", ".env.sample", ".env.template"]);

function sanitizeText(text) {
  if (typeof text !== "string" || text.length === 0) return text;
  return text
    .replace(SECRET_ASSIGNMENT_RE, (_match, prefix) => `${prefix}[redacted:secret]`)
    .replace(BEARER_RE, "$1[redacted:bearer]")
    .replace(JWT_RE, "[redacted:jwt]")
    .replace(BCRYPT_RE, "[redacted:bcrypt]")
    .replace(BASE64_RE, (value) => `[redacted:base64:${value.length}chars]`);
}

function isSensitiveEnvPath(value) {
  if (typeof value !== "string" || value.trim() === "") return false;
  const normalized = value.replaceAll("\\", "/").replace(/\/+$/, "");
  if (normalized.endsWith("/.envsitter/pepper") || normalized === ".envsitter/pepper") return true;
  const base = path.posix.basename(normalized);
  if (SAFE_ENV_FILES.has(base)) return false;
  return /^\.env(?:\.[A-Za-z0-9_-]+)?$/.test(base);
}

function candidatePaths(args) {
  if (!args || typeof args !== "object") return [];
  const values = [];
  for (const key of ["filePath", "path", "target", "source", "destination", "include"]) {
    if (typeof args[key] === "string") values.push(args[key]);
  }
  for (const key of ["paths", "files", "targetFiles"]) {
    if (Array.isArray(args[key])) values.push(...args[key].filter((value) => typeof value === "string"));
  }
  if (typeof args.patchText === "string") {
    const headers = args.patchText.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+?)(?:\s+-.*)?$/gm);
    for (const match of headers) values.push(match[1].trim());
    const moves = args.patchText.matchAll(/^\*\*\* Move to: (.+)$/gm);
    for (const match of moves) values.push(match[1].trim());
  }
  return values;
}

function envReferences(command) {
  if (typeof command !== "string") return [];
  const matches = command.match(/(?:^|[\s"'`=])(?:[^\s"'`;|&]+\/)?\.env(?:\.[A-Za-z0-9_-]+)?(?=$|[\s"'`;|&])/g) || [];
  return matches.map((value) => value.trim().replace(/^["'`=]|["'`]$/g, ""));
}

function guardSensitiveAccess(input, output) {
  const tool = input?.tool;
  const args = output?.args || {};
  if (["read", "edit", "write", "patch", "multiedit", "apply_patch", "grep"].includes(tool)) {
    const sensitive = candidatePaths(args).find(isSensitiveEnvPath);
    if (sensitive) {
      throw new Error(`Nexo secret guard denied direct ${tool} access to ${sensitive}; inspect only key names or use a sanitized fixture.`);
    }
  }
  if (tool === "bash") {
    const sensitive = envReferences(args.command).find(isSensitiveEnvPath);
    if (sensitive) {
      throw new Error(`Nexo secret guard denied shell access to ${sensitive}; real environment values must not enter tool output.`);
    }
  }
}

function guardPlannotatorUrl(input) {
  if (!["plannotator-annotate", "plannotator-review"].includes(input?.command)) return;
  const argumentsText = input.arguments || "";
  if (/\bhttps?:\/\//i.test(argumentsText)) {
    throw new Error("Nexo local-only guard denied Plannotator URL retrieval; annotate a local Markdown or text artifact instead.");
  }
  if (input.command !== "plannotator-annotate") return;

  let artifact = argumentsText
    .replace(/(?:^|\s)--(?:gate|json|hook|render-html|markdown|no-jina)(?=\s|$)/g, " ")
    .trim();
  if ((artifact.startsWith('"') && artifact.endsWith('"')) || (artifact.startsWith("'") && artifact.endsWith("'"))) {
    artifact = artifact.slice(1, -1);
  }
  artifact = artifact.replace(/^@/, "");
  const normalized = artifact.replaceAll("\\", "/");
  if (
    !artifact ||
    path.isAbsolute(artifact) ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    isSensitiveEnvPath(artifact) ||
    !/\.(?:md|txt|html)$/i.test(artifact)
  ) {
    throw new Error("Nexo local-only guard allows Plannotator annotation only for project-relative .md, .txt, or .html files.");
  }
}

async function NexoProductivityPlugin() {
  return {
    "chat.message": async (_input, output) => {
      for (const part of output.parts || []) {
        if (part?.type === "text") part.text = sanitizeText(part.text);
      }
    },
    "tool.execute.before": async (input, output) => {
      guardSensitiveAccess(input, output);
    },
    "command.execute.before": async (input) => {
      guardPlannotatorUrl(input);
    },
    "shell.env": async (_input, output) => {
      output.env.PLANNOTATOR_SHARE = "disabled";
      output.env.PLANNOTATOR_REMOTE = "0";
    },
  };
}

NexoProductivityPlugin.id = "nexo-productivity";
NexoProductivityPlugin.server = NexoProductivityPlugin;
NexoProductivityPlugin.sanitizeText = sanitizeText;
NexoProductivityPlugin.isSensitiveEnvPath = isSensitiveEnvPath;
NexoProductivityPlugin.envReferences = envReferences;
NexoProductivityPlugin.guardSensitiveAccess = guardSensitiveAccess;
NexoProductivityPlugin.guardPlannotatorUrl = guardPlannotatorUrl;

module.exports = NexoProductivityPlugin;
module.exports.default = NexoProductivityPlugin;
module.exports.server = NexoProductivityPlugin;
module.exports.sanitizeText = sanitizeText;
module.exports.isSensitiveEnvPath = isSensitiveEnvPath;
module.exports.envReferences = envReferences;
module.exports.guardSensitiveAccess = guardSensitiveAccess;
module.exports.guardPlannotatorUrl = guardPlannotatorUrl;
