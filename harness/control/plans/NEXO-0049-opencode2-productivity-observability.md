# NEXO-0049 - OpenCode2 Productivity, Observability, And Visual Workflow

## Objective

Execute the five user-approved OpenCode2 enhancement phases in one governed,
reversible task while preserving `nexo` as the sole orchestrator and
`harness/control/` as canonical memory.

## Done When

- The active `opencode2` runtime and the broken default `opencode` path are
  diagnosed, repaired or safely bounded, and recorded by a deterministic doctor.
- Visual plan review is available without auto-handoff, cloud sharing, URL
  retrieval, or a second plan store.
- OpenCode2 exposes bounded visual budget/task status and built-in attention
  notifications without showing prompt content.
- User-pasted logs are sanitized and direct `.env*` reads/writes are blocked
  without granting credential mutation tools.
- Tool telemetry extends the existing local budget ledger rather than creating
  a second telemetry database.
- Context and tool output use native bounded pruning settings; DCP and automatic
  `snip` rewriting are not adopted without accepted-result A/B evidence.
- Optional visual observability avoids port `5173`, global shell wrappers, and
  background autonomous agents.
- Focused tests, the complete harness, runtime diagnostics, QA, security, and
  the governed close transition pass.

## Scope

- Project OpenCode configuration, TUI configuration, local plugins, tests,
  runtime doctor, runbook, and canonical Agent Workflow evidence.
- Exact pinned Plannotator integration in manual, local-only mode.
- Project-local status/telemetry, notification, sanitization, secret guard, and
  visual observability adapters.
- Repair of the explicitly approved broken OpenCode CLI installation when the
  bundled official postinstall is sufficient and does not alter credentials.

## Out Of Scope

- Replacing `nexo`, its specialists, the control engine, Graphify, or canonical
  task memory.
- Background agents, swarms, worktrees, autonomous deploy, auto-fix, memory
  databases, prompt-content telemetry, OAuth, paid inference, or provider use.
- Product backend, frontend, database, Azure, deployment, or port-5173 changes.
- Commit, push, release, or publication.

## Steps

1. Record the runtime/path baseline and add a deterministic OpenCode2 doctor.
2. Repair the broken default CLI through its bundled exact-version postinstall,
   then keep `opencode2` as the validated target for this task.
3. Add exact pinned Plannotator in manual mode with sharing and URL retrieval
   disabled; keep canonical plans under `harness/control/plans/`.
4. Add a project TUI config with built-in privacy-safe attention and a local
   footer showing task, status, session cost, and thresholds.
5. Add one local productivity plugin for prompt sanitization, `.env*` access
   denial, tool-call telemetry, and bounded local status snapshots.
6. Use native OpenCode `tool_output` and `compaction` controls instead of an
   unmeasured third-party compressor; record DCP and `snip` decisions.
7. Add optional local visual observability on a non-conflicting loopback port,
   disabled by default and without opening a browser automatically.
8. Run focused and full tests, runtime diagnostics, QA, security, Graphify, and
   governed lifecycle transitions.

## Progress

- 2026-07-18: User approved executing all five phases together. Primary-source
  review selected one exact external visual dependency and local adapters for
  all remaining behavior.
- 2026-07-18: Implemented the exact manual Plannotator integration, native
  bounds, TUI attention/footer, content sanitization, `.env*` and URL guards,
  content-free ledger telemetry, deterministic doctor, and loopback status UI.
  A real TTY smoke test exposed the dev loader's CommonJS incompatibility; thin
  single-export ESM adapters now load the existing testable CommonJS cores.
- 2026-07-18: Closed after 81 tests, effective runtime and pseudo-TTY checks,
  governed implemented/QA/security/close decisions, QA pass, and security
  approval after narrowing annotation paths.

## Decision Log

- 2026-07-18: Preserve the current orchestrator, manifest, evidence, and memory
  architecture; add presentation and enforcement adapters only.
- 2026-07-18: Pin `@plannotator/opencode@0.23.1` and run it manually with
  sharing and Jina URL retrieval disabled.
- 2026-07-18: Prefer native attention, native compaction pruning, native output
  bounds, and the existing ledger over notification, DCP, telemetry, or memory
  packages that duplicate current capabilities.
- 2026-07-18: Do not auto-prefix shell commands with `snip`; no binary is
  installed and filtered output cannot replace full acceptance evidence.

## Risks

- The active `opencode2` version is a dev build and npm package semver checks
  may not describe its effective plugin API.
- Plannotator's package postinstall can add global commands; runtime checks must
  prove project configuration remains authoritative and rollbackable.
- Sanitization can hide diagnostically relevant long strings; preserve only
  synthetic values through an explicit escape and test false-positive cases.
- Tool telemetry must never persist arguments, output, prompts, or secrets.
- TUI plugins are config-time code and require a full OpenCode restart.

## Verification

- `node --test .opencode/tests/runtime-productivity.test.js`.
- `node --test .opencode/tests/nexo-productivity-plugin.test.js`.
- `node --test .opencode/tests/nexo-budget-guard.test.js`.
- `node --test .opencode/tests/*.test.js`.
- `opencode2 debug config`.
- `opencode2 debug info`.
- `opencode2 debug startup`.
- `node .opencode/scripts/build-session-context.mjs`.
- `graphify update .`.
