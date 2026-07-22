# NEXO-0007 QA Review - Auth And Base Permissions

## Metadata

- Task ID: `NEXO-0007`
- Date: 2026-07-06
- QA agent: Codex / `nexo-qa`
- Reviewed artifact:
  `harness/control/implementations/NEXO-0007-auth-permissions-base.md`
- Decision: pass

## Scope

Reviewed the F1 auth and base permissions implementation for requirements
coverage, acceptance criteria, automated verification, UI readiness, data
integrity, and closeout readiness.

## Requirements Coverage

- FR-AUTH-001: covered by backend `UserRole` domain model, seed role handling,
  and frontend role session model.
- FR-AUTH-002: covered by Admin permission policy and admin protected endpoint.
- FR-AUTH-003: covered by Operator permission policy and operator protected
  endpoint.
- NFR-SEC-002: covered by backend guards and API tests proving server-side
  allow/deny behavior.

## Acceptance Criteria

- Admin access to admin endpoints: passed in backend API test.
- Operator access to operator workflows: passed in backend API test.
- Operator denied from admin endpoint: passed in backend API test.
- UI hides admin-only screens for Operator users: passed in frontend access
  tests.

## UX And Accessibility

- F1 UI is intentionally minimal.
- Navigation is keyboard reachable through native buttons.
- Admin/Operator session controls and route output are visible in the shell.
- Polished admin/catalog workflows are out of scope for F1.

## Automated Tests

- `cd back && npm run test`: passed, 3 files / 9 tests.
- `cd front && npm run test`: passed, 1 file / 4 tests.

## Manual Verification

- `cd back && npm run build`: passed.
- `cd front && npm run build`: passed.
- OpenAPI setup is present in `back/src/main.ts` under `/api/v1/docs`.

## Data Integrity

- Prisma schema defines user ID, unique email, password hash, role, active
  flag, and timestamps.
- No migration was applied and no external database was changed.
- Runtime in F1 uses env-seeded in-memory users; persistent database wiring is
  deferred until local PostgreSQL infrastructure exists.

## Security Handoff

- Security review completed at
  `harness/control/security/NEXO-0007-auth-permissions-base.md`.

## Release Readiness

- Ready to close for F1 scope.
- Not production deploy-ready because production deployment, HTTPS enforcement,
  persistent auth storage, and external environment setup are out of scope.

## Findings

- No blocking QA findings.

## Required Follow-Up

- Expand F2 operational catalogs and reuse F1 guards for Admin-only catalog
  mutation.
- Add persistent Prisma runtime wiring with the local database slice.
