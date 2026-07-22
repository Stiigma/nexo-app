# HOFF-2026-07-07-opencode-budget-guard-build

## Metadata

- Task ID: `NEXO-0025`
- Date: 2026-07-07
- Authoring agent: nexo-plan
- Receiving agent: nexo-build
- Status: implemented in this session

## Objective

Implement OpenCode adapter changes and a local budget guard plugin so Nexo can
delegate planned implementation work to the correct subagents and stop OpenCode
sessions before spending past configured limits.

## Context

OpenCode adapters live in `.opencode/`, but `harness/control/` remains the
canonical operating system. Prior delegation rules were documented in the
control plane, but the OpenCode adapter metadata did not explicitly grant
`nexo-plan` task permission for `nexo-build` and `nexo-infra`.

## Source Docs

- `AGENTS.md`
- `harness/control/README.md`
- `harness/control/WORKFLOW.md`
- `harness/control/agents/nexo-plan.md`
- `harness/control/agents/nexo-build.md`
- `harness/control/agents/nexo-infra.md`
- `harness/control/plans/NEXO-0025-opencode-budget-guard-delegation.md`

## Files To Create Or Modify

- `.opencode/agents/nexo-plan.md`
- `.opencode/agents/nexo-build.md`
- `.opencode/agents/nexo-infra.md`
- `.opencode/.gitignore`
- `.opencode/plugins/nexo-budget-guard.js`
- `.opencode/tests/nexo-budget-guard.test.js`
- `opencode.json`
- `harness/control/state/budget-policy.json`
- `harness/control/tasks.md`
- `harness/control/README.md`
- `harness/control/state/CURRENT.md`
- `harness/control/state/NEXT.md`
- `harness/control/journal/2026-07-07.md`
- `harness/control/implementations/NEXO-0025-opencode-budget-guard-delegation.md`
- `harness/control/reports/2026-07-07/NEXO-0025-opencode-budget-guard-session-001.md`

## Implementation Steps

1. Add OpenCode YAML frontmatter:
   - `nexo-plan`: `mode: primary`; `permission.task.nexo-build = allow`;
     `permission.task.nexo-infra = allow`; wildcard task deny.
   - `nexo-build`: `mode: all`.
   - `nexo-infra`: `mode: all`.
2. Add `harness/control/state/budget-policy.json` with USD limits and behavior.
3. Implement plugin event handling for `message.updated`.
4. Count only completed assistant messages and dedupe by `messageID`.
5. Persist `.opencode/state/budget-ledger.json`.
6. Detect the active task from `harness/control/tasks.md`.
7. Prompt for handoff/report on soft limits and abort on hard limits.
8. Create a minimal automatic report when no handoff margin remains.
9. Inject budget state during `experimental.session.compacting`.
10. Register the plugin in `opencode.json`.
11. Add and run synthetic tests.
12. Verify resolved OpenCode config and agent modes/permissions.

## Verification

- `node .opencode/tests/nexo-budget-guard.test.js`
- `opencode debug config`
- `opencode debug agent nexo-plan`
- `opencode debug agent nexo-build`
- `opencode debug agent nexo-infra`

## Risks

- OpenCode plugin loading and event schemas are version-sensitive.
- A real provider-side spending cap is still recommended as a second layer.
- A live OpenCode model dry-run would spend money; synthetic events are used for
  deterministic verification.

## Acceptance Criteria

- Synthetic tests pass.
- Resolved `nexo-plan` config shows task delegation to `nexo-build` and
  `nexo-infra`.
- Resolved `nexo-build` and `nexo-infra` configs show `mode: all`.
- The plugin appears in resolved OpenCode config.
- `.opencode/state/` is ignored by `.opencode/.gitignore`.

## Required Gates

- QA review: not required before this implementation report; recommended if
  OpenCode behavior changes again.
- Security review: not required; no secrets or external permissions added.
- User confirmation: required before commit, push, deploy, or provider-side
  account changes.
