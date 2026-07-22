# ADR-2026-07-07-db-backup-strategy

## Status

Accepted.

## Context

The Nexo backend uses **Neon Postgres** as its production database. Even on the
free tier, data loss must be avoided and recovery must be possible. There is no
existing automated backup. The control plane forbids committing real secrets, and
the operator wants a low-cost, scheduled, retention-bounded backup with failure
alerting.

Requirements:

- Daily automated logical backup of Neon DB.
- Store backups in durable, access-controlled object storage.
- Bound retention to 7 days to control storage cost.
- Alert if a backup fails.
- No credentials in the repo — only GitHub Actions secret references.

## Decision

Use a **GitHub Actions scheduled workflow** that performs a logical dump and
uploads it to **Azure Blob Storage**:

| Aspect | Choice |
|---|---|
| Schedule | Daily `cron: "0 6 * * *"` (06:00 UTC) + `workflow_dispatch` for manual runs |
| Dump tool | `pg_dump "$NEON_DATABASE_URL" \| gzip` (logical, compressed) |
| Destination | Azure Blob container `nexo-db-backups` via `azure/CLI@v2` |
| Auth | `AZURE_STORAGE_CONNECTION_STRING` (GitHub Actions secret only) |
| Source DB | `NEON_DATABASE_URL` (GitHub Actions secret only) |
| Retention | Blobs older than 7 days deleted by a prune step in the same workflow |
| Alerting | On failure, `actions/github-script@v7` opens a labeled issue (`backup`, `incident`, `ci`) |
| File naming | `nexo-backup-<UTC timestamp>.sql.gz` for unambiguous restore targeting |

The workflow file (`.github/workflows/nexo-db-backup.yml`) contains **only**
`${{ secrets.* }}` references — no literal connection strings, tokens, or
passwords. All secret values are placeholders in `infra/.env.example` and
`back/.env.example`.

Restore procedure is documented in `harness/control/runbooks/RUNBOOK-NEXO-0031-operations.md`
(download blob → `gunzip \| psql`).

## Consequences

- **Positive:** Hands-off daily backups with bounded 7-day cost.
- **Positive:** Failure is visible (GitHub issue) instead of silent.
- **Positive:** Secrets never touch source control.
- **Risk:** Logical `pg_dump` may grow with data volume; 7-day retention limits
  blast radius but also history depth — acceptable for Fase 1; extend retention
  or add weekly/monthly archives in Phase 2 if needed.
- **Risk:** The workflow needs network egress to Neon and Azure from GitHub
  runners — standard and expected.
- **Risk:** A single daily snapshot means up to ~24h of potential data loss —
  acceptable for Fase 1; Neon's own branching/PPITR can complement later.
- **Risk:** Restore requires manual operator action — documented and intentional.
