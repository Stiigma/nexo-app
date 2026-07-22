# NEXO-0049 Report - OpenCode2 Productivity And Observability Session 001

## Metadata

- Task ID: `NEXO-0049`
- Date: 2026-07-18
- Agent: `nexo-build`
- Status: implementation verified; awaiting governed QA and security review

## What Was Done

- Repaired the default `opencode` command through its bundled exact-version
  postinstall while preserving `opencode2` as the validation target.
- Implemented exact manual Plannotator, native output/compaction bounds, TUI
  attention and status, local sanitization and secret guards, content-free tool
  telemetry, a runtime doctor, and an optional loopback status page.
- Added project-local visual-review commands because the package cache did not
  run its global command-copy postinstall.
- Replaced incompatible CommonJS plugin entrypoints with one-function ESM
  adapters after a real TTY smoke test exposed the dev loader behavior.
- Narrowed manual annotation during pre-close security review to explicit
  project-relative `.md`, `.txt`, or `.html` files so folders, traversal,
  absolute paths, URLs, and `.env*` cannot bypass the direct-file guard.
- Updated current Nexo/FIAD adapter documentation without rewriting historical
  reports or closeouts.

## Files Changed

- OpenCode/TUI config, plugin adapters and cores, TUI footer, runtime scripts,
  and OpenCode tests.
- NEXO-0049 plan, handoff, runbook, implementation, and this report.
- Current harness and FIAD adapter maps affected by the plugin path change.

## Verification Performed

- `node --test .opencode/tests/runtime-productivity.test.js`: passed, 4 tests.
- `node --test .opencode/tests/nexo-productivity-plugin.test.js`: passed, 4 tests.
- `node --test .opencode/tests/nexo-budget-guard.test.js`: passed, 9 tests.
- `node --test .opencode/tests/*.test.js`: passed, 81 tests after correcting one
  stale test import found by the first full-suite run.
- `opencode2 debug config`: passed; exact plugin, commands, native bounds,
  sharing disabled, and prior effective controls resolve.
- `opencode2 debug info`: passed; all five server plugin origins resolve.
- `opencode2 debug startup`: passed; startup remained near one second.
- `node .opencode/scripts/build-session-context.mjs`: passed at 4,148 characters
  and approximately 1,037 tokens.
- `graphify update .`: passed at 9,620 nodes, 11,615 edges, and 973 communities;
  pre-existing zero-node and optional SQL-parser warnings remain.
- `node .opencode/scripts/opencode2-doctor.mjs`: passed with no blocker and one
  explicit CLI-version mismatch warning.
- Pseudo-TTY `opencode2 --mini --print-logs --log-level DEBUG` smoke: server
  plugins and `tui.json` loaded without plugin errors; process was intentionally
  terminated after startup without a model call.

## External And Security Effects

- The exact Plannotator package was resolved in OpenCode's local cache. No
  global command files, product dependency, credential, OAuth grant, sharing,
  paid inference, commit, push, deploy, or external environment changed.
- The optional status server was tested on ephemeral loopback and is not left
  running.

## Open Items

- Transition to implemented, run governed QA and security review, then close if
  both decisions pass.
- Restart the user's normal OpenCode process after close.

## Recommended Next Step

Complete final derived-graph verification, then run the governed implemented,
QA, security, and close decisions without changing product focus.
