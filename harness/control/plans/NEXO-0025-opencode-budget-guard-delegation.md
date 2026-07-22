# NEXO-0025 - OpenCode Budget Guard And Real Delegation

## Objective

Make OpenCode safer for Nexo work by enforcing real cost limits from completed
assistant messages and by allowing `nexo-plan` to delegate handoffs directly to
`nexo-build` and `nexo-infra`.

## Done When

- `nexo-plan` can call `nexo-build` and `nexo-infra` through `permission.task`
  without falling back to `general`.
- `nexo-build` and `nexo-infra` are available as both primary and subagents.
- OpenCode has a local budget guard plugin that records real reported cost and
  tokens from completed assistant messages.
- Budget limits are configurable in a machine-readable policy file.
- The guard requests a handoff/report at soft limits and aborts at hard limits.
- The ledger is local state under `.opencode/state/` and is ignored by git.
- Synthetic tests cover counting, soft handoff, hard abort, duplicate handling,
  task-level totals, and compaction context injection.

## Scope

- OpenCode adapter metadata in `.opencode/agents/`.
- OpenCode plugin registration in `opencode.json`.
- Local plugin under `.opencode/plugins/`.
- Budget policy under `harness/control/state/`.
- Control-plane task, plan, handoff, implementation, report, and journal
  records.

## Out Of Scope

- External provider hard budget configuration.
- Real paid OpenCode run solely for validation.
- Commit, push, deploy, or changes to product backend/frontend code.

## Steps

1. Register `NEXO-0025` in `tasks.md`.
2. Create this plan and a build handoff for the implementation.
3. Add explicit OpenCode agent frontmatter for delegation and subagent modes.
4. Add `budget-policy.json` with session and task limits.
5. Implement `.opencode/plugins/nexo-budget-guard.js`.
6. Register the plugin in `opencode.json`.
7. Add synthetic tests for plugin behavior.
8. Verify OpenCode config/agent resolution and run synthetic tests.
9. Record implementation details, report, and journal entry.

## Progress

- 2026-07-07: Plan created from user-approved implementation brief.
- 2026-07-07: Chrome DevTools MCP added to `opencode.json` for a dedicated
  Chrome instance at `127.0.0.1:9222`; runbook and implementation record
  created.

## Decision Log

- 2026-07-07: Use OpenCode-reported `AssistantMessage.cost` and `tokens` rather
  than estimating cost locally.
- 2026-07-07: Session limits default to soft `$0.40` and hard `$0.50`.
- 2026-07-07: Task limits default to soft `$2.00` and hard `$2.50`.
- 2026-07-07: The plugin writes local budget state to
  `.opencode/state/budget-ledger.json`, which must remain ignored.
- 2026-07-07: If there is not at least `$0.05` before the hard limit, the plugin
  creates a minimal automatic report and aborts instead of spending more budget
  asking the model to write a handoff.
- 2026-07-07: Use project-local `mcp.chrome-devtools` with
  `chrome-devtools-mcp@latest` and a dedicated temporary Chrome profile instead
  of a personal browser profile.

## Risks

- OpenCode plugin APIs are experimental and may change across versions.
- `opencode debug config` validates config shape but does not prove a paid model
  run will produce the exact same event stream.
- Multiple simultaneously active tasks in `tasks.md` would make task attribution
  ambiguous; the plugin chooses the last active row.

## Verification

- `node .opencode/tests/nexo-budget-guard.test.js`.
- `opencode debug config`.
- `opencode debug agent nexo-plan`.
- `opencode debug agent nexo-build`.
- `opencode debug agent nexo-infra`.
