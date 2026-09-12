# Nexo OpenCode Adapter

OpenCode files in this directory adapt the canonical Nexo control plane to
OpenCode. They are not the source of truth.

Canonical sources:

- `../AGENTS.md`
- `../harness/control/README.md`
- `../harness/control/agents/`
- `../harness/control/skills/`
- `../harness/control/tasks.md`

When an adapter conflicts with `harness/control/`, follow `harness/control/`
and update the adapter.

Nexo startup is deterministic: run
`node .opencode/scripts/build-session-context.mjs`, then read `AGENTS.md` and
`.opencode/state/session-context.json`. Use the full canonical resume path only
when the compiler fails or the packet is insufficient. FIAD context is scoped
to sessions started with `fiad:*` or `isyte:*` commands.

## OpenCode V2 runtime

The harness targets OpenCode V2 (`@opencode/cli` 2.0.2). V1 files remain for
the rollback runtime and are not loaded by V2:

- Plugin logic stays in `lib/*.cjs`; `*-v2.js` entries adapt it to the V2 plugin
  API through `lib/v2-plugin-adapter.mjs` (V1 `*.mjs` entries are rollback-only).
- `opencode.json.plugins` holds the V2 Plannotator entry
  (`@plannotator/opencode@0.27.14`, manual); the V1 `plugin` tuple is rollback.
- The V2 client status footer is the `plugins/nexo-status` package; the V1
  `tui/nexo-status.tsx` entry in `tui.json` is rollback. Global client settings
  (attention, keybinds) live in `~/.config/opencode/cli.json`.
- `node .opencode/scripts/opencode2-doctor.mjs` verifies the V2 runtime, plugin
  entries, and rollback files.
