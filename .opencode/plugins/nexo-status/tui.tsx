// nexo-status V2 CLI plugin — NEXO budget/focus footer.
//
// Ported from `.opencode/tui/nexo-status.tsx` (V1 TUI plugin, kept for the V1
// rollback runtime). V2 moves client plugins to the CLI plugin API: this
// module claims the `sidebar.footer` slot and reads the same control-plane
// state files through lib/status-data.mjs.
//
// Discovered automatically as a project plugin package (index.js server entry
// + this ./tui export), so no global cli.json path is required.

/** @jsxImportSource @opentui/solid */

import { createMemo, createSignal, onCleanup } from "solid-js";
import { usePlugin } from "@opencode/plugin/tui";
import { collectStatus, compact, money } from "./lib/status-data.mjs";

function NexoStatus(props: { sessionID: string }) {
  const context = usePlugin();
  const [tick, setTick] = createSignal(0);
  const timer = setInterval(() => setTick((value) => value + 1), 2000);
  onCleanup(() => clearInterval(timer));
  const data = createMemo(() => {
    tick();
    const root = context.location?.directory ?? process.cwd();
    return collectStatus(root, props.sessionID);
  });
  const theme = context.theme;
  return (
    <box>
      <text>
        <span style={{ fg: theme.text.action.primary.default }}>NEXO </span>
        <span style={{ fg: theme.text.default }}>{data().taskID}</span>
        <span style={{ fg: theme.text.subdued }}> | focus {data().focus} {data().status}</span>
      </text>
      <text>
        <span style={{ fg: theme.text.subdued }}>session </span>
        <span style={{ fg: theme.text.feedback.success.default }}>{money(data().session.cost)}</span>
        <span style={{ fg: theme.text.subdued }}> / {money(data().limits.session?.soft)} soft</span>
        <span style={{ fg: theme.text.subdued }}> | task </span>
        <span style={{ fg: theme.text.action.primary.default }}>{money(data().task.cost)}</span>
        <span style={{ fg: theme.text.subdued }}> | in {compact(data().session.tokens?.input)}</span>
        <span style={{ fg: theme.text.subdued }}> out {compact(data().session.tokens?.output)}</span>
        <span style={{ fg: theme.text.subdued }}> tools {data().session.toolCalls?.total || 0}</span>
      </text>
    </box>
  );
}

export default {
  id: "nexo-status",
  setup(context: { ui: { slot: (claim: unknown) => unknown } }) {
    context.ui.slot({
      append: "sidebar.footer",
      render: (input: { sessionID: string }) => <NexoStatus sessionID={input.sessionID} />,
    });
  },
};
