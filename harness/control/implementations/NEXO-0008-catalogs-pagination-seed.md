# NEXO-0008-Catalogs-Pagination-Seed — Implementation Record

- **Date:** 2026-07-07
- **Agent:** nexo-build (OpenCode)
- **Handoff:** `harness/control/handoffs/HOFF-2026-07-07-catalogs-pagination-seed.md`

## What Was Built

### Phase 1: Dependencies & ValidationPipe
- Installed `class-validator` 0.15.1 and `class-transformer` 0.5.1 (pinned).
- Registered global `ValidationPipe` in `back/src/main.ts` with
  `transform: true`, `whitelist: true`, `forbidNonWhitelisted: true`,
  `enableImplicitConversion: true`.
- Added `@IsEmail()`, `@IsString()`, `@MinLength(4)` decorators to `LoginDto`
  so the whitelist doesn't strip auth request bodies.
- Added `db:seed:catalogs` script to `back/package.json`.

### Phase 2: Reusable Pagination Infrastructure
Created `back/src/common/pagination/` with:
- `paginated-query.dto.ts` — base DTO with `page` (min 1), `limit` (min 1, max
  100), `search`, `sortBy`, `sortOrder` (asc/desc). Uses `@Type(() => Number)`
  for query string coercion.
- `paginated-response.dto.ts` — generic `PaginatedResponse<T>` with
  `PaginationMeta` (total, page, limit, totalPages, hasNext, hasPrevious).
  Fully documented with `@ApiProperty`.
- `pagination.helper.ts` — `paginate<T>()` function accepting any Prisma
  delegate, runs `findMany` + `count` in parallel, coerces page/limit to
  numbers for safety, enforces max 100.
- `index.ts` — barrel export.

### Phase 3: Seed Clothing Types
Created `back/prisma/seed-catalogs.ts`:
- Reads `harness/fixtures/clothing-types-seed.json` (13 sections, 128 types —
  note: fixture `totals.types` says 149 but actual count is 128).
- `upsert` sections by `nameEn`, then types by `[sectionId, nameEn]`.
- Idempotent — re-run produces 0 creados, 128 actualizados.
- Verified: 13 sections + 128 types in local PostgreSQL.

### Phase 4: Catalogs Module (Backend)
Created `back/src/modules/catalogs/` following DDD layers:

| Layer | File | Purpose |
|---|---|---|
| domain | `clothing-section.ts` | `ClothingSectionEntity` interface |
| domain | `clothing-type.ts` | `ClothingTypeEntity` interface |
| app/tokens | `tokens.ts` | `CATALOG_REPOSITORY` Symbol token |
| app/ports | `catalog-repository.ts` | `CatalogRepository` interface with `findClothingTypes()` |
| infra | `prisma-catalog.repository.ts` | Prisma implementation with search (ILIKE), sectionId/active filters |
| interface/http | `clothing-types.controller.ts` | `GET /catalogs/clothing-types` — Admin+Operator, paginated |
| interface/http/dto | `clothing-type-query.dto.ts` | Extends `PaginatedQueryDto`, adds `sectionId?`, `active?` |
| interface/http/dto | `clothing-type-response.dto.ts` | `ClothingTypeDto` + `ClothingSectionDto` for responses |
| module | `catalogs.module.ts` | NestJS module, imports IdentityModule, exports CATALOG_REPOSITORY |

- DI uses `useFactory` pattern with explicit `PrismaService` injection.
- Controller guarded with `SessionAuthGuard` + `PermissionGuard`.
- Permission allows both `AdminWorkspace` and `OperatorWorkspace`.
- Module imported in `AppModule`.

### Phase 5: Frontend Catalog Display

| File | Purpose |
|---|---|
| `common/services/api-client.ts` | Updated `api.get<T>()` to accept optional `params` for query strings |
| `common/types/api.ts` | Added `PaginationMeta`, updated `PaginatedResponse<T>` to nested `meta`, added `ClothingTypeDto`, `ClothingSectionDto`, `ClothingTypeQueryParams` |
| `common/components/ui/Pagination.tsx` | Reusable pagination: prev/next + page numbers + ellipsis + "Mostrando X–Y de Z" |
| `common/components/ui/CatalogTable.tsx` | Generic `<CatalogTable<T>>` with columns, loading state, empty state |
| `features/catalogs/views/ClothingTypesPage.tsx` | Full page: TanStack Query with `keepPreviousData`, table, pagination, badge for active/inactive |
| `routes.tsx` | Replaced `/admin/catalogs` PlaceholderPage with `ClothingTypesPage` |
| `styles.css` | Added styles for catalog-table, badges, pagination (6 sections, ~90 lines) |

### Phase 6: Verification
- Backend TypeScript compilation: clean (only pre-existing vitest type errors in spec files).
- Frontend TypeScript compilation: clean.
- Frontend Vite build: 331KB JS (107KB gzip), 6.3KB CSS (1.8KB gzip).
- Architecture test: domain/ layer has zero NestJS/Prisma imports.
- NestJS boot: successful with CatalogsModule.
- API test: `GET /catalogs/clothing-types?page=1&limit=3` returns 3 items,
  `meta.total: 128`, `meta.totalPages: 43`, `meta.hasNext: true`.
- API test page 2: `hasNext: true`, `hasPrevious: true`.
- Seed idempotency verified: re-run produces 0 created, 128 updated.
- Unit tests: 4/4 pass (architecture + role-policy). 9/9 e2e failures are
  pre-existing (auth test DB fixture mismatch — `admin@nexo.test` test users
  don't exist in local PostgreSQL which has `nexoense@gmail.com`).

## Key Design Notes

1. **Pagination.helper.ts handles coercion** — `Number(query.limit) || 20` so
   query strings from URL params are converted before reaching Prisma.
2. **Search uses ILIKE** — acceptable for catalog scale (<10K rows). A comment
   in the repository notes that `pg_trgm` indexes should be considered for F6
   inventory filtering.
3. **Symbol-based DI** — `CATALOG_REPOSITORY` follows the identity module's
   `USER_REPOSITORY` pattern.
4. **useFactory + inject** — matches identity module's explicit wiring.
5. **Frontend TanStack Query** — uses `keepPreviousData` from
   `@tanstack/react-query` v5 (imported as `placeholderData: keepPreviousData`).

## Risk Notes

- `forbidNonWhitelisted: true` requires ALL DTO properties to have
  `class-validator` decorators. Future DTOs must follow this pattern or the
  whitelist will strip their properties.
- The e2e tests need a DB fixture update (or mock) to match test users with
  the seeded database. This is pre-existing and not introduced by these
  changes.
