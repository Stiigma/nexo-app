# NEXO-0018 - Modular Monolith Architecture

## Objective

Codify the user-approved Nexo v1 architecture recommendation as durable project
guidance before `NEXO-0007` scaffolds the first product modules.

## Done When

- An accepted ADR records the modular monolith, DDD layering, CQRS, repository,
  outbox, RabbitMQ, adapter, and deployment boundaries.
- The v1 master plan and F1 auth handoff point to the ADR.
- Live control-plane state records the new architecture convention without
  reopening historical F0 records.
- A report and closeout capture verification and the recommended next step.

## Scope

- Record architecture conventions for durable product code under expected
  `back/` and `front/` paths.
- Define module boundaries and required internal interfaces.
- Clarify async/event and persistence decisions.
- Update active planning context for F1.

## Out Of Scope

- Scaffolding `back/`, `front/`, Prisma, Docker, RabbitMQ, or any runtime
  dependency.
- Implementing auth or business workflows.
- Choosing the concrete exchange-rate provider and fallback policy.
- Commit, push, deploy, or external environment changes.

## Steps

1. Read current control-plane state, active plan, journal, product source, SRS,
   and existing architecture ADRs.
2. Create the modular monolith architecture ADR.
3. Update master/F1 planning records to reference the new ADR.
4. Update live indexes, task state, current/next summaries, and journal.
5. Create implementation, report, and closeout records.
6. Verify references and architecture terms are present.

## Progress

- 2026-07-06: Created and closed this documentation task in the same session
  because it codifies planning guidance and does not change product code.

## Decision Log

- 2026-07-06: Use a modular NestJS monolith with DDD-style internal layers,
  pragmatic CQRS, Prisma repositories, transactional outbox, RabbitMQ, and
  adapter interfaces for external/provider seams.
- 2026-07-06: Keep the active executable task as `NEXO-0007`; this task is a
  closed architecture hardening record that F1 must consume.

## Risks

- Over-abstracting early could slow F1 if every module creates speculative
  seams.
- Under-specifying module boundaries could lead to direct cross-table access
  and hard-to-extract modules later.
- RabbitMQ and Docker decisions will need infra/security/QA review when
  implemented.

## Verification

- Confirm the new ADR exists and contains the required decisions.
- Confirm `NEXO-0007` plan and handoff reference the new ADR.
- Confirm task index, README, state summaries, record index, journal, report,
  implementation record, and closeout are updated.
