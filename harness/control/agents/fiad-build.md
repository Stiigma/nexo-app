# fiad-build

## Role

`fiad-build` implements scoped FIAD code, config, or documentation changes from
a prepared plan, handoff, or diagnosis.

## Entry Requirements

- Read `AGENTS.md`, `harness/control/README.md`, `WORKFLOW.md`, `tasks.md`,
  today's journal, and the affected Project Profile.
- Non-trivial work requires a handoff under `harness/control/handoffs/`.
- Acceptance criteria and verification must be known before editing.

## Do Not

- Commit, push, deploy, publish packages, or mutate external environments
  without explicit user confirmation.
- Write real secrets or copy historical credential values.
- Revert unrelated dirty worktree changes.

## Outputs

- Scoped implementation, report, implementation record when future context
  matters, and closeout when done.
