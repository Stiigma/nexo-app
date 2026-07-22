# HOFF-2026-07-18-opencode2-productivity-observability

## Metadata

- Task ID: `NEXO-0049`
- Date: 2026-07-18
- Authoring agent: `nexo`
- Receiving agent: `nexo-build`
- Status: ready for governed build

## Objective

Implement all five approved OpenCode2 productivity phases as exact, bounded,
project-local additions that do not replace Nexo orchestration or memory.

## Context

The current harness has one visible `nexo`, eight hidden non-delegating
specialists, deterministic context, a read-only lifecycle engine, hardened MCPs,
and exact architecture/dependency/review contracts. The user wants visual plan
review, token/cost visibility, notifications, sanitization, observability, and
measured context improvements without installing overlapping harnesses.

## Source Docs

- `AGENTS.md`
- `NEXO_HARNESS.md`
- `opencode.json`
- `.opencode/package.json`
- `.opencode/plugins/nexo-budget-guard.mjs`
- `.opencode/lib/nexo-budget-guard.cjs`
- `harness/control/agents/nexo.md`
- `harness/control/state/budget-policy.json`
- `harness/control/state/tasks/README.md`
- `harness/control/decisions/NEXO-0049-architecture-selection.md`
- `harness/control/decisions/NEXO-0049-dependency-selection.md`
- `harness/control/decisions/NEXO-0049-external-approval.md`

## Files To Create Or Modify

- `opencode.json`
- `tui.json`
- `.opencode/plugins/nexo-productivity.mjs`
- `.opencode/lib/nexo-productivity.cjs`
- `.opencode/tui/nexo-status.tsx`
- `.opencode/scripts/opencode2-doctor.mjs`
- `.opencode/tests/runtime-productivity.test.js`
- `.opencode/tests/nexo-productivity-plugin.test.js`
- `.opencode/tests/nexo-budget-guard.test.js`
- `harness/control/runbooks/NEXO-0049-opencode2-productivity-observability.md`
- NEXO-0049 implementation, report, QA, security, closeout, journal, and live
  state records.

## Implementation Steps

1. Capture runtime identities, paths, startup, ports, and current plugin origins.
2. Repair the broken official package through its bundled postinstall when safe.
3. Add exact Plannotator manual configuration and local-only environment bounds.
4. Configure native TUI attention and the local Nexo status footer.
5. Implement prompt sanitization and `.env*` read/write denials with no secret
   mutation tools.
6. Extend the existing ledger with argument-free tool counts and duration only.
7. Configure native output bounds and compaction pruning.
8. Add disabled-by-default loopback visual status on a non-product port.
9. Test rollback, privacy, path checks, config shape, and existing regressions.

## Verification

- Run every command declared in `state/tasks/NEXO-0049.json`.
- Confirm no prompt, tool argument, tool output, environment value, or credential
  is written to local telemetry.
- Confirm one selectable Nexo primary and no specialist delegation regression.
- Confirm port `5173` remains unused by harness visualization.
- Confirm no DCP, snip, memory, swarm, or autonomous review plugin is loaded.

## Risks

- Dev-build compatibility may differ from published plugin semver.
- Package postinstall can mutate global command files.
- Over-redaction can remove useful debugging evidence.
- TUI config changes are invisible until restart.

## Acceptance Criteria

- All five phases have implemented output or an evidence-backed rejection of an
  unsafe candidate with a native/local replacement.
- Runtime, project config, TUI config, plugin hooks, tests, and rollback are
  documented and deterministic.
- All required gates pass without weakening existing harness behavior.

## Required Gates

- QA review: required.
- Security review: required.
- User confirmation: provided by the explicit instruction "HAZ LAS 5 FASES DE UNA";
  no commit, push, deploy, OAuth, credentials, or paid inference is authorized.
