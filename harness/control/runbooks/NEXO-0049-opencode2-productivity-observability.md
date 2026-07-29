# Runbook - OpenCode2 Productivity And Observability

## Purpose

Operate and diagnose the NEXO-0049 OpenCode2 additions without replacing the
Nexo control plane, exposing local data, or touching the product port.

## Preconditions

- Run commands from the repository root.
- Use `opencode2` as the validated target runtime.
- Keep `harness/control/` canonical and `nexo` as the Nexo orchestrator.
- Do not put credentials, prompt content, tool arguments, or tool output into
  the budget ledger or status UI.

## Inputs

- Project configuration: `opencode.json` and `tui.json`.
- Runtime doctor: `.opencode/scripts/opencode2-doctor.mjs`.
- Local status server: `.opencode/scripts/serve-harness-status.mjs`.
- Ledger and bindings: `.opencode/state/budget-ledger.json` and
  `.opencode/state/session-bindings.json`.

## Steps

1. Run `node .opencode/scripts/opencode2-doctor.mjs` and resolve blockers before
   starting OpenCode2. A version-difference warning is expected until both CLI
   installations intentionally converge.
2. Run `opencode2 debug config`, `opencode2 debug info`, and
   `opencode2 debug startup` after any config or plugin change.
3. Restart OpenCode2 after changing `opencode.json`, `tui.json`, server plugins,
   or TUI plugins. Existing processes do not reload these boundaries safely.
4. Use `/plannotator-annotate <project-relative-file>` for a canonical
   Markdown, text, or HTML
   artifact, `/plannotator-last` for the last response, or
   `/plannotator-review` for current local changes. URL arguments are denied and
   sharing remains disabled. Absolute paths, parent traversal, folders, and
   `.env*` files are denied.
5. Start optional visual status explicitly with
   `node .opencode/scripts/serve-harness-status.mjs`, then open
   `http://127.0.0.1:41749`. The server does not auto-open a browser and rejects
   port `5173`.
6. Stop the optional server with `Ctrl-C`; it has no required background mode.

## Upgrading The Custom OpenCode2 Installation

`opencode2` resolves through `~/.local/bin/opencode2` into the package-local
binary under `~/.opencode-dev/node_modules`. The built-in `opencode2 upgrade`
command cannot infer this custom installation method and fails with
`Unknown installation method: unknown`.

Upgrade the package from `~/.opencode-dev` instead:

1. Run `npm install opencode-ai@latest`.
2. If npm reports that the package postinstall was blocked, run
   `npm install-scripts approve opencode-ai`, review that only `opencode-ai` is
   approved, and run `npm rebuild opencode-ai`.
3. Run `opencode2 --version`, `opencode --version`, and
   `npm install-scripts ls`. Both commands must resolve the intended version and
   npm must report no unreviewed install scripts.
4. Return to the repository root and run the doctor, effective-config,
   startup, complete harness, and pseudo-TTY checks in this runbook.

Do not use `opencode2 upgrade -m npm` for this layout. That mode performs a
global npm installation rather than updating the package-local runtime that
the `opencode2` link targets.

## Verification

- `node --test .opencode/tests/runtime-productivity.test.js`
- `node --test .opencode/tests/nexo-productivity-plugin.test.js`
- `node --test .opencode/tests/nexo-budget-guard.test.js`
- `node --test .opencode/tests/*.test.js`
- Confirm a pseudo-TTY OpenCode2 launch logs no server-plugin or TUI-plugin load
  error before terminating the smoke process.

## Rollback

- Remove the Plannotator tuple and project-local `plannotator-*` commands from
  `opencode.json`, remove its privacy environment handling, and restart
  OpenCode2.
- Remove `tui.json` or its Nexo status plugin entry to restore the default TUI.
- Stop the status process; no daemon, service, product port, or product data
  needs migration.
- Keep or remove the exact package cache independently. NEXO-0049 created no
  global command files and no product manifest/lockfile entry.

## Escalation

- Treat a server/TUI plugin load error as a runtime compatibility blocker.
- Treat any observed prompt, argument, output, environment value, or credential
  in telemetry as a security blocker and disable the affected plugin until
  corrected.
- Do not switch to DCP, `snip`, a memory plugin, swarm, or telemetry database
  without a new governed architecture/dependency decision.

## Related Records

- Plan: `../plans/NEXO-0049-opencode2-productivity-observability.md`.
- Handoff: `../handoffs/HOFF-2026-07-18-opencode2-productivity-observability.md`.
- Implementation:
  `../implementations/IMPL-NEXO-0049-opencode2-productivity-observability.md`.
