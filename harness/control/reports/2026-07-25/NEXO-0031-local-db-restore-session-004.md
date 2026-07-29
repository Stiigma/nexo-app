# NEXO-0031 Local Database Restore — Session 004

## Metadata

- Date: 2026-07-25
- Agent: nexo
- Task: NEXO-0031
- Status: local restore accepted; task remains active

## Outcome

Restored `backups/nexo-backup-20260726T041228Z.sql.gz` into a parallel local
PostgreSQL database, validated it, and promoted it through a reversible database
rename. The API now uses the restored `nexo` database. The previous 56-item
database remains intact as `nexo_pre_restore_20260726`.

## Verification

- Gzip integrity, compressed/uncompressed equivalence, and expected SQL checksum
  passed.
- Restore ran with `ON_ERROR_STOP=1` and completed all schema, data, index, and
  constraint statements.
- Active database: 78 items, 78 photos, 32 brands, 22 colors, 50 exchange
  rates, 2 users, and 9 applied migrations.
- All nine Prisma migration checksums match the repository migration files.
- Corrected null-aware integrity queries found zero orphaned relations; all
  constraints are validated and every item has a photo.
- Azure read-only listing matched all 78 restored photo keys; none are missing.
- API startup passed. Authenticated checks returned success for profile,
  brands, colors, inventory, statistics, and facets; protected media returned
  an HTTPS redirect. Unauthenticated catalog access correctly returned 401.

## Notes

- The production image omits the Prisma 6 CLI. An attempted `npx prisma migrate
  status` selected Prisma 7 and was rejected as incompatible; migration
  correctness was therefore verified directly by exact database/file
  checksums.
- The API healthcheck can eventually become unhealthy because it repeatedly
  calls the rate-limited `check-email` endpoint and receives 429 responses.
  This behavior existed before the restore and is outside this data operation.
- No seed, migration, commit, push, Neon change, or database deletion was
  performed.

## Repository Records

- Updated the NEXO-0031 plan, runbook, task row, and live state.
- Added `implementations/IMPL-NEXO-0031-local-db-restore.md`.

## Recommended Next Step

Perform hosted authenticated acceptance through Vercel/ngrok. Keep
`nexo_pre_restore_20260726` until the user confirms the restored data is
accepted; clean it up only as a separately authorized destructive operation.
