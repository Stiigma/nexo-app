# NEXO-0008 - Operational Catalogs

## Feature Metadata

- Feature: F2.
- Depends on: `NEXO-0007`.
- Primary agent: `nexo-build`.
- Required gates: QA review before closeout.
- Linked stories: US-013, US-018, US-019, US-020, US-021, US-022.
- Linked SRS requirements: FR-CAT-001, FR-CAT-002, FR-CAT-003, FR-CAT-004, FR-CAT-005, FR-CAT-006, FR-CAT-007, FR-CAT-008, FR-CAT-009.

## Business Objective

Allow admins to manage the operational catalogs that make purchase, garment,
sale, expense, and review data consistent.

## Domain Rules

- Only Admin can create, edit, or deactivate catalog values.
- Store default tax rates are editable and used as purchase defaults.
- Catalog deactivation must not break historical records.

## Done When

- Stores (with address/city/state), brands (with metadata), clothing types (with display order), categories, sizes, conditions, colors, payment methods, expense types, and difference reasons have backend/API support.
- All catalog entities support CRUD, active/inactive toggling, filtering, sorting, pagination, and JSON/CSV export.
- Garment filtering by catalog values (brand, clothing type, store, category, size, condition, color) works in the inventory view.
- Sales and inventory reports support grouping by brand, clothing type, and store.
- Admin-only UI exists for all catalog management screens.
- Operator access to admin catalog mutation is denied by the API.
- Tests and harness records are complete.

## Scope

- Backend: catalog models (stores, brands, clothing types, categories, sizes, conditions, colors, payment methods, expense types, difference reasons), API endpoints with filtering/sorting/pagination/export, validation, role checks.
- Frontend: admin catalog management screens for all entity types, plus inventory filtering by catalog values.
- Data: schema/migrations with metadata JSON fields, seed values for core catalogs (pre-seeded clothing types: Camisa, Pantalon, Vestido, Chamarra, Sudadera, Falda, Short, Blusa, Abrigo, Conjunto).
- Reports: catalog-driven grouping in sales and inventory reports.
- Infrastructure: none expected beyond local database.

## Out Of Scope

- Purchase capture, inventory availability, sales, and reports.

## Acceptance Criteria

- US-013, US-018, US-019, US-020, US-021, US-022 acceptance criteria pass.
- F3 can use stores, categories, brands, clothing types, and difference reasons.

## Required Tests

- Unit: catalog validation and active/inactive behavior.
- API/integration: admin allow, operator deny.
- UI/manual workflow: create/edit/deactivate catalog value.

## Steps

1. Expand this plan after F1 closeout. ✓
2. Create a build handoff covering pagination infrastructure and clothing types
   tracer bullet (seed → backend API → frontend table).
3. Install `class-validator` + `class-transformer`, register global
   `ValidationPipe`.
4. Create `src/common/pagination/` with `PaginatedQueryDto`,
   `PaginatedResponse<T>`, and `pagination.helper.ts`.
5. Seed `clothing_sections` and `clothing_types` from JSON fixture (13
   sections, 149 types).
6. Create `src/modules/catalogs/` following DDD layers: domain entities,
   application ports, Prisma repository, HTTP controller with paginated
   `GET /api/v1/catalogs/clothing-types`.
7. Build frontend catalog page: replace `/admin/catalogs` placeholder with
   real data table + pagination using TanStack Query + reusable
   `<Pagination />` component.
8. Validate the pattern end-to-end, then replicate for remaining catalog
   entities (stores, brands, categories, sizes, conditions, colors, payment
   methods, expense types, difference reasons).
9. Implement inventory filtering by catalog values (US-021).
10. Implement catalog-driven report grouping (US-022).
11. Build admin UI screens for all catalog entities.
12. Implement `PrismaExceptionFilter` global para errores Prisma (P2002 → 409,
    P2025 → 404, P2003 → 400, P1001 → 503).
13. Escribir tests unitarios para `SimpleCatalogService`, `paginate()`, DTOs.
14. Escribir tests e2e para catálogos (CRUD clothing-types, permisos Admin/Operator).
15. Arreglar tests e2e de auth (actualizar fixtures o sync seed con usuarios de test).
16. Crear seeds para las 8 entidades restantes (stores, brands, categories, sizes,
    conditions, colors, payment-methods, expense-types, difference-reasons).
17. Completar frontend: migrar a shadcn/ui + Tailwind, componentes genéricos de
    catálogo, 9 páginas de gestión.
18. Write tests and harness records.
19. QA review and closeout.

## Progress

- 2026-07-06: Created initial dependency plan from master feature split.
- 2026-07-06: Unblocked after `NEXO-0007` auth closeout and `NEXO-0019`
  local PostgreSQL setup.
- 2026-07-06: Spec expanded by `nexo-spec`. Split US-013 into US-013 (Stores),
  US-018 (Brands), US-019 (Clothing Types), US-020 (Operational Catalogs).
  Added US-021 (Filter Inventory by Catalog), US-022 (Catalog Analytics
  Export). Added FR-CAT-005 through FR-CAT-009. Updated traceability matrix.
  Plan scope now covers 9 catalog entity types with analytics readiness.
- 2026-07-07: Pagination architecture designed by `nexo-plan`. Decision:
  offset-based pagination with reusable `src/common/pagination/` infrastructure,
  `class-validator` + global `ValidationPipe`, clothing types as
  tracer bullet. Build handoff created:
  `harness/control/handoffs/HOFF-2026-07-07-catalogs-pagination-seed.md`.
- 2026-07-07: Tracer bullet implemented by `nexo-build`: seed (13 sections, 128
  types), backend CRUD, frontend paginated table. Backend: clothing-types, stores,
  colors + factory para 7 entidades simples + CRUD completo. Frontend: CSS vanilla.
- 2026-07-07: **Validación encontró error 500** — Prisma lanza errores no capturados
  (unique constraint violation → 500 en lugar de 409). **Sin tests de catálogos.**
  Sin seeds para 8 entidades restantes. Sin frontend shadcn/ui + Tailwind.
  Diagnóstico completo en `harness/control/investigations/INV-2026-07-07-catalogs-500-error.md`.

## Pagination Architecture

Strategy: **offset-based pagination with hard limits**, designed for the admin
CRUD catalog use case. Cursor-based pagination is not appropriate here because
catalog management requires page-number navigation, filters that reset position,
and REST-idiomatic contracts.

### Core infrastructure (`src/common/pagination/`)

- `paginated-query.dto.ts` — base DTO: `page` (default 1, min 1), `limit`
  (default 20, min 1, max 100), `search` (optional text filter), `sortBy`
  (optional), `sortOrder` (enum asc/desc, default asc). All fields validated
  via `class-validator` + `ValidationPipe`.
- `paginated-response.dto.ts` — generic response envelope:
  `{ data: T[]; meta: { total, page, limit, totalPages, hasNext,
  hasPrevious } }`. Full `@ApiProperty` documentation for OpenAPI.
- `pagination.helper.ts` — `paginate<T>({ delegate, query, where, orderBy,
  select, include }) => PaginatedResponse<T>`. Runs `findMany` and `count` in
  parallel. Hard limit enforcement at the helper level.

Each catalog entity extends `PaginatedQueryDto` (e.g.,
`ClothingTypeQueryDto`), adding entity-specific filter fields.

### Frontend pagination pattern

- TanStack Query `useQuery` with `keepPreviousData: true` for smooth page
  transitions.
- Reusable `<Pagination />` component: prev/next + page numbers + "mostrando
  X-Y de Z resultados".
- Query params stored in React state; page reset to 1 on filter change.

### Dependencies to add

- `class-validator` + `class-transformer` for DTO validation.
- `ValidationPipe` registered globally in `main.ts` with `transform: true`,
  `whitelist: true`, `forbidNonWhitelisted: true`.

### Tracer-bullet approach

Implement the full paginated stack end-to-end for **clothing types** first
(seed → backend API → frontend table). Once the pattern is validated, replicate
for the remaining 8 catalog entities.

## Decision Log

- 2026-07-06: F2 waits for F1 role enforcement.
- 2026-07-06: F2 should reuse F1 Admin-only guards and local PostgreSQL
  migration workflow.
- 2026-07-06: Brands (Marcas) and Clothing Types (Tipos de ropa) are promoted
  to first-class catalog entities with their own CRUD, metadata extensibility,
  and traceability. Original flat brand name in FR-CAT-002 is superseded by the
  rich FR-CAT-005 Brand entity.
- 2026-07-07: **Pagination strategy decision** — offset-based with hard limit
  (max 100). Reusable `src/common/pagination/` infrastructure. `class-validator`
  + global `ValidationPipe`. Clothing types as tracer bullet for the full
  paginated stack (seed → backend API → frontend table).
- 2026-07-07: **Exception handling gap** — `PrismaClientKnownRequestError` no es
  capturado. Se necesita `PrismaExceptionFilter` global. Documentado en
  `INV-2026-07-07-catalogs-500-error.md`.
- 2026-07-07: **Test coverage gap** — cero tests para catálogos. Priorizar antes
  de closeout. Los tests e2e de auth fallan 9/9 por mismatch de fixtures DB.

## Risks

- Catalog values may be over-modeled before purchase and inventory workflows
  prove exact usage.
- **Error 500 por Prisma no capturado** — cualquier violación de unique constraint
  o foreign key da 500 en lugar de 4xx. Se requiere `PrismaExceptionFilter`.
- **Sin tests de catálogos** — no hay red de seguridad para refactors futuros.
- **Tests e2e de auth rotos** — fallan 9/9 por mismatch de fixtures DB. Si no se
  arreglan, no se puede verificar que los guards de auth funcionan correctamente
  en los endpoints de catálogo.
- **Frontend incompleto** — migración a shadcn/ui + Tailwind y páginas para 8
  entidades restantes no implementadas. El handoff completo estima ~4-6h de
  trabajo adicional.

## Verification

- Cannot close until catalog mutation is admin-only and tested.
