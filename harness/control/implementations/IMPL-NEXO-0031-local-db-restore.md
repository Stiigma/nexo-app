# IMPL-NEXO-0031 — Reversible Local Database Restore

## Outcome

The verified logical backup `nexo-backup-20260726T041228Z.sql.gz` was restored
into a parallel PostgreSQL database and promoted locally by renaming databases.
The previous `nexo` database remains available as
`nexo_pre_restore_20260726`; the restored database now owns the canonical
`nexo` name used by the API.

## Operational Convention

- Restore into `nexo_restore_YYYYMMDD`; never delete the active database first.
- Use `psql -v ON_ERROR_STOP=1` and validate data, Prisma migration checksums,
  referential integrity, and external media objects before cutover.
- Stop only the API during the rename cutover; never remove the Docker volume.
- Keep `nexo_pre_restore_YYYYMMDD` until acceptance is complete.
- Treat deleting the rollback database as a separate destructive operation.

## Verification

- Backup gzip and uncompressed SQL matched; SQL SHA-256:
  `be43dcde9748072b8cb699d5036910a8427fc0d05dc1696c3ad8d2ad532cb820`.
- Active restored data: 78 items, 78 item photos, 32 brands, 22 colors, and 50
  exchange rates.
- All 9 applied Prisma migration names and checksums match the repository.
- All checked foreign-key relations have zero orphans and all constraints are
  validated.
- All 78 restored storage keys exist in the private Azure container.
- Authenticated local checks passed for profile, catalogs, inventory,
  statistics, facets, and an HTTPS protected-photo redirect.

## Rollback

Stop `nexo-api`, rename the restored database away from `nexo`, rename
`nexo_pre_restore_20260726` back to `nexo`, and restart the API.
