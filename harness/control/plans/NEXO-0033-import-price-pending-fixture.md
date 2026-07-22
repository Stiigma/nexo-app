# NEXO-0033 - Import Price-Pending Fixture To DB With Catalogs And WebP Photos

## Objective

Implement the next step after `NEXO-0032`: import the prepared 39-item fixture into the database with enriched catalog values, real `PRICE_PENDING` support, nullable unknown costs, and optimized WebP photos uploaded to storage.

## Done When

- The app supports real `PRICE_PENDING` across Prisma/Postgres, backend domain/API, facets/stats, and frontend status rendering.
- `Item.costAmount` can be `null` so unknown costs are not stored as `0`.
- A fixture-local `catalog-enrichment.json` exists and maps fixture values to DB catalog names.
- An idempotent import script can dry-run and execute the `manual-stock-2026-07-08-price-pending` fixture.
- The execute path optimizes photos to WebP before upload and stores final URLs in `ItemPhoto`.
- Import execution is gated behind explicit user confirmation and an explicit `--execute` flag.

## Scope

- Register and implement DB/schema/API/frontend support required by the new fixture.
- Generate/use a JSON catalog enrichment mapping from current DB catalog state plus fixture needs.
- Create an import script for this fixture family.
- Upload optimized photos through the existing media storage/Sharp infrastructure.
- Record implementation, report, and closeout when executed.

## Out Of Scope

- Running the real DB/storage import without explicit user confirmation.
- Inventing missing purchase costs or sale prices.
- Reworking the broader catalog UX beyond what is required to show enriched imported items.
- Commit, push, deploy, DNS, or external infrastructure changes.

## Decisions Already Made

- Use JSON, not YAML, for the enrichment file to avoid a new parser dependency.
- Use `PRICE_PENDING` as the durable status. Transition should allow `PRICE_PENDING -> AVAILABLE` after sale price capture.
- Use `Sin marca` for fixture items with unclear brand.
- Make `costAmount` nullable and keep missing costs as `null`; never use `0` as a placeholder.
- Create precise simple categories when missing: `Gorra`, `Jersey`, `Tenis`, `Shorts`, `Sudadera`, `Ropa`.
- Optimize images before upload. Do not upload JPEG first and post-process for this fixture.

## Current Facts From Planning

- Current DB has 17 items and 17 item photos.
- Current DB `ItemStatus` enum values are `ACQUIRED_STOCK`, `AVAILABLE`, `RESERVED`, `SOLD`, `RETURNED`; `PRICE_PENDING` is missing.
- Current Prisma `Item.costAmount` is required, but `NEXO-0032` has 10 items with unknown cost.
- Current DB catalog includes some existing manual values and some invalid empty names; the import should not map unknown brand/category to empty strings.
- Existing legacy script `prisma/seed-inventory-fixture.ts` points to the old fixture and currently falls back unknown cost to `0`; do not reuse that behavior.
- Existing `scripts/optimize-existing-photos.mjs` is for photos already in DB/storage; this new import should use the Sharp pipeline before upload.

## Execution Record — 2026-07-15

- The local migration `20260715193000_price_pending_nullable_cost` was applied after explicit user authorization.
- The explicitly authorized `--execute` run created 39 items, updated none, and linked 39 WebP main photos in the configured Azure storage account.
- Post-import data verification found 56 total items; the fixture range has 39 `PRICE_PENDING` items, 39 null target/minimum prices, 10 null costs, zero zero-cost substitutions, and 39 main-photo paths at `items/{itemId}/main.webp`.
- The UI check reached the login page but could not proceed without an authenticated local session. This is the remaining acceptance check.

## Catalog Enrichment Requirements

Create `../harness/fixtures/inventory/manual-stock-2026-07-08-price-pending/catalog-enrichment.json` with:

- `fixture_id`: `manual-stock-2026-07-08-price-pending`.
- `generated_from_db_at`: ISO timestamp when generated.
- `catalog_snapshot`: active DB values for statuses, brands, categories, sizes, conditions, and colors.
- `mappings`:
  - `status.price_pending = PRICE_PENDING`
  - `condition.used = Usado`
  - `brand.__missing = Sin marca`
  - `brand.Mitchell and Ness = Mitchell & Ness`
  - category mappings for all fixture category keys.
  - size mappings including numeric values stringified and `7 Mujer -> 7 mujer`.
  - color mappings including `burgundy -> Guinda`, `cream -> Crema`, and `orange and purple -> Estampado`.
- `upserts`: explicit catalog records the import may create before items.

## Implementation Steps

1. Register task state and follow this plan with `nexo-build`; route storage/security concerns through `nexo-infra`/`nexo-security` only if secrets or production storage behavior changes.
2. Add Prisma migration for `PRICE_PENDING` and nullable `Item.costAmount`.
3. Update backend domain enum, transition rules, DTOs, repository labels, stats aggregation, and tests.
4. Update frontend inventory types, status badge/filter options, cards, detail modal, and financial display for `PRICE_PENDING` and nullable costs.
5. Create `catalog-enrichment.json` generator or static artifact based on DB snapshot plus fixture values.
6. Create `back/scripts/import-inventory-fixture.ts` with default dry-run and explicit `--execute` mutation mode.
7. In dry-run: validate 39 manifest entries, photos, mappings, required catalog upserts, nullable costs, and expected operations.
8. In execute: upsert catalogs, upsert items by `internalCode`, optimize each image to WebP through `SharpImageProcessorAdapter`, upload to `items/{itemId}/main.webp`, and upsert main `ItemPhoto` URL.
9. Add package script such as `db:import:inventory-fixture` if it fits existing backend scripts.
10. Record implementation report, implementation record, and closeout only after verified execution or verified dry-run, depending on actual scope run.

## Verification

- `npm run db:validate` in `../back`.
- Backend unit/e2e tests for status enum, transitions, facets/stats labels, nullable cost, and import dry-run.
- Frontend tests or typecheck for `PRICE_PENDING` and nullable cost UI.
- Dry-run command must complete without writes and report 39 planned item upserts, 39 planned photo uploads, 10 nullable costs, and required catalog upserts.
- Execute command must be run only after explicit user approval.
- After execute: DB has 56 total items, `NX-0018` through `NX-0056` exist with `PRICE_PENDING`, 39 new main photos point to `.webp`, and no new unknown-cost item has `costAmount = 0`.

## Risks

- Postgres enum changes require a real migration and careful local/prod sequencing.
- Nullable costs affect stats and financial UI; aggregations must keep treating null as unknown, not zero.
- SAS URLs expire; future work may need a URL refresh strategy, but this task should preserve the existing storage pattern.
- Current DB has invalid empty catalog names; import logic should avoid relying on those and may leave cleanup for a separate task.

## Handoff Target

- Primary receiving agent: `nexo-build`.
- Use handoff `handoffs/HOFF-2026-07-08-import-price-pending-fixture.md` for first implementation run.
