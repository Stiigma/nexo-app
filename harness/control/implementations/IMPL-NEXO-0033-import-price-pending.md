# IMPL-NEXO-0033 — Import Price-Pending Fixture

## Metadata

- **Task:** NEXO-0033
- **Date:** 2026-07-15
- **Agent:** nexo-build
- **Plan:** `plans/NEXO-0033-import-price-pending-fixture.md`
- **Handoff:** `handoffs/HOFF-2026-07-08-import-price-pending-fixture.md`

## Implemented behavior

- Prisma `ItemStatus` now declares `PRICE_PENDING` first and `Item.costAmount` is nullable.
- Migration `20260715193000_price_pending_nullable_cost` adds the enum value before `ACQUIRED_STOCK` and drops the cost `NOT NULL` constraint.
- Domain transitions include `ACQUIRED_STOCK -> PRICE_PENDING` and `PRICE_PENDING -> AVAILABLE`; moving to `AVAILABLE` requires a positive finite target price.
- Inventory listing orders by enum status first, then requested secondary order (or `createdAt`), then `internalCode`, all before pagination.
- Stats expose localized status labels, including `Falta precio`, and financial aggregates continue to ignore nullable values.
- Frontend cards, filters, dashboard counts, status badge, detail financial table, and accessible visual treatment support pending prices/costs without rendering `$0.00` placeholders.
- Fixture enrichment preserves `Sin marca`, `Mitchell & Ness`, precise categories, sizes, and colors in `catalog-enrichment.json`.
- `scripts/import-inventory-fixture.ts` validates the 39-item fixture by default, processes all photos to WebP in memory, and mutates only with explicit `--execute`. Item upserts use `internalCode`; main photos use `items/{itemId}/main.webp` and are updated rather than duplicated on rerun.

## Verification

- `pnpm db:validate` — passed.
- `pnpm prisma migrate deploy` — applied `20260715193000_price_pending_nullable_cost` to the local database after explicit authorization.
- `pnpm prisma migrate status` — database schema is up to date after the migration.
- Backend `pnpm test:unit` — 12 files, 57 tests passed.
- Backend `pnpm build` — passed.
- Frontend `pnpm build` — passed; only the existing chunk-size warning remains.
- Script typecheck — passed with an explicit no-emit TypeScript invocation.
- Dry-run — passed: 39 item upserts, 39 WebP photos, 39 null sale prices, 10 null costs; no BD/storage writes.
- Read-only local DB check after dry-run — 17 items, 17 photos, 0 zero-cost rows.
- Authorized execute — passed: 39 created, 0 updated, 39 WebP photos linked to Azure Blob Storage.
- Post-import data check — 56 total items; fixture range contains 39 `PRICE_PENDING` items, 39 null target/minimum prices, 10 null costs, no zero costs, and 39 `items/{itemId}/main.webp` main-photo paths.
- Browser smoke check reached the login screen; no credentials were entered. Full `/admin/inventory` visual verification requires the authorized migration/import and authenticated session.

## Execution gate

The schema migration and authorized `--execute` import have completed. The local database now has 56 items, including 39 `PRICE_PENDING` fixture items with 39 Azure WebP main photos. Authenticated visual QA remains open. The storage adapter persists read-only SAS URLs whose expiry is configured at seven days by default; that existing storage-pattern risk is documented in `security/NEXO-0033-price-pending-import.md` and must be accepted or mitigated before closeout.
