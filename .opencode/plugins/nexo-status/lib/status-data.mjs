// nexo-status data assembly (V2 TUI port).
//
// Pure, framework-free helpers shared by the CLI plugin (`tui.tsx`) and the
// focused test in `.opencode/tests/nexo-status-tui.test.js`.

import { readFileSync } from "node:fs";
import path from "node:path";

export function readJson(file, fallback) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

export function money(value = 0) {
  return `$${Number(value).toFixed(2)}`;
}

export function compact(value = 0) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
}

export function collectStatus(root, sessionID) {
  const bindings = readJson(path.join(root, ".opencode/state/session-bindings.json"), {});
  const ledger = readJson(path.join(root, ".opencode/state/budget-ledger.json"), {});
  const policy = readJson(path.join(root, "harness/control/state/budget-policy.json"), {});
  const focus = readJson(path.join(root, "harness/control/state/focus.json"), {});
  const taskID = bindings.sessions?.[sessionID]?.taskID;
  return {
    taskID: taskID || "UNBOUND",
    focus: focus.taskId || "NO-FOCUS",
    status: focus.status || "unknown",
    session: ledger.sessions?.[sessionID] || {},
    task: taskID ? ledger.tasks?.[taskID] || {} : {},
    limits: policy.limits || {},
  };
}
