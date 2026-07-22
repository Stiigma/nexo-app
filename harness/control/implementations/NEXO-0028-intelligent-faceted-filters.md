# NEXO-0028 — Intelligent Faceted Filters Implementation

## Date

2026-07-07

## Handoff

`harness/control/handoffs/HOFF-2026-07-07-intelligent-faceted-filters.md`

## Summary

Replaced the catalog-driven filter system (`useCatalogOptions` fetching all
catalog entries) with a **faceted search** system backed by a new endpoint
`GET /api/v1/inventory/items/facets`. Filters now show only options that
have real inventory items, with visible counts, and cross-filter
recalculation.

## Files Created

| File | Purpose |
|---|---|
| `back/src/modules/inventory/application/facet-counts.interface.ts` | `FacetOption` + `FacetCounts` return types |
| `back/src/modules/inventory/interface/http/dto/facet-query.dto.ts` | DTO for `GET /facets` (no pagination, same filters + search) |
| `back/src/modules/inventory/application/__tests__/item.service-facets.spec.ts` | 3 unit tests for `ItemService.getFacets` |
| `front/src/features/inventory/hooks/use-faceted-filters.ts` | TanStack Query hook consuming `GET /facets` |

## Files Modified

| File | Change |
|---|---|
| `back/src/modules/inventory/application/ports/inventory-repository.ts` | Added `search` to `ItemFilters`, added `findFacets(filters): Promise<FacetCounts>` to `InventoryRepository` interface |
| `back/src/modules/inventory/infrastructure/repositories/prisma-inventory.repository.ts` | Implemented `findFacets` with parallel Prisma `groupBy` queries per dimension (status, brandId, categoryId, sizeId, conditionId, colorId), batch FK name resolution via `resolveCatalogNames`, and `buildFacetWhere` supporting exact matches + search (contains on productName/internalCode) |
| `back/src/modules/inventory/application/item.service.ts` | Added `getFacets(filters): Promise<FacetCounts>` delegating to repository |
| `back/src/modules/inventory/interface/http/items.controller.ts` | Added `@Get("facets")` endpoint **before** `@Get(":id")` to prevent route conflict, guarded by `PermissionGuard` with `OperatorWorkspace` |
| `front/src/features/inventory/types/item.ts` | Added `FacetOption`, `FacetCounts` types; added `conditionId`, `colorId` to `InventoryFilters` |
| `front/src/features/inventory/store/inventory-ui.store.ts` | Added `conditionId`, `colorId` to state and initial values |
| `front/src/features/inventory/hooks/use-inventory-list.ts` | Added `conditionId`, `colorId` to `buildParams` |
| `front/src/features/inventory/components/FilterBar.tsx` | **Rewritten**: consumes `useFacetedFilters(filters)` for dropdown options with counts; keeps `useCatalogOptions` only for computing "Sin inventario" section (zero-count catalog entries collapsed with `<details>/<summary>`); accepts `filters: InventoryFilters` prop |
| `front/src/features/inventory/views/InventoryPage.tsx` | Updated to pass `filters` object to `FilterBar`; destructures `conditionId`/`colorId` from store |

## Architecture Decisions

1. **Prisma `groupBy` + batch name resolution**: Each dimension uses a
   separate `groupBy` query, then names are resolved in parallel via
   `findMany({ where: { id: { in } } })`. For the current scale (17 items),
   this is perfectly efficient. If scaling to 10K+ items, migrate to
   `$queryRaw` with JOINs.

2. **Search handling in facets**: When `search` is present, the `where`
   clause includes `OR` with `contains` on both `productName` and
   `internalCode` (case-insensitive).

3. **Null-safe optional FKs**: `sizeId` and `colorId` groupBy queries filter
   out `null` values with `{ not: null }` to avoid grouping nulls.

4. **"Sin inventario" section**: Uses catalog reference data (retained from
   `useCatalogOptions`) to compute which catalog entries are absent from
   current facet results. These are rendered collapsed via native
   `<details>/<summary>` with `line-through` styling.

5. **Route ordering**: `@Get("facets")` placed before `@Get(":id")` so
   NestJS matches the literal path first, preventing "facets" from being
   interpreted as a UUID.

## Verification

- `pnpm test --exclude '**/*.e2e*'` → **50 tests pass** (9 files), 0 failures
- 3 new unit tests for `ItemService.getFacets` pass
- No regressions in existing tests
- `back/`: TypeScript compiles cleanly (pre-existing media module error unrelated)
- `front/`: TypeScript compiles cleanly (`npx tsc --noEmit`)

## Remaining

- Integration/e2e tests require a running database with seed data (not
  available in CI). Manual verification steps:
  - Start backend + DB, seed inventory fixture
  - `GET /api/v1/inventory/items/facets` → verify counts
  - `GET /api/v1/inventory/items/facets?brandId=<id>` → cross-filter
  - `GET /api/v1/inventory/items/facets?search=term` → text filter
  - Start frontend, login Admin, `/admin/inventory` → verify dropdowns
- Condition and color dropdowns are not rendered in FilterBar yet (as
  planned; the endpoint returns their facet data for future use)

## Recommended Next Step

Manual QA with running servers + seed data, then write closeout report.
