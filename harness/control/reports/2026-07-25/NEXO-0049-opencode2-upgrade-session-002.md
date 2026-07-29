# NEXO-0049 OpenCode2 Upgrade - Session 002

## Metadata

- Task ID: `NEXO-0049`
- Date: 2026-07-25
- Agent: `nexo`
- Scope: operational follow-up for the closed OpenCode2 workflow task

## Outcome

The custom OpenCode2 installation was upgraded from
`0.0.0-dev-202607181805` to stable `1.18.5`. Both `opencode2` and the default
`opencode` resolve the same package-local executable and version. The TUI no
longer presents the stable update dialog.

## Diagnosis

- `opencode2 upgrade` reproduced the reported failure:
  `Unknown installation method: unknown`.
- The command located the executable inside
  `~/.opencode-dev/node_modules/opencode-ai` but could not infer the package
  manager for this custom, non-global layout.
- The first package-local update also exposed npm 12 install-script policy:
  `opencode-ai` postinstall was blocked until that exact package was approved
  and rebuilt.
- `npm install` alone honored the stale lock and temporarily resolved an older
  dev build. `npm update opencode-ai` refreshed the dev package, and
  `npm install opencode-ai@latest` completed the intended stable upgrade.

## External State Changed

- `~/.opencode-dev/package.json` now requests `opencode-ai ^1.18.5` and
  approves only the `opencode-ai@1.18.5` postinstall.
- `~/.opencode-dev/package-lock.json` and package-local `node_modules` now
  resolve `opencode-ai@1.18.5`.
- Existing `~/.local/bin/opencode2` and `opencode` links continue to resolve the
  package-local executable.

## Repository Files Changed

- `harness/control/runbooks/NEXO-0049-opencode2-productivity-observability.md`
- `harness/control/reports/2026-07-25/NEXO-0049-opencode2-upgrade-session-002.md`
- `harness/control/journal/2026-07-25.md`

## Verification

- `opencode2 --version`: `1.18.5`.
- `opencode --version`: `1.18.5`.
- `npm ls --depth=0`: `opencode-ai@1.18.5`.
- `npm install-scripts ls`: no unreviewed install scripts.
- `node .opencode/scripts/opencode2-doctor.mjs`: `ok: true`, no blockers or
  warnings.
- `opencode2 debug config`: pass; Nexo, privacy, bounded context, plugins, and
  MCP configuration resolved.
- `opencode2 debug info`: pass; version `1.18.5` and all configured plugins
  listed.
- `opencode2 debug startup`: pass in approximately 775 ms.
- `node --test .opencode/tests/*.test.js`: 81/81 passed.
- Six-second pseudo-TTY launch: TUI and project configuration loaded, version
  `1.18.5` rendered, and no update dialog appeared.

The pseudo-TTY smoke reported unavailable optional GitHub and Chrome DevTools
MCP servers because their external processes were not active. This is unrelated
to the runtime upgrade and did not produce a plugin or TUI load error.

## Residual Notes

- Direct `opencode2 upgrade` still prompts because installation-method
  inference remains unsupported for this custom layout. Future upgrades must
  use the package-local npm procedure added to the runbook.
- npm 12 warns that Node `24.14.1` is below its supported `24.15.0` floor. The
  upgrade, audit, rebuild, runtime checks, and complete harness passed, but Node
  should be updated separately before a future npm upgrade.

## Recommended Next Step

Use OpenCode2 normally. For its next release, update from `~/.opencode-dev`
using the runbook rather than the built-in upgrade command.
