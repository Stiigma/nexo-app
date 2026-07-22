# NEXO-0007 Implementation - Auth And Base Permissions

## Metadata

- Task ID: `NEXO-0007`
- Date: 2026-07-06
- Agent: Codex / `nexo-build`
- Related plan:
  `harness/control/plans/NEXO-0007-auth-permissions-base.md`
- Related handoff:
  `harness/control/handoffs/HOFF-2026-07-06-auth-permissions-base.md`
- Related report:
  `harness/control/reports/2026-07-06/NEXO-0007-auth-permissions-base-session-001.md`

## Summary

Implemented the first durable product scaffolding for Nexo v1. The backend now
has a NestJS `identity` module with Admin/Operator role rules, local auth behind
an `IdentityProvider` interface, server-side guards, protected REST probes under
`/api/v1/auth`, Prisma schema/repository shape, placeholder environment
configuration, and tests. The frontend now has a minimal React PWA shell with
role session representation, protected route decisions, and Admin/Operator
navigation filtering.

## Files Changed

- `back/`
  - NestJS app shell, OpenAPI setup, package config, TypeScript config,
    `.env.example`, `.gitignore`, and README.
  - `prisma/schema.prisma` with initial `User` and `UserRole` persistence
    shape.
  - `src/modules/identity/` domain, application ports, local identity provider,
    repositories, seed helpers, token/password security adapters, HTTP
    controller, guards, decorators, and tests.
  - `src/architecture/domain-imports.spec.ts`.
- `front/`
  - React/Vite PWA shell, package config, TypeScript config, manifest,
    `.env.example`, `.gitignore`, and README.
  - Role access model, protected route, minimal app shell, styles, and tests.

## Behavior Changed

- Backend can issue local HMAC-signed sessions for seeded Admin and Operator
  users.
- Backend rejects unauthenticated protected requests.
- Backend allows Admin access to admin and operator probes.
- Backend allows Operator access to operator probes.
- Backend rejects Operator access to admin probes.
- Frontend can represent Admin/Operator session state and hide admin-only
  navigation from Operator users.
- Architecture test blocks forbidden infrastructure/framework imports in
  `identity/domain`.

## Verification

- `cd back && npm run build` - passed.
- `cd back && npm run test` - passed, 3 files / 9 tests. Required escalated
  execution because Supertest binds a local ephemeral port.
- `cd back && npm audit --audit-level=high` - passed, 0 vulnerabilities.
- `cd back && npm audit --omit=dev --audit-level=high` - passed, 0
  vulnerabilities.
- `cd front && npm run test` - passed, 1 file / 4 tests.
- `cd front && npm run build` - passed.
- `cd front && npm audit --audit-level=high` - passed, 0 vulnerabilities.

## Operational Notes

- Dependency installation required registry access through approved
  `npm install`.
- `back/package.json` uses an override for `multer@2.2.0` because npm audit
  reported a high-severity vulnerable transitive `multer` range through
  `@nestjs/platform-express`.
- Runtime user seeding uses environment-provided placeholder emails and
  password hashes only. No real secrets were written.
- The runtime repository provider uses an in-memory adapter for F1. A
  Prisma-shaped repository and schema exist so PostgreSQL wiring can be added
  when local database infrastructure is introduced.
- `back/dist`, `front/dist`, `back/node_modules`, and `front/node_modules`
  exist locally from verification and are ignored by workspace `.gitignore`
  files.

## Follow-Up

- Expand `NEXO-0008` operational catalogs using the new auth guards for
  admin-only catalog mutation.
- Add persistent Prisma module wiring when local PostgreSQL infrastructure is
  introduced.
