# NEXO-0019 - Local PostgreSQL Docker

## Objective

Provide a local Docker PostgreSQL database for Nexo backend development and
configure the backend `.env` with the matching `DATABASE_URL`.

## Done When

- Docker Compose defines a local `nexo-postgres` service.
- Backend `.env` and `.env.example` point to the local Nexo PostgreSQL
  database.
- Prisma has scripts and an initial migration for the identity schema.
- The local container starts, is healthy, and accepts the migration.
- Infra ADR, runbook, implementation record, QA review, security review,
  report, closeout, and live state are updated.

## Scope

- Local Docker Compose for PostgreSQL only.
- Backend local database configuration.
- Prisma migration path for the existing identity schema.
- Local runbook and verification evidence.

## Out Of Scope

- Production deployment.
- Kubernetes, CI/CD, hosted database, backups, and secret manager setup.
- RabbitMQ or S3-compatible storage containers.
- Switching the F1 runtime auth adapter from in-memory to Prisma.

## Steps

1. Read infra guardrails.
2. Add Compose PostgreSQL service under `infra/`.
3. Configure backend `.env` and `.env.example`.
4. Add Prisma database scripts and initial migration.
5. Validate Compose and Prisma.
6. Start the local container and apply migration.
7. Record ADR, runbook, implementation, QA/security reviews, report, and
   closeout.

## Progress

- 2026-07-06: Implemented local PostgreSQL Docker setup, backend `.env`
  configuration, and migration verification.

## Decision Log

- 2026-07-06: Use `postgres:16-alpine`, bind only to `127.0.0.1:5432`, and use
  a named Docker volume for local persistence.
- 2026-07-06: Use explicit development placeholder credentials and keep them
  out of any production assumptions.

## Risks

- Local placeholder credentials could be copied into shared environments if
  not clearly marked.
- Local Docker state may persist stale data until the volume is reset.

## Verification

- Docker Compose config validation.
- Docker healthcheck and container status.
- Prisma schema validation.
- Prisma migration deploy.
- PostgreSQL table check with `psql`.
- Backend build/test and frontend smoke test/build remain green.
