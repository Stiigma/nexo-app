# NEXO-0019 Implementation - Local PostgreSQL Docker

## Metadata

- Task ID: `NEXO-0019`
- Date: 2026-07-06
- Agent: Codex / `nexo-infra`
- Related plan:
  `harness/control/plans/NEXO-0019-local-postgres-docker.md`
- Related handoff: none
- Related report:
  `harness/control/reports/2026-07-06/NEXO-0019-local-postgres-docker-session-001.md`

## Summary

Added a local Docker PostgreSQL service for Nexo, configured the backend
`.env` and `.env.example` with the matching `DATABASE_URL`, added Prisma
database scripts, created the initial identity migration, and verified the
container and database schema.

## Files Changed

- `infra/docker-compose.yml`
- `infra/README.md`
- `back/.env`
- `back/.env.example`
- `back/README.md`
- `back/package.json`
- `back/prisma/migrations/20260706193000_init_identity/migration.sql`
- `harness/control/runbooks/NEXO-0019-local-postgres.md`
- `docs/adr/ADR-2026-07-06-local-postgresql-docker.md`

## Behavior Changed

- `docker compose -f infra/docker-compose.yml up -d nexo-postgres` starts a
  local PostgreSQL database named `nexo`.
- Backend Prisma reads `DATABASE_URL` from `back/.env`.
- `npm run db:validate` validates Prisma schema.
- `npm run db:deploy` applies checked-in migrations to the local database.

## Verification

- `docker compose -f infra/docker-compose.yml config` - passed.
- `cd back && npm run db:validate` - passed.
- `docker compose -f infra/docker-compose.yml up -d nexo-postgres` - passed.
- `docker compose -f infra/docker-compose.yml ps` - `nexo-postgres` healthy.
- `cd back && npm run db:deploy` - applied
  `20260706193000_init_identity`.
- `docker compose -f infra/docker-compose.yml exec -T nexo-postgres psql -U
  nexo_app -d nexo -c '\dt'` - showed `User` and `_prisma_migrations`.
- `cd back && npm run build` - passed.
- `cd back && npm run test` - passed, 3 files / 9 tests.
- `cd back && npm audit --audit-level=high` - passed, 0 vulnerabilities.
- `cd front && npm run test` - passed, 1 file / 4 tests.
- `cd front && npm run build` - passed.

## Operational Notes

- The local PostgreSQL container is running after this task.
- The password `nexo_dev_password_change_me` is a local development
  placeholder and must be replaced for any shared or production environment.
- `back/.env` is intentionally present because the user requested backend DB
  configuration; it is ignored by `back/.gitignore`.
- Use `docker compose -f infra/docker-compose.yml down -v` to remove local
  database data.

## Follow-Up

- Wire runtime Prisma repositories when the first feature needs persisted auth
  or catalog data.
- Add RabbitMQ and S3-compatible storage containers in separate scoped infra
  tasks when required.
