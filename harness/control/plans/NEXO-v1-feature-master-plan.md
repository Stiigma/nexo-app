# Nexo v1 Feature Master Plan

## Objective

Split Nexo v1 delivery into 12 vertical features with stable `NEXO-ID` tasks,
clear dependencies, acceptance criteria, verification expectations, and harness
records.

## Delivery Defaults

- Feature size: medium vertical slices.
- Delivery style: complete domain, schema, API, minimal UI, tests, and harness
  records per feature.
- Architecture baseline: NestJS modular monolith backend, PostgreSQL database,
  Prisma repositories, React PWA frontend, S3-compatible object storage for
  photos, transactional outbox, and RabbitMQ.
- Module style: vertical bounded-context modules with `domain`,
  `application`, `infrastructure`, and `interface` layers.
- API style: REST under `/api/v1`, documented with OpenAPI.
- Auth timing: introduce base auth and role checks early in F1.
- First business flow: purchase capture, because it unlocks inventory, cost,
  reservations, sales, QR labels, and reports.

## Feature Chain

| Feature | Task ID | Name | Depends on | Stories covered |
| --- | --- | --- | --- | --- |
| F0 | `NEXO-0006` | Architecture base and feature harness | None | Base technical setup |
| F1 | `NEXO-0007` | Auth and base permissions | F0 | US-011 |
| F2 | `NEXO-0008` | Operational catalogs | F1 | US-013 |
| F3 | `NEXO-0009` | Quick pre-payment purchase | F2 | US-001, US-002 |
| F4 | `NEXO-0010` | Payment confirmation and acquired inventory | F3 | US-003 |
| F5 | `NEXO-0011` | Minimum garment file and availability | F4 | US-017 |
| F6 | `NEXO-0012` | Inventory detail and search | F5 | US-009, US-015 |
| F7 | `NEXO-0013` | Customers and reservations | F5 | US-004, US-014, US-016 |
| F8 | `NEXO-0014` | MXN/USD sales | F6, F7 | US-005, US-006 |
| F9 | `NEXO-0015` | Expenses and real cost | F4 | US-007, US-008 |
| F10 | `NEXO-0016` | Operational reports | F6, F8, F9 | US-010 |
| F11 | `NEXO-0017` | QR labels | F6 | US-012 |

## Feature Contract

Each feature must declare:

- Business objective.
- Domain rules.
- Blocking dependencies.
- Expected backend, frontend, data, and infrastructure changes.
- Acceptance criteria linked to SRS requirements or user stories.
- Required tests.
- Risks and required QA/security reviews.

Each feature must create or update these records:

- `harness/control/tasks.md`: row with ID, status, priority, plan, latest
  report, closeout, and next step.
- `harness/control/plans/NEXO-00XX-feature-slug.md`: plan.
- `harness/control/handoffs/HOFF-YYYY-MM-DD-feature-slug.md`: handoff for
  `nexo-build`, `nexo-design`, `nexo-infra`, `nexo-security`, or `nexo-qa`
  when work moves across agent roles.
- `harness/control/implementations/NEXO-00XX-feature-slug.md`: implementation
  record when code, config, schema, or operational behavior changes.
- `harness/control/reports/YYYY-MM-DD/NEXO-00XX-feature-slug-session-001.md`:
  report for each meaningful session.
- `harness/control/closeouts/NEXO-00XX-feature-slug.md`: closeout once the
  feature is complete.

## Execution Rules

1. Use this master plan as the feature dependency map.
2. Use `templates/feature-plan.md` when drafting or updating feature plans.
3. Do not start a feature until dependencies have a closeout or an explicit
   handoff that allows safe parallel work.
4. Keep each feature independently verifiable from API, UI, tests, and harness
   evidence.
5. After each feature, update `state/CURRENT.md`, `state/NEXT.md`, `tasks.md`,
   the daily journal, reports, implementation records, and closeout.
6. Commit, push, deploy, and external environment changes still require
   explicit user confirmation.
7. Follow
   `docs/adr/ADR-2026-07-06-modular-monolith-ddd-cqrs-events.md` for module
   ownership, repository seams, event publication, and architecture tests.

## Verification Standard

Each feature should include, at minimum:

- Unit tests for domain rules and financial calculations touched by the slice.
- API or integration tests for endpoints, permissions, and persistence.
- UI workflow test or documented manual verification for the main flow.
- Harness report with commands, scenarios, gaps, and recommended next step.
- QA review before closeout when the feature touches critical UX, financial
  data, auth, storage, deploy, or migrations.

## Assumptions

- `NEXO-0006` is the first product-architecture task before durable scaffolding.
- The backend remains NestJS with PostgreSQL.
- Backend modules use Prisma only behind repository adapters.
- Commands use the transactional outbox for domain/integration events; a
  worker publishes to RabbitMQ.
- The frontend remains React PWA.
- S3-compatible object storage is the durable photo storage target.
- Auth is minimal in F1 but server-side role enforcement is non-negotiable.
- The purchase flow remains the first business workflow.
