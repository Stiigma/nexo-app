// Created by: OpenCode (AI-assisted), 2026-07-18
/** @jsxImportSource @opentui/solid */

import { readFileSync } from "node:fs";
import path from "node:path";
import type { TuiPlugin, TuiPluginApi, TuiPluginModule } from "@opencode-ai/plugin/tui";
import { createMemo, createSignal, onCleanup } from "solid-js";

type BudgetScope = {
  cost?: number;
  tokens?: { input?: number; output?: number; reasoning?: number };
  toolCalls?: { total?: number };
};

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function money(value = 0) {
  return `$${Number(value).toFixed(2)}`;
}

function compact(value = 0) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
}

function NexoStatus(props: { api: TuiPluginApi; sessionID: string }) {
  const [tick, setTick] = createSignal(0);
  const timer = setInterval(() => setTick((value) => value + 1), 2000);
  onCleanup(() => clearInterval(timer));

  const data = createMemo(() => {
    tick();
    const root = props.api.state.path.directory;
    const bindings = readJson<{ sessions?: Record<string, { taskID?: string }> }>(
      path.join(root, ".opencode/state/session-bindings.json"),
      {},
    );
    const ledger = readJson<{
      sessions?: Record<string, BudgetScope>;
      tasks?: Record<string, BudgetScope>;
    }>(path.join(root, ".opencode/state/budget-ledger.json"), {});
    const policy = readJson<{
      limits?: { session?: { soft?: number; hard?: number }; task?: { soft?: number; hard?: number } };
    }>(path.join(root, "harness/control/state/budget-policy.json"), {});
    const focus = readJson<{ taskId?: string; status?: string }>(
      path.join(root, "harness/control/state/focus.json"),
      {},
    );
    const taskID = bindings.sessions?.[props.sessionID]?.taskID;
    return {
      taskID: taskID || "UNBOUND",
      focus: focus.taskId || "NO-FOCUS",
      status: focus.status || "unknown",
      session: ledger.sessions?.[props.sessionID] || {},
      task: taskID ? ledger.tasks?.[taskID] || {} : {},
      limits: policy.limits || {},
    };
  });

  const theme = () => props.api.theme.current;
  return (
    <box>
      <text>
        <span style={{ fg: theme().accent }}>NEXO </span>
        <span style={{ fg: theme().text }}>{data().taskID}</span>
        <span style={{ fg: theme().textMuted }}> | focus {data().focus} {data().status}</span>
      </text>
      <text>
        <span style={{ fg: theme().textMuted }}>session </span>
        <span style={{ fg: theme().success }}>{money(data().session.cost)}</span>
        <span style={{ fg: theme().textMuted }}> / {money(data().limits.session?.soft)} soft</span>
        <span style={{ fg: theme().textMuted }}> | task </span>
        <span style={{ fg: theme().primary }}>{money(data().task.cost)}</span>
        <span style={{ fg: theme().textMuted }}> | in {compact(data().session.tokens?.input)}</span>
        <span style={{ fg: theme().textMuted }}> out {compact(data().session.tokens?.output)}</span>
        <span style={{ fg: theme().textMuted }}> tools {data().session.toolCalls?.total || 0}</span>
      </text>
    </box>
  );
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    slots: {
      sidebar_footer(_context, props: { session_id: string }) {
        return <NexoStatus api={api} sessionID={props.session_id} />;
      },
    },
  });
};

export default { id: "nexo-status", tui } satisfies TuiPluginModule;
