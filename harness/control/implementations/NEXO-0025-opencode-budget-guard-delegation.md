# NEXO-0025 Implementation - OpenCode Budget Guard And Delegation

## Metadata

- Task ID: `NEXO-0025`
- Date: 2026-07-07
- Agent: nexo-build
- Related plan: `../plans/NEXO-0025-opencode-budget-guard-delegation.md`
- Related handoff: `../handoffs/HOFF-2026-07-07-opencode-budget-guard-build.md`
- Related report: `../reports/2026-07-07/NEXO-0025-opencode-budget-guard-session-001.md`

## Summary

OpenCode now has explicit Nexo delegation metadata and a local budget guard
plugin. The guard records completed assistant message cost/tokens, maintains a
local ledger, prompts for continuity records at soft limits, aborts at hard
limits, and injects budget context during compaction.

## Files Changed

- `.opencode/agents/nexo-plan.md`
- `.opencode/agents/nexo-build.md`
- `.opencode/agents/nexo-infra.md`
- `.opencode/.gitignore`
- `.opencode/plugins/nexo-budget-guard.js`
- `.opencode/tests/nexo-budget-guard.test.js`
- `opencode.json`
- `harness/control/state/budget-policy.json`
- `harness/control/plans/NEXO-0025-opencode-budget-guard-delegation.md`
- `harness/control/handoffs/HOFF-2026-07-07-opencode-budget-guard-build.md`
- `harness/control/tasks.md`
- `harness/control/README.md`
- `harness/control/state/CURRENT.md`
- `harness/control/state/NEXT.md`
- `harness/control/journal/2026-07-07.md`
- `harness/control/reports/2026-07-07/NEXO-0025-opencode-budget-guard-session-001.md`

## Behavior Changed

- `nexo-plan` is a primary agent with explicit task delegation permission to
  `nexo-build` and `nexo-infra`; wildcard task delegation is denied.
- `nexo-build` and `nexo-infra` are available in `mode: all`.
- OpenCode loads `./.opencode/plugins/nexo-budget-guard.js`.
- Completed assistant messages are counted once by message ID.
- Ledger state is written to `.opencode/state/budget-ledger.json`.
- Soft limits request a continuity handoff/report.
- Hard limits create an automatic report and abort the session.
- Compaction receives current budget/task state.

## Verification

- `node .opencode/tests/nexo-budget-guard.test.js` passed with 5 synthetic
  tests.
- `opencode debug config` passed and resolved only
  `.opencode/plugins/nexo-budget-guard.js` as the local plugin.
- `opencode debug agent nexo-plan` passed with `mode: primary`, task wildcard
  deny, explicit `nexo-build`/`nexo-infra` allows, and `tools.task = true`.
- `opencode debug agent nexo-build` and `opencode debug agent nexo-infra`
  passed with `mode: all`.
- Direct plugin-load smoke check passed and returned `event` plus
  `experimental.session.compacting` hooks.

## Operational Notes

- Defaults live in `harness/control/state/budget-policy.json`.
- `.opencode/state/` is intentionally ignored.
- The plugin chooses the last `active` row in `harness/control/tasks.md` when
  more than one active task exists.
- Provider-side hard budget controls remain recommended as a second layer.

## Follow-Up

- Run a real low-cost OpenCode dry-run only when the user explicitly approves
  spending provider budget.
