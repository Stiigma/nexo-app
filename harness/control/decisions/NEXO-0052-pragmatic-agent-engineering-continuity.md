# NEXO-0052 Architecture Selection - Pragmatic Agent Engineering

## Metadata

- Task ID: `NEXO-0052`
- Date: 2026-07-29
- Evaluator: Codex
- Decision boundary: Nexo agent control plane and continuity state

## Context

The repository already owns a Node-based, file-backed control plane with
structured task manifests, Markdown evidence, compact context, and regression
tests. The improvement must reduce administrative and token cost while
preserving controlled security and release gates.

## Constraints

- Preserve historical records and current uncommitted work.
- Use no new dependency or external service.
- Keep fast and normal work proportional.
- Keep controlled security and evidence checks fail closed.

## Options Considered

1. Extend the current local control plane with compact continuity functions.
2. Add a graph or database as the canonical task and relationship store.
3. Introduce a workflow framework with class-based lifecycle states.

## Criteria

- Requirement fit: cross-chat continuity and better engineering contracts.
- Coupling and cohesion: one local owner for control-plane state.
- Data integrity and security: atomic writes and explicit selection.
- Operability and performance: bounded context and checkpoint-only writes.
- Testability and compatibility: Node standard library and existing tests.
- Cost and reversibility: no dependency, service, or data migration.

## Architecture Decision Evaluation

- Decision: approved
- Selected option: compatible extension of the existing modular file-backed control plane
- Rationale: existing local JSON, Markdown, control gates, and Node tests already own the required consistency boundary
- Pattern decision: retain the existing nexo Facade and use direct closed transition functions; no State hierarchy
- Required evidence or approval: focused harness tests, QA review, and security review
- Reversibility: remove the optional fields and continuity command while retaining historical JSON and Markdown records

## Consequences

- Normal work can persist a compact checkpoint without full Controlled
  ceremony.
- Controlled tasks keep the current manifest and evidence gates.
- Graphify remains available as an explicit diagnostic tool, not runtime state.

## Residual Risks

- Structural response scoring is not semantic proof.
- The continuity command remains local to this repository until a real second
  consumer justifies extraction.

## Related Evidence

- Plan: `harness/control/plans/NEXO-0052-pragmatic-agent-engineering-continuity.md`
- ADR: not required; no product/system boundary changes
- Dependency evaluation: not required; no dependency changes
- Migration plan: not required; optional fields preserve compatibility

