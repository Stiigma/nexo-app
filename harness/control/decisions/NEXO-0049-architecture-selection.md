# NEXO-0049 Architecture Selection - Additive OpenCode2 Adapters

## Metadata

- Task ID: `NEXO-0049`
- Date: 2026-07-18
- Evaluator: `nexo`
- Decision boundary: OpenCode2 productivity, visual, privacy, telemetry, and context behavior.

## Context

Nexo already has canonical memory, one orchestrator, hidden specialists,
deterministic context, lifecycle gates, MCP boundaries, and evidence contracts.
The requested improvements should decorate and observe that architecture rather
than replace it.

## Constraints

- Keep `harness/control/` canonical and `nexo` as the sole Nexo primary.
- Do not add a second plan store, memory database, task engine, or QA pipeline.
- Keep external actions, secrets, paid inference, and browser control gated.
- Preserve deterministic tests and rollback.

## Options Considered

1. Keep the current architecture unchanged and add no productivity features.
2. Deepen the current adapter seams with one manual visual dependency, local
   server/TUI adapters, native OpenCode controls, and the existing ledger.
3. Replace Nexo with a bundled swarm, workspace, memory, or workflow framework.

## Criteria

- Requirement fit: Option 2 provides visual and operational improvements without replacing governance.
- Coupling and cohesion: OpenCode-specific behavior remains under `.opencode/` and canonical policy remains under `harness/control/`.
- Data integrity and security: Telemetry excludes content and secret access fails closed.
- Operability and performance: Native controls avoid extra daemons except explicit manual visual review.
- Testability and compatibility: Local adapters expose deterministic functions and exact config tests.
- Cost and reversibility: One pinned package plus removable local files is the smallest reversible change.

## Architecture Decision Evaluation

- Decision: approved
- Selected option: Option 2, deepen existing OpenCode adapter seams without changing canonical orchestration or memory.
- Rationale: It supplies the requested visual, token, notification, safety, and observability capabilities with minimal new authority and no duplicate lifecycle.
- Pattern decision: Adapter pattern at the OpenCode boundary; no new workflow or memory pattern.
- Required evidence or approval: Exact dependency evaluation, explicit external approval, focused tests, full harness, QA, and security.
- Reversibility: Remove the exact plugin entry, `tui.json`, and local adapter files; canonical task evidence remains unaffected.

## Consequences

- Visual and runtime behavior is richer while governance remains file-backed and deterministic.
- Config-time changes require restart and explicit compatibility verification.

## Residual Risks

- OpenCode dev builds can change plugin/TUI APIs before stable semver releases.

## Related Evidence

- Plan: `harness/control/plans/NEXO-0049-opencode2-productivity-observability.md`
- ADR: none; this deepens the accepted adapter architecture without creating a new durable product seam.
- Dependency evaluation: `harness/control/decisions/NEXO-0049-dependency-selection.md`
- Migration plan: not required.
