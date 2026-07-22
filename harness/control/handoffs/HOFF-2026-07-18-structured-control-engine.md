# HOFF-2026-07-18-structured-control-engine

## Metadata

- Task ID: `NEXO-0046`
- Date: 2026-07-18
- Authoring agent: `nexo-plan`
- Receiving agent: `nexo-build`
- Status: completed

## Objective

Implement a read-only, fail-closed evaluator for structured task manifests,
repository evidence, operational gates, and lifecycle transitions.

## Context

`NEXO-0045` centralized orchestration but its transition gates remain
prompt-enforced. `tasks.md` must stay canonical. The new module may inspect
state and return a decision, but must not edit task rows or evidence.

## Source Docs

- `AGENTS.md`
- `harness/control/WORKFLOW.md`
- `harness/control/tasks.md`
- `harness/control/agents/nexo.md`
- `harness/control/skills/nexo-start-task.md`
- `harness/control/skills/nexo-close-task.md`
- `harness/control/skills/nexo-qa-review.md`
- `harness/control/skills/nexo-security-review.md`
- `harness/control/plans/NEXO-0046-structured-control-engine.md`

## Files To Create Or Modify

- `harness/control/scripts/control-engine.mjs`
- `harness/control/state/tasks/README.md`
- `harness/control/state/tasks/NEXO-0046.json`
- `.opencode/tests/control-engine.test.js`
- `harness/control/WORKFLOW.md`
- `harness/control/agents/nexo.md`
- `harness/control/skills/nexo-start-task.md`
- `harness/control/skills/nexo-close-task.md`
- NEXO-0046 operational evidence files

## Implementation Steps

1. Define and validate manifest schema version 1.
2. Reuse the canonical task-row parser from the context compiler.
3. Validate task identity, status synchronization, repository-contained paths,
   artifact existence, and task references.
4. Evaluate build, QA, security, and close gates.
5. Evaluate only declared lifecycle transitions.
6. Parse QA/security decision fields and reject conditional or blocked reviews
   at close.
7. Expose deterministic JSON output and distinct invalid-input versus blocked
   exit codes.
8. Add tests and run the NEXO-0046 lifecycle tracer.

## Verification

- Focused tests cover success and every fail-closed class.
- Complete harness tests remain green.
- CLI output is valid JSON for allowed and blocked decisions.
- NEXO-0046 passes its own build, implemented, and close decisions in order.

## Risks

- Duplicate status in the manifest is intentional for conflict detection, not a
  second source of truth.
- Artifact naming varies historically; manifests use explicit paths rather than
  filename guessing.
- Review text parsing must accept only exact canonical decision values.

## Acceptance Criteria

- The engine never mutates repository files.
- Missing, escaped, contradictory, conditional, or blocked evidence prevents
  the affected gate or transition.
- Non-required gates are explicit in the manifest rather than inferred.
- Existing tasks and context compilation continue to work unchanged.

## Required Gates

- QA review: required.
- Security review: required because repository permission/control policy is
  affected.
- User confirmation: not required; no external action or dependency change.
