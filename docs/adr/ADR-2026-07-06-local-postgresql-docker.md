# ADR-2026-07-06-local-postgresql-docker

## Status

Accepted.

## Context

Nexo now has durable backend scaffolding under `back/` with Prisma schema for
the identity module. Local development needs a reproducible PostgreSQL
database that matches the backend `DATABASE_URL` and can apply Prisma
migrations without relying on an external shared database.

## Decision

Use Docker Compose for local PostgreSQL development:

- Compose file: `infra/docker-compose.yml`.
- Service: `nexo-postgres`.
- Image: `postgres:16-alpine`.
- Database: `nexo`.
- User: `nexo_app`.
- Development placeholder password: `nexo_dev_password_change_me`.
- Published address: `127.0.0.1:5432`.
- Persistent storage: named Docker volume `nexo-local_nexo_postgres_data`.
- Backend local config: `back/.env` and `back/.env.example` use
  `DATABASE_URL=postgresql://nexo_app:nexo_dev_password_change_me@localhost:5432/nexo?schema=public`.
- Prisma migrations live under `back/prisma/migrations/` and are applied with
  `npm run db:deploy` or developed with `npm run db:migrate`.

## Consequences

- Local database setup is reproducible from the repo root with
  `docker compose -f infra/docker-compose.yml up -d nexo-postgres`.
- The database is only bound to localhost, reducing accidental LAN exposure.
- The placeholder password is acceptable only for local development and must
  not be reused for shared, staging, or production environments.
- PostgreSQL state persists across container restarts until the named volume is
  removed.
- Future persistent repository work can use the existing Prisma datasource and
  migration path.

## Alternatives Considered

- Install PostgreSQL directly on the host: rejected because it is less
  reproducible across agents and machines.
- Use an external hosted database for development: rejected because it would
  introduce external environment dependencies and real credential handling too
  early.
- Bind PostgreSQL on all interfaces: rejected because local development only
  needs localhost access.

## Verification

- `docker compose -f infra/docker-compose.yml config` validates the Compose
  file.
- `docker compose -f infra/docker-compose.yml up -d nexo-postgres` starts the
  local database.
- `docker compose -f infra/docker-compose.yml ps` shows `nexo-postgres`
  healthy.
- `cd back && npm run db:validate` validates the Prisma schema using
  `back/.env`.
- `cd back && npm run db:deploy` applies the identity migration.
- `docker compose -f infra/docker-compose.yml exec -T nexo-postgres psql -U
  nexo_app -d nexo -c '\dt'` shows `User` and `_prisma_migrations`.

## Related Records

- Task: `NEXO-0019`
- Runbook: `harness/control/runbooks/NEXO-0019-local-postgres.md`
- Implementation:
  `harness/control/implementations/NEXO-0019-local-postgres-docker.md`
- Report:
  `harness/control/reports/2026-07-06/NEXO-0019-local-postgres-docker-session-001.md`
