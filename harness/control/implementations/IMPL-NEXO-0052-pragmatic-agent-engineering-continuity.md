# NEXO-0052 Implementation - Pragmatic Agent Engineering And Continuity

## Metadata

- Task ID: `NEXO-0052`
- Date: 2026-07-29
- Agent: Codex
- Related plan: `harness/control/plans/NEXO-0052-pragmatic-agent-engineering-continuity.md`
- Related handoff: `harness/control/handoffs/HOFF-2026-07-29-pragmatic-agent-engineering-continuity.md`

## Summary

Added compact cross-chat continuity, strengthened planner/builder/QA contracts,
an explicit release-readiness gate, advisory default budget behavior, optional
Graphify, credential placeholders, and provider-neutral behavioral regression
checks.

## Files Changed

- Canonical Nexo agents, engineering skills, checklists, templates, workflow,
  task schema guidance, and compact context fallback.
- `nexo-work.mjs`, control-engine release support, and behavior evaluator.
- OpenCode adapters, commands, budget guard, doctor, configuration, and tests.

## Behavior Changed

- Normal work may persist one compact manifest and generated projection.
- Continuity resume requires an explicit task; promotion retains the same ID.
- Planning/build/QA now require requirement traceability, architecture/pattern
  decisions, validation/failures, focused tests, maintenance delta, and smell
  review.
- Monetary thresholds warn without aborting or writing reports by default.
- Release readiness is evaluated before, and separately from, deploy.
- Graphify is opt-in.
- Vercel credentials are read from the environment.

## Engineering Decisions

- Architecture/technology: extend the current file-backed modular control plane
  because it already owns local state and gates; reject a graph/database/service
  because no current scale or consistency force requires it.
- Pattern: retain the existing Nexo Facade with direct transition functions;
  reject a State hierarchy because the lifecycle is small and closed.
- Relevant performance bound: compiled context remains capped at 10,000
  characters; continuity writes occur only at durable checkpoints.
- Maintenance delta: one local Node command, schemas, and tests are added; the
  harness owner maintains them with existing control scripts.
- Intentional debt: continuity remains in one script to reuse one atomic state
  boundary. Extract only when a second runtime or storage consumer appears.

## Smell Gate

- Removed default forced reports/aborts, mandatory graph hooks, embedded
  credentials, and underspecified role contracts.
- Retained regex response checks as a transparent contract smoke test; revisit
  only if outcome metrics show missing semantic failures worth a model grader.

## Verification

- 99 OpenCode harness tests passed.
- 3 Codex adapter tests passed.
- Both doctors passed; Graphify produced one expected opt-in warning.
- Syntax, secret-pattern scan, and whitespace checks passed.

## Operational Notes

- The previously exposed Vercel credential must be revoked or rotated in the
  provider. This implementation deliberately does not mutate the external
  account.

## Follow-Up

- Restart OpenCode so new sessions load the updated commands and optional
  plugin layout.

