# NEXO-0006 - Architecture Base And Feature Harness

## Feature Metadata

- Feature: F0.
- Depends on: none.
- Primary agent: `nexo-plan`.
- Required gates: none for documentation-only setup.
- Linked stories: none.
- Linked SRS requirements: CON-001, CON-002, CON-003, CON-004, CON-005,
  DR-003, NFR-MAINT-001.

## Business Objective

Create the durable architecture and harness foundation needed to implement Nexo
v1 feature by feature without losing traceability or mixing disposable
prototype decisions with product architecture.

## Domain Rules

- The disposable prototype remains separate from durable product code.
- Product architecture starts from NestJS, PostgreSQL, React PWA, and
  S3-compatible storage.
- Each future feature must be independently verifiable and linked to SRS/user
  story coverage.

## Done When

- A master v1 feature plan exists under `harness/control/plans/`.
- `NEXO-0006` is registered and closed as F0.
- The backend/product architecture ADR is recorded.
- A reusable feature plan template exists.
- The next feature, F1 auth and permissions, has a task, plan, and build
  handoff.
- Live state, journal, report, implementation record, and closeout are updated.

## Scope

- Create the feature chain and dependency map.
- Assign `NEXO-ID` values to F0-F11.
- Record the target product stack in an ADR.
- Create reusable feature planning structure.
- Prepare F1 for execution.

## Out Of Scope

- Scaffolding `back/`, `front/`, database migrations, or object storage.
- Implementing auth.
- Changing SRS requirements.
- Commit, push, deploy, or external environment changes.

## Steps

1. Read the current control-plane state, active task, journal, SRS, and user
   stories.
2. Create the v1 feature master plan.
3. Add feature task rows for F0-F11.
4. Record the durable architecture stack ADR.
5. Add a reusable feature plan template.
6. Create the F1 plan and handoff.
7. Update live state, journal, report, implementation record, and closeout.

## Progress

- 2026-07-06: Created the master feature plan, feature template, F0 records,
  product architecture ADR, and F1 startup artifacts.

## Decision Log

- 2026-07-06: Use `NEXO-0006` through `NEXO-0017` for F0-F11.
- 2026-07-06: Close F0 in the same session because it is a harness and
  architecture documentation task, not product-code implementation.
- 2026-07-06: Make F1 the next active executable feature after F0 closeout.

## Risks

- Starting product code before F1 auth boundaries are clear could require
  rework.
- Existing `NEXO-0002` domain work still has open questions; future features
  must treat unresolved SRS questions as feature risks instead of silently
  deciding them.

## Verification

- Confirm all F0 expected records exist.
- Confirm task index references F0-F11 with stable IDs.
- Confirm F1 has a plan and handoff suitable for `nexo-build`.
