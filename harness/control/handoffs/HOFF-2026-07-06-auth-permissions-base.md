# HOFF-2026-07-06-auth-permissions-base

## Metadata

- Task ID: `NEXO-0007`
- Date: 2026-07-06
- Authoring agent: `nexo-plan`
- Receiving agent: `nexo-build`
- Status: ready

## Objective

Implement F1, the minimum durable auth and permissions foundation for Nexo v1,
covering Admin and Operator roles with server-side enforcement.

## Context

F0 closed the architecture and harness setup. Durable product development now
uses NestJS, PostgreSQL, React PWA, and S3-compatible object storage as recorded
in `docs/adr/ADR-2026-07-06-product-architecture-stack.md`. `NEXO-0018` then
accepted the modular monolith architecture in
`docs/adr/ADR-2026-07-06-modular-monolith-ddd-cqrs-events.md`: DDD-style
module layers, pragmatic CQRS, Prisma repositories, transactional outbox,
RabbitMQ, and adapter interfaces. F1 should establish auth before business
workflows so later purchase, inventory, catalog, sale, and report features
inherit protected boundaries.

## Source Docs

- `harness/control/plans/NEXO-v1-feature-master-plan.md`
- `harness/control/plans/NEXO-0007-auth-permissions-base.md`
- `docs/adr/ADR-2026-07-06-product-architecture-stack.md`
- `docs/adr/ADR-2026-07-06-modular-monolith-ddd-cqrs-events.md`
- `docs/spec/SRS.md`
- `docs/spec/user-stories.md`
- `CONTEXT.md`

## Files To Create Or Modify

- Product backend path, expected `back/`, if not already scaffolded.
- Product frontend path, expected `front/`, if not already scaffolded.
- Local environment examples with placeholders only.
- Harness implementation/report/review/closeout records for `NEXO-0007`.

## Implementation Steps

1. Inspect existing repo paths before scaffolding.
2. Choose the smallest auth mechanism that proves Admin/Operator role
   boundaries and can evolve later.
3. Add an `identity` module with domain, application, infrastructure, and
   interface layers where the initial auth scope needs them.
4. Add backend role model, guard/policy checks, and protected test endpoints or
   first real protected routes.
5. Keep auth behind an `IdentityProvider` interface and persistence behind
   repository adapters.
6. Add frontend session/role representation and protected route behavior.
7. Add local placeholder env documentation without real secrets.
8. Add unit, API/integration, and UI/manual verification.
9. Create implementation record, report, QA review, security review, and
   closeout.

## Verification

- Unit tests cover role policy decisions.
- API/integration tests prove unauthenticated rejection, Admin allowed,
  Operator allowed for operator scope, and Operator denied for admin scope.
- UI workflow or manual verification shows Admin and Operator navigation
  behavior.
- Security review confirms no real secrets and server-side role checks exist.
- Architecture verification confirms `identity/domain` does not import NestJS,
  Prisma, HTTP, RabbitMQ, S3, or provider SDKs.

## Risks

- Auth scaffolding may become too broad if it attempts full user management in
  F1.
- Frontend-only gating is insufficient; API checks are mandatory.
- Any external auth provider, deploy, or secret manager work requires explicit
  user confirmation.

## Acceptance Criteria

- US-011 acceptance criteria are satisfied for the minimal product shell.
- FR-AUTH-001, FR-AUTH-002, and FR-AUTH-003 are traceable to tests or manual
  verification.
- F2 can safely build admin-only catalog management on top of F1.

## Required Gates

- QA review: required before closeout.
- Security review: required before closeout.
- User confirmation: required before commit, push, deploy, external auth
  provider setup, or external environment changes.
