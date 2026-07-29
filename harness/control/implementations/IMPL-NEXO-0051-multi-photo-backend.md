# IMPL-NEXO-0051 - Multi-Photo Backend Phases 1-4

## Scope

Implemented the governed backend slice for one-to-five private item photos:
domain policy, safe DTOs, media upload/delete facades, Prisma metadata
transactions, durable blob-deletion reconciliation, and four protected
inventory routes. Frontend phases 5-7 are intentionally not included.

## Architecture And Pattern Decision

- Architecture/technology: retain the existing modular monolith and
  Inventory-to-Media application seam because item-photo invariants and storage
  operations have distinct owners; no broker, service, or dependency was added.
- Pattern: Facade plus outbox-style cleanup record. `ItemPhotoService` invokes
  narrow Media capabilities while a transactionally created cleanup record
  recovers database/blob partial failure.
- Performance: upload processing is bounded to two concurrent files, multipart
  input is capped at five files/five MiB each, gallery reads use an ordered
  composite index, and cleanup sweeps process at most ten jobs every 30 seconds.

## Persistence

- Migration:
  `back/prisma/migrations/20260726190000_multi_photo_inventory/migration.sql`
- Adds unique storage keys, `(itemId, displayOrder)` lookup index, partial unique
  main-photo index, non-negative order check, anomaly preflight, a deferred
  one-to-five/exactly-one-main constraint trigger, and the indexed
  `item_photo_blob_deletions` retry table.
- The migration was authored and validated but not applied to any database.
  `prisma migrate dev` was intentionally not run because the governed handoff
  forbids applying an environment migration in this build session.

## Failure Semantics

- Upload validates remaining slots before storage work, processes at concurrency
  two, creates all metadata in one serializable transaction, and compensates
  every completed object when any upload or metadata commit fails.
- Failed compensation is transactionally queued when the database remains
  available.
- Delete rejects the last photo, promotes the next ordered photo when needed,
  compacts order, and creates the cleanup record in the same transaction.
- Immediate storage deletion produces `200/COMPLETED`; retryable cleanup produces
  `202/PENDING`. The worker claims with compare-and-set lease data and uses
  bounded exponential backoff through `FAILED_PERMANENT`.
- Inventory and mutation selects expose only photo ID, item ID, main flag,
  display order, and creation time. Protected reads remain
  `/api/v1/media/photos/:photoId/content`.

## Verification

- Governed inspect/build gate: allowed, no blockers.
- `pnpm --dir back db:validate`: pass.
- Focused item-photo suite: 34/34 pass.
- `pnpm --dir back test:unit`: 95/95 pass.
- Focused item-photo HTTP e2e: 9/9 pass.
- `pnpm --dir back test:e2e`: new suite passes, but the command fails because two
  pre-existing AppModule suites cannot authenticate to the configured local
  PostgreSQL instance; 9 passed and 17 were skipped by failed setup.
- `pnpm --dir back test`: 104 passed and 17 skipped; failed overall only on the
  same two database-authentication setup failures.
- `pnpm --dir back build`: pass.
- `graphify update .`: pass; SQL extraction warned that the optional
  `tree_sitter_sql` dependency is absent.

## Remaining Gates And Risks

- Rehearse and inspect the migration on a disposable/restored database after
  explicit environment authorization.
- Restore valid local test-database access and rerun the complete e2e/full test
  gates.
- NEXO-0050 lifecycle/revision invalidation has no product implementation to
  invoke yet; integrate through its future policy seam rather than duplicating
  rules here.
- Frontend phases 5-7, authenticated browser acceptance, QA review, and security
  review remain open.
- No commit, push, deploy, production migration, external configuration change,
  or non-fixture blob deletion was performed.
