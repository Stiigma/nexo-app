# NEXO-0007 - Auth And Base Permissions

## Feature Metadata

- Feature: F1.
- Depends on: `NEXO-0006`.
- Primary agent: `nexo-build`.
- Required gates: QA review and security review before closeout.
- Linked stories: US-011.
- Linked SRS requirements: FR-AUTH-001, FR-AUTH-002, FR-AUTH-003,
  NFR-SEC-001, NFR-SEC-002.
- Architecture sources:
  `docs/adr/ADR-2026-07-06-product-architecture-stack.md` and
  `docs/adr/ADR-2026-07-06-modular-monolith-ddd-cqrs-events.md`.

## Business Objective

Create the minimum durable authentication and authorization foundation so
future operational workflows can be protected by Admin and Operator roles from
both UI and API access.

## Domain Rules

- Users have one role for v1: `Admin` or `Operator`.
- Admin can access catalogs, users, reports, corrections, and all inventory.
- Operator can capture purchases, batches, garments, reservations, sales, and
  operational inventory lookups.
- API permission checks are required even if the UI hides restricted actions.
- No real secrets may be committed; use placeholders and environment templates.

## Done When

- Backend has a minimal auth module and role guard/policy mechanism.
- Frontend can represent authenticated state enough to route Admin vs Operator
  workflows.
- Protected API requests reject insufficient roles.
- Tests cover Admin allowed, Operator allowed, and Operator denied paths.
- QA and security reviews are recorded before closeout.

## Scope

### Backend

- Scaffold or extend the durable NestJS backend enough to support auth under
  the `identity` module.
- Add user/role domain model and persistence shape.
- Add role guard or equivalent server-side permission boundary.
- Add seed or fixture strategy for local Admin and Operator users using
  placeholder credentials only.
- Keep local auth behind an `IdentityProvider` interface and Prisma behind
  repository adapters.

### Frontend

- Scaffold or extend the React PWA enough to represent login/session state.
- Add protected route behavior for Admin and Operator areas.
- Keep UI minimal; the goal is permission infrastructure, not polished admin
  workflows.

### Data

- Add initial user/role schema or migration plan.
- Avoid storing real credentials in source.

### Infrastructure

- Define required local env variables with placeholders.
- No deploy or external auth provider setup without explicit user approval.

## Out Of Scope

- Full user management UI beyond what is needed to prove roles.
- Catalog, purchase, inventory, sale, report, QR, or reservation workflows.
- Production deployment.
- Real secrets or external identity-provider configuration.

## Acceptance Criteria

- Given I am an admin, when I access protected admin endpoints, then access is
  allowed.
- Given I am an operator, when I access operator workflows, then access is
  allowed.
- Given I am an operator, when I access admin-only endpoints, then the API
  rejects the request.
- Given the UI knows my role, when I navigate, then admin-only screens are not
  exposed to operator users.

## Required Tests

- Unit: role policy/guard decisions.
- API/integration: protected endpoint allow/deny cases.
- UI/manual workflow: Admin and Operator route visibility.
- Regression: no unauthenticated access to protected API surface.

## Steps

1. Read the product stack ADR, modular monolith architecture ADR, and master
   feature plan.
2. Inspect existing product/prototype paths before choosing scaffold locations.
3. Create or update durable backend/frontend scaffolding only as needed for
   auth.
4. Implement minimal role enforcement.
5. Add tests and local verification commands.
6. Record implementation, report, QA review, security review, and closeout.

## Progress

- 2026-07-06: Created initial plan and handoff after F0 closeout.
- 2026-07-06: Added the modular monolith architecture ADR as a required source
  for F1 scaffolding.

## Decision Log

- 2026-07-06: F1 is the first executable product-code feature because later
  business workflows depend on server-side permission enforcement.
- 2026-07-06: F1 should establish the `identity` bounded-context module and
  reusable auth interfaces rather than a controller-only auth slice.

## Risks

- Choosing an auth mechanism prematurely could overcomplicate v1.
- Weak role checks would undermine all future admin/operator workflows.
- Environment examples could accidentally invite real secrets if not clearly
  templated.

## Verification

- F1 cannot close until tests, QA review, security review, implementation
  record, report, and closeout exist.
