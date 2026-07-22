# NEXO-0018 Implementation - Modular Monolith Architecture

## Metadata

- Task ID: `NEXO-0018`
- Date: 2026-07-06
- Agent: Codex / `nexo-plan`
- Related plan:
  `harness/control/plans/NEXO-0018-modular-monolith-architecture.md`
- Related handoff: none
- Related report:
  `harness/control/reports/2026-07-06/NEXO-0018-modular-monolith-architecture-session-001.md`

## Summary

The architecture recommendation has been promoted into durable project state.
Nexo v1 now has an accepted ADR for a modular NestJS monolith with DDD-style
module layers, pragmatic CQRS, PostgreSQL/Prisma behind repositories,
transactional outbox, RabbitMQ publication, adapter interfaces, and simple
Docker-first deployment assumptions.

## Files Changed

- `docs/adr/ADR-2026-07-06-modular-monolith-ddd-cqrs-events.md`
- `harness/control/plans/NEXO-0018-modular-monolith-architecture.md`
- `harness/control/plans/NEXO-v1-feature-master-plan.md`
- `harness/control/plans/NEXO-0007-auth-permissions-base.md`
- `harness/control/handoffs/HOFF-2026-07-06-auth-permissions-base.md`
- `harness/control/tasks.md`
- `harness/control/README.md`
- `harness/control/state/CURRENT.md`
- `harness/control/state/NEXT.md`
- `harness/control/indexes/records.md`
- `harness/control/journal/2026-07-06.md`
- `harness/control/reports/2026-07-06/NEXO-0018-modular-monolith-architecture-session-001.md`
- `harness/control/closeouts/NEXO-0018-modular-monolith-architecture.md`

## Behavior Changed

- No runtime behavior changed.
- Future product scaffolding now has a documented architecture contract:
  module ownership, internal layers, repository seams, event/outbox rules,
  RabbitMQ publication, and architecture-test expectations.
- F1 auth work must consume the new architecture ADR when creating the
  `identity` module and auth interfaces.

## Verification

- Read current control-plane workflow, active task, journal, product source,
  SRS, existing ADRs, and F1 handoff before editing.
- Verified no `back/` or `front/` durable product scaffold exists yet.
- Verified the new ADR records all decisions from the supplied architecture
  plan.
- Verified live task and state records point future work back to the ADR.

## Operational Notes

- RabbitMQ is accepted as a v1 dependency at the architecture level, but no
  queue, Docker, environment, or deploy configuration was created in this
  session.
- Kubernetes remains explicitly out of scope until a separate infra task gives
  an operational reason.
- Exchange-rate provider selection remains a later ADR even though the
  `ExchangeRateProvider` interface is now required.

## Follow-Up

- Resume `NEXO-0007` using both
  `harness/control/handoffs/HOFF-2026-07-06-auth-permissions-base.md` and
  `docs/adr/ADR-2026-07-06-modular-monolith-ddd-cqrs-events.md`.
