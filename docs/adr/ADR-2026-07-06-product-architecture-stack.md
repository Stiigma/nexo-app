# ADR-2026-07-06-product-architecture-stack

## Status

Accepted.

## Context

Nexo v1 needs a durable product architecture separate from the disposable
purchase-capture prototype. The SRS names the target architecture as React PWA,
NestJS, PostgreSQL, and S3-compatible object storage. Future work will deliver
vertical features with domain logic, API, UI, schema, tests, and harness
records.

## Decision

Use this baseline for durable Nexo v1 product development:

- Backend: NestJS.
- Database: PostgreSQL.
- Frontend: React PWA.
- Photo storage: S3-compatible object storage.
- Report currency: MXN.
- Binary photos stay out of PostgreSQL; PostgreSQL stores metadata,
  relationships, and object references.
- Auth and role checks are introduced before business features, with
  server-side permission enforcement required for protected operations.

## Consequences

- Durable code should be scaffolded under product paths, not under the
  disposable prototype.
- Feature handoffs must account for schema, API contracts, UI workflows, and
  tests.
- Storage, deploy, and secret handling require infra/security review before
  closeout when implemented.
- Prototype SQLite tables remain learning artifacts and must not be treated as
  the final PostgreSQL schema.

## Alternatives Considered

- Continue from the disposable React + SQLite WASM prototype: useful for demo
  learning, but not suitable as the durable backend/data architecture.
- Build a backend later after a frontend-only app: faster first screens, but it
  would defer role enforcement and persistence boundaries too long.
- Store photos in PostgreSQL: rejected because the SRS requires object storage
  references, not binary photo storage in the database.

## Verification

- Future feature plans reference this ADR for stack assumptions.
- F1 starts with auth and permission boundaries before purchase implementation.
- Any storage, CI/CD, deployment, or secrets work receives required review
  before closeout.

## Related Records

- Task: `NEXO-0006`
- Plan: `harness/control/plans/NEXO-0006-architecture-base-feature-harness.md`
- Master plan: `harness/control/plans/NEXO-v1-feature-master-plan.md`
- Report:
  `harness/control/reports/2026-07-06/NEXO-0006-architecture-base-feature-harness-session-001.md`
