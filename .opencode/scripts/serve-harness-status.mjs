#!/usr/bin/env node
// Created by: OpenCode (AI-assisted), 2026-07-18

import { createServer as createHttpServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { parseTaskRows } from "../../harness/control/scripts/build-session-context.mjs";

export const DEFAULT_HOST = "127.0.0.1";
export const DEFAULT_PORT = 41749;
export const PRODUCT_PORT = 5173;

export function resolveStatusPort(value = process.env.NEXO_STATUS_PORT) {
  if (value === undefined || value === "") return DEFAULT_PORT;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535 || port === PRODUCT_PORT) {
    throw new Error(`NEXO_STATUS_PORT must be an integer from 1 to 65535 other than ${PRODUCT_PORT}`);
  }
  return port;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

export async function loadStatus(rootDir = process.cwd()) {
  const root = path.resolve(rootDir);
  const [tasksText, focus, policy, ledger] = await Promise.all([
    readFile(path.join(root, "harness/control/tasks.md"), "utf8"),
    readJson(path.join(root, "harness/control/state/focus.json"), {}),
    readJson(path.join(root, "harness/control/state/budget-policy.json"), {}),
    readJson(path.join(root, ".opencode/state/budget-ledger.json"), {}),
  ]);
  const tasks = parseTaskRows(tasksText);
  return {
    generatedAt: new Date().toISOString(),
    focus: {
      taskId: focus.taskId || null,
      status: focus.status || null,
      objective: focus.objective || null,
      nextAction: focus.nextAction || null,
    },
    counts: Object.fromEntries(
      ["planned", "active", "implemented", "blocked", "closed"].map((status) => [
        status,
        tasks.filter((task) => task.status === status).length,
      ]),
    ),
    active: tasks
      .filter((task) => task.status === "active")
      .map(({ id, priority, title, nextStep }) => ({ id, priority, title, nextStep })),
    budget: {
      currency: policy.currency || "USD",
      limits: policy.limits || {},
      sessions: Object.keys(ledger.sessions || {}).length,
      trackedTasks: Object.keys(ledger.tasks || {}).length,
      toolTypes: Object.keys(ledger.tools || {}).length,
    },
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderStatusHtml(status) {
  const cards = status.active
    .map(
      (task) => `<article class="task"><div class="task-id">${escapeHtml(task.id)}</div><h2>${escapeHtml(task.title)}</h2><p>${escapeHtml(task.nextStep)}</p><span>${escapeHtml(task.priority)}</span></article>`,
    )
    .join("");
  const counts = Object.entries(status.counts)
    .map(([name, value]) => `<div class="metric"><strong>${value}</strong><span>${escapeHtml(name)}</span></div>`)
    .join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="5">
  <title>Nexo Control Room</title>
  <style>
    :root { color-scheme: dark; --ink:#ece8dc; --muted:#8d938c; --panel:#171b1a; --line:#303a35; --lime:#b7f36b; --amber:#ffbf69; }
    * { box-sizing:border-box; }
    body { margin:0; min-height:100vh; background:radial-gradient(circle at 15% 0%,#23342a 0,transparent 35%),#0c0f0e; color:var(--ink); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
    main { width:min(1180px,calc(100% - 32px)); margin:auto; padding:56px 0 72px; }
    header { display:grid; grid-template-columns:1fr auto; gap:24px; align-items:end; border-bottom:1px solid var(--line); padding-bottom:24px; }
    .eyebrow,.task-id { color:var(--lime); text-transform:uppercase; letter-spacing:.16em; font-size:.75rem; }
    h1 { margin:.25rem 0 0; font-family:Georgia,serif; font-size:clamp(2.6rem,8vw,6.8rem); line-height:.84; font-weight:500; }
    .stamp { color:var(--muted); text-align:right; font-size:.78rem; }
    .focus { margin:28px 0; padding:22px; border:1px solid var(--line); background:linear-gradient(135deg,rgba(183,243,107,.08),transparent 55%); }
    .focus strong { color:var(--amber); }
    .focus p { max-width:80ch; line-height:1.55; color:#c7cbc5; }
    .metrics { display:grid; grid-template-columns:repeat(5,1fr); gap:1px; background:var(--line); border:1px solid var(--line); }
    .metric { background:var(--panel); padding:18px; display:flex; align-items:baseline; justify-content:space-between; }
    .metric strong { font-size:1.8rem; color:var(--lime); }
    .metric span { color:var(--muted); font-size:.72rem; text-transform:uppercase; }
    .tasks { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; margin-top:28px; }
    .task { min-height:190px; padding:24px; border:1px solid var(--line); background:rgba(23,27,26,.9); position:relative; }
    .task h2 { font-family:Georgia,serif; font-weight:500; margin:12px 0; font-size:1.45rem; }
    .task p { color:var(--muted); line-height:1.5; }
    .task > span { position:absolute; right:18px; top:18px; color:var(--amber); }
    footer { margin-top:32px; color:var(--muted); font-size:.75rem; }
    @media (max-width:700px) { header { grid-template-columns:1fr; } .stamp{text-align:left}.metrics{grid-template-columns:repeat(2,1fr)}.tasks{grid-template-columns:1fr} }
  </style>
</head>
<body><main>
  <header><div><div class="eyebrow">Local governed workflow</div><h1>Nexo<br>Control Room</h1></div><div class="stamp">read-only / loopback<br>${escapeHtml(status.generatedAt)}</div></header>
  <section class="focus"><strong>${escapeHtml(status.focus.taskId)} / ${escapeHtml(status.focus.status)}</strong><p>${escapeHtml(status.focus.objective)}</p><p>Next: ${escapeHtml(status.focus.nextAction)}</p></section>
  <section class="metrics">${counts}</section>
  <section class="tasks">${cards || '<article class="task"><h2>No active tasks</h2></article>'}</section>
  <footer>Budget: ${escapeHtml(status.budget.currency)} | ${status.budget.sessions} sessions | ${status.budget.trackedTasks} tracked tasks | ${status.budget.toolTypes} tool types</footer>
</main></body></html>`;
}

export function createStatusServer(options = {}) {
  const rootDir = path.resolve(options.rootDir || process.cwd());
  return createHttpServer(async (request, response) => {
    try {
      if (request.method !== "GET" && request.method !== "HEAD") {
        response.statusCode = 405;
        response.setHeader("Allow", "GET, HEAD");
        response.end("Method not allowed\n");
        return;
      }
      const status = await loadStatus(rootDir);
      response.setHeader("Cache-Control", "no-store");
      response.setHeader("X-Content-Type-Options", "nosniff");
      response.setHeader("Referrer-Policy", "no-referrer");
      if (request.url === "/api/status") {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(request.method === "HEAD" ? undefined : `${JSON.stringify(status, null, 2)}\n`);
        return;
      }
      if (request.url !== "/") {
        response.statusCode = 404;
        response.end("Not found\n");
        return;
      }
      response.setHeader("Content-Type", "text/html; charset=utf-8");
      response.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'");
      response.end(request.method === "HEAD" ? undefined : renderStatusHtml(status));
    } catch (error) {
      response.statusCode = 500;
      response.setHeader("Content-Type", "text/plain; charset=utf-8");
      response.end(`Status unavailable: ${error.message}\n`);
    }
  });
}

async function main() {
  const host = DEFAULT_HOST;
  const port = resolveStatusPort();
  const server = createStatusServer();
  server.listen(port, host, () => {
    process.stdout.write(`Nexo Control Room: http://${host}:${port}\n`);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
