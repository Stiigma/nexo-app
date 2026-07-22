# NEXO-0046 - Structured Task Control Engine

## Objective

Add a deterministic local module that validates Nexo task gates and lifecycle
transitions from structured state and repository evidence before the
orchestrator changes live state.

## Done When

- A versioned JSON manifest records one governed task's status, requirements,
  evidence paths, and verification commands.
- The engine detects manifest/task-index status conflicts and fails closed.
- Build, QA, security, and close gates return machine-readable checks and
  blockers.
- Planned, active, blocked, implemented, and closed transitions follow one
  explicit transition table.
- Required architecture, dependency, migration, external approval, QA, and
  security evidence is enforced when declared.
- Evidence paths cannot escape the repository and review decisions must be
  non-blocking before close.
- Focused tests, the complete harness suite, a real NEXO-0046 lifecycle tracer,
  and Graphify pass.

## Scope

- Add one standard-library ESM control-engine module and CLI.
- Add per-task manifest schema documentation and the NEXO-0046 manifest.
- Add deterministic tests for gates, transitions, paths, status conflicts, and
  review decisions.
- Integrate control-engine checks into the canonical orchestrator workflow.
- Record implementation, QA, security, report, and closeout evidence.

## Out Of Scope

- Automatically editing `tasks.md` or artifact files.
- Migrating existing tasks to structured manifests.
- Replacing the compact session-context compiler or `focus.json`.
- Adding a workflow framework, database, daemon, or dependency.
- Hardening MCP servers or running paid model inference.

## Steps

1. Register NEXO-0046 and its initial structured manifest.
2. Write failing tests for lifecycle and evidence decisions.
3. Implement the evaluator and CLI with repository-contained path checks.
4. Document the manifest interface and orchestrator invocation points.
5. Run focused and complete tests.
6. Exercise active-to-implemented and implemented-to-closed checks on
   NEXO-0046 itself.
7. Record QA/security decisions and close the task.

## Progress

- 2026-07-18: Defined the read-only engine interface and registered the task.
- 2026-07-18: Implemented state, evidence, gate, transition, CLI, and fail-closed
  path/review validation; focused tests and the real build gate pass.
- 2026-07-18: Complete harness, effective config, context compiler, and
  Graphify acceptance pass; implementation evidence is ready for the
  active-to-implemented decision.
- 2026-07-18: Security review required canonical evidence directories and
  symlink containment. Added governed implemented-to-active/blocked rework so
  post-implementation findings cannot be corrected outside the state machine.
- 2026-07-18: Rework acceptance passes with 13 focused and 37 complete tests;
  session 002 is the current implementation evidence.
- 2026-07-18: Final review-decision hardening passes with 14 focused and 38
  complete tests; session 003 is the current implementation evidence.
- 2026-07-18: QA passed, security approved, and the engine authorized
  implemented-to-closed with all required evidence.

## Decision Log

- 2026-07-18: Keep `tasks.md` canonical and make the engine read-only. A
  per-task JSON manifest supplies structured policy and evidence without a
  risky migration or dual-writer problem.
- 2026-07-18: Use one closed transition table and direct functions. Pattern:
  none; State objects would add indirection to five stable lifecycle values.
- 2026-07-18: Use only Node.js standard-library modules. A workflow framework
  is unjustified because no persistence, retries, scheduling, or distributed
  execution is required.

## Risks

- The orchestrator still applies approved status changes manually; a later task
  may add safe mutation after the evaluator proves stable.
- Existing tasks without manifests remain governed by current Markdown rules.
- Evidence validation confirms presence, task identity, and review decisions;
  it cannot prove that a reported command was genuinely executed.

## Verification

- `node --test .opencode/tests/control-engine.test.js`
- `node --test .opencode/tests/*.test.js`
- `node harness/control/scripts/control-engine.mjs gate --task NEXO-0046 --name build`
- `node harness/control/scripts/control-engine.mjs transition --task NEXO-0046 --to implemented`
- `node harness/control/scripts/control-engine.mjs transition --task NEXO-0046 --to closed`
- `node .opencode/scripts/build-session-context.mjs`
- `graphify update .`
