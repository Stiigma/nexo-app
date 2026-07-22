# NEXO-0035 Implementation - Terra Token-Efficient Agent Workflow

## Metadata

- Task ID: `NEXO-0035`
- Date: 2026-07-15
- Agent: `nexo-build`
- Related plan: `../plans/NEXO-0035-terra-token-efficient-workflow.md`
- Related handoff: `../handoffs/HOFF-2026-07-15-terra-token-efficient-workflow.md`
- Related report: `../reports/2026-07-15/NEXO-0035-terra-token-efficiency-session-002.md`

## Summary

OpenCode now starts Nexo sessions from a deterministic, bounded, validated
context packet instead of loading the full control plane by default. Terra is
the default model with low verbosity and risk-tiered reasoning. FIAD context is
session-scoped, and budget attribution no longer guesses the last active task.

## Files Changed

- `AGENTS.md`, `opencode.json`, and `.opencode/README.md`.
- `.opencode/scripts/build-session-context.mjs`.
- `.opencode/agents/nexo-resume.md`.
- `.opencode/plugins/isyte-ops.js` and `nexo-budget-guard.js`.
- `.opencode/tests/*.test.js` and `.opencode/.gitignore`.
- Canonical workflow, agent, memory-resume, live-state, policy, task, journal,
  implementation, QA, security, and report records under `harness/control/`.

## Behavior Changed

- The default OpenCode model is `opencode/gpt-5.6-terra`.
- Resume/summary/compaction use `medium`; normal Nexo roles use `high`;
  security uses `xhigh`; all use low text verbosity.
- `focus.json` links exactly one task, plan, handoff, latest report,
  constraints, next action, verification, and expected evidence.
- The compiler validates freshness, task status/links, source presence, task ID,
  and SHA-256 hashes. It deletes stale output and exits non-zero on conflict.
- The output is deterministic and must remain at or below 10,000 characters.
- Nexo sessions receive no FIAD system/compaction context. FIAD markers persist
  locally through compaction/reload and are cleared by a `nexo:*` command.
- Nexo commands bind their session to the focused or explicitly named task.
  Unbound sessions use `UNBOUND_SESSION`; they are never assigned to the last
  active row. The ledger aggregates cost/tokens by model, agent, and phase.

## Verification

- `node --test .opencode/tests/*.test.js`: 18/18 pass.
- The real focused packet is 4,113 characters, approximately 1,029 estimated
  tokens: about 91.6% below the measured 12,200-token bootstrap baseline.
- Terra exists in the local OpenCode model registry and advertises `medium`,
  `high`, and `xhigh` effort variants.
- Both plugins load and expose their expected lifecycle hooks.
- No paid request, database/storage write, secret, commit, push, or deploy was
  performed.

## Operational Notes

- Generated packet, FIAD markers, bindings, and ledger remain ignored under
  `.opencode/state/`.
- Normal resume runs `node .opencode/scripts/build-session-context.mjs`, then
  reads `AGENTS.md` plus `.opencode/state/session-context.json`.
- A compiler failure requires the complete fallback named in `AGENTS.md`.
- The budget binding command is `nexo:bind NEXO-0000`; regular `nexo:*`
  commands bind automatically to `focus.json` unless an explicit task ID is
  supplied.

## Follow-Up

- Repair OpenCode only with separate approval, then run real debug config and
  agent-resolution checks.
- Run a paid A/B benchmark only with separate approval and a new report.
