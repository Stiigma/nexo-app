# HOFF-2026-07-07 — Catalogs: Complete F2 Implementation (shadcn/ui + Generic Config Pattern)

## Metadata

- Task ID: `NEXO-0008`
- Date: 2026-07-07
- Authoring agent: `nexo-design`
- Receiving agent: `nexo-build`
- Status: ready
- Predecessor: `HOFF-2026-07-07-catalogs-pagination-seed.md` (tracer bullet — DONE)

## Objective

Complete the full F2 Operational Catalogs feature: install shadcn/ui + Tailwind
as the design system, build a **generic Catalog Entity Config infrastructure**
(one codebase, 9 entities configured not duplicated), implement backend CRUD
for all 9 catalog entities, and deliver a professional, accessible admin UI for
catalog management — all without requiring manual graphic design work.

This handoff supersedes the tracer-bullet handoff. The tracer bullet
(clothing-types paginated read) is complete and will be **migrated** into the
new generic pattern as the validation entity.

## Context

### What exists now (do NOT redo)

**Frontend (restructured this session):**
- `front/src/` uses the feature-module structure from
  `docs/adr/ADR-2026-07-07-frontend-feature-module-structure.md`.
- `@/` alias → `front/src/` (configured in `tsconfig.json` + `vite.config.ts`).
- `common/services/api-client.ts` — Axios wrapper with JWT auto-refresh.
  `api.get<T>(path, params?)` already accepts query params. **Missing: `api.patch`**
  (needed for toggle-active). Add it.
- `common/stores/auth-store.ts` — thin Zustand (state + setters only, no API calls).
- `common/types/api.ts` — has `PaginationMeta`, `PaginatedResponse<T>`,
  `ApiFilters` (note: uses `isActive` but backend uses `active` — resolve in
  `build-query-params` helper), `ClothingTypeDto`, `ClothingTypeQueryParams`.
- `common/components/layout/` — AppShell, Header, Sidebar, MobileNav (vanilla CSS).
- `common/components/guards/` — AuthGuard, AuthInitializer.
- `features/auth/` — full auth feature with services + TanStack Query hooks.
- `features/catalogs/views/ClothingTypesPage.tsx` — tracer bullet page (inline
  useQuery, NOT yet using the generic pattern). **Migrate then delete.**
- `common/components/ui/Pagination.tsx` + `CatalogTable.tsx` — hand-rolled
  vanilla CSS components. **Replace with shadcn-based equivalents.**
- `styles.css` — 495 lines vanilla CSS with Nexo theme variables.

**Backend:**
- `back/src/common/pagination/` — `PaginatedQueryDto`, `PaginatedResponse<T>`,
  `paginate()` helper. Reusable. DONE.
- `back/src/modules/catalogs/` — DDD stack for clothing-types ONLY:
  domain entities, `CatalogRepository` interface + token, PrismaCatalogRepository,
  `ClothingTypesController` with `GET /` (paginated, Admin+Operator read).
  **Missing: POST, PUT, PATCH /:id/active, DELETE for clothing-types.**
- `back/prisma/schema.prisma` — has `User`, `ClothingSection`, `ClothingType`.
  **Missing: 8 more catalog models** (Store, Brand, Category, Size, Condition,
  Color, PaymentMethod, ExpenseType, DifferenceReason).
- `back/prisma/seed-catalogs.ts` — seeds 13 sections + 128 types. Idempotent.
- `back/src/main.ts` — global `ValidationPipe` registered.
- Auth: `SessionAuthGuard` + `PermissionGuard` + `@RequirePermissions()`.
  `Permission.AdminWorkspace` and `Permission.OperatorWorkspace` exist.

### Design decision (authoritative)

The design is fully specified in **`docs/design/catalogs-design-spec.md`** (13
sections, ~450 lines). That document is the canonical design source. This
handoff references it; it does not duplicate it. Read it before implementing.

Key design decisions from the spec:
1. **Generic Catalog Entity Config pattern** — one infrastructure, 9 config files.
   Each entity is ~50 lines of config, not a separate page.
2. **shadcn/ui + Tailwind CSS** adopted as the design system. This supersedes
   the "No usar Tailwind" note in `docs/design/nexo-v1-frontend-complete-design.md`
   line 475.
3. **Layer contract**: View → TanStack Query hook → service function → api-client.
   Logic in `helpers/`, never inline in hooks.
4. **Zustand stores hold UI state only** (active tab, modal state, search/page
   per entity). Never API calls.

## Source Docs

| Doc | Path | Why |
|---|---|---|
| **Catalogs design spec** | `docs/design/catalogs-design-spec.md` | Canonical design — read first |
| Frontend structure ADR | `docs/adr/ADR-2026-07-07-frontend-feature-module-structure.md` | Layer responsibilities, `@/` alias |
| F2 plan | `harness/control/plans/NEXO-0008-operational-catalogs.md` | Acceptance criteria, stories |
| Tracer bullet handoff | `harness/control/handoffs/HOFF-2026-07-07-catalogs-pagination-seed.md` | What was already built |
| Tracer bullet impl record | `harness/control/implementations/NEXO-0008-catalogs-pagination-seed.md` | Backend details |
| Modular monolith ADR | `docs/adr/ADR-2026-07-06-modular-monolith-ddd-cqrs-events.md` | Backend DDD layers |
| Frontend design v1 | `docs/design/nexo-v1-frontend-complete-design.md` | Screen inventory, routes (note: Tailwind decision superseded) |
| SRS catalog reqs | `docs/spec/SRS.md` §10.7 (FR-CAT-001–009) | Requirements traceability |
| Prisma schema | `back/prisma/schema.prisma` | Existing models |
| Clothing seed fixture | `harness/fixtures/clothing-types-seed.json` | Seed data |

## Receiving Agent

`nexo-build` — implements all code. After build:
- `nexo-design` reviews frontend visual quality.
- `nexo-qa` verifies acceptance criteria.
- `nexo-security` reviews (catalog mutation is Admin-only — role enforcement gate).

---

## Files To Create Or Modify

### A. Frontend — Tailwind + shadcn/ui setup

| # | File | Action | Purpose |
|---|---|---|---|
| A1 | `front/package.json` | modify | Add tailwindcss, @tailwindcss/vite, radix-ui pkgs, class-variance-authority, clsx, tailwind-merge, sonner. shadcn CLI manages most. |
| A2 | `front/vite.config.ts` | modify | Add `@tailwindcss/vite` plugin |
| A3 | `front/tsconfig.json` | modify | Ensure `paths` includes shadcn resolution |
| A4 | `front/src/index.css` | create | Tailwind import + CSS variables theme (Nexo palette: green #1a5f4a, cream #f6f4ef, sidebar #101820) |
| A5 | `front/src/styles.css` | delete | Replaced by `index.css` + Tailwind utilities. Migrate any leftover layout CSS to `index.css` or component classes. |
| A6 | `front/components.json` | create | shadcn config (style, baseColor, cssVariables, aliases pointing to `@/common/components/ui`) |
| A7 | `front/src/common/lib/utils.ts` | create | `cn()` helper (clsx + tailwind-merge) — shadcn requires this |
| A8 | `front/src/common/components/ui/*` | create | shadcn components via `npx shadcn@latest add`: button, input, label, select, switch, table, dialog, alert-dialog, form, badge, tabs, dropdown-menu, tooltip, skeleton, sonner |

### B. Frontend — Generic catalog infrastructure

| # | File | Action | Purpose |
|---|---|---|---|
| B1 | `front/src/features/catalogs/types/catalog-entity.ts` | create | `CatEntity`, `CatFieldType`, `CatField`, `CatColumn<T>`, `CatConfig<T>` interfaces (see design spec §2.2) |
| B2 | `front/src/features/catalogs/types/index.ts` | create | Barrel |
| B3 | `front/src/features/catalogs/services/catalog-service.ts` | create | `createCatalogService(config)` factory: list, create, update, toggleActive, remove (see §2.4) |
| B4 | `front/src/features/catalogs/services/index.ts` | create | Barrel |
| B5 | `front/src/features/catalogs/helpers/build-query-params.ts` | create | Converts `ApiFilters` → backend params (resolves `isActive`→`active`) |
| B6 | `front/src/features/catalogs/helpers/format-cell.ts` | create | Formatters per field type (currency, percent, boolean→badge) |
| B7 | `front/src/features/catalogs/helpers/index.ts` | create | Barrel |
| B8 | `front/src/features/catalogs/hooks/use-catalog-list.ts` | create | `useQuery` generic paginated (placeholderData=prev) (see §2.5) |
| B9 | `front/src/features/catalogs/hooks/use-catalog-create.ts` | create | `useMutation` generic + invalidate |
| B10 | `front/src/features/catalogs/hooks/use-catalog-update.ts` | create | `useMutation` generic + invalidate |
| B11 | `front/src/features/catalogs/hooks/use-catalog-toggle.ts` | create | `useMutation` generic + invalidate |
| B12 | `front/src/features/catalogs/hooks/use-catalog-delete.ts` | create | `useMutation` generic + invalidate |
| B13 | `front/src/features/catalogs/hooks/use-debounced-search.ts` | create | Debounce 300ms |
| B14 | `front/src/features/catalogs/hooks/index.ts` | create | Barrel |
| B15 | `front/src/features/catalogs/store/catalog-ui-store.ts` | create | Zustand: activeKey, searchByEntity, pageByEntity, form modal state, delete confirm state (see §2.6) |
| B16 | `front/src/features/catalogs/store/index.ts` | create | Barrel |

### C. Frontend — Generic catalog components

| # | File | Action | Purpose |
|---|---|---|---|
| C1 | `front/src/features/catalogs/components/CatalogTabs.tsx` | create | shadcn Tabs over registry |
| C2 | `front/src/features/catalogs/components/CatalogEntityView.tsx` | create | Main container: toolbar + table + form dialog + delete dialog. Reads config + UI store. |
| C3 | `front/src/features/catalogs/components/CatalogToolbar.tsx` | create | Search input (debounced) + "Nueva X" button + filter selects |
| C4 | `front/src/features/catalogs/components/CatalogDataTable.tsx` | create | shadcn Table generic. Adds active column (Badge) + actions column (DropdownMenu) automatically. hideOnMobile support. |
| C5 | `front/src/features/catalogs/components/CatalogFormDialog.tsx` | create | shadcn Dialog + Form. Renders fields from config.fields. zod validation. create/edit modes. |
| C6 | `front/src/features/catalogs/components/CatalogDeleteDialog.tsx` | create | shadcn AlertDialog. Confirm delete with entity name. |
| C7 | `front/src/features/catalogs/components/CatalogEmptyState.tsx` | create | Icon + title + desc + CTA |
| C8 | `front/src/features/catalogs/components/CatalogErrorState.tsx` | create | Message + retry button (refetch) |
| C9 | `front/src/features/catalogs/components/CatalogLoadingState.tsx` | create | Skeleton rows matching table columns |
| C10 | `front/src/features/catalogs/components/CatalogPagination.tsx` | create | Wraps shadcn pagination primitives, "Mostrando X-Y de Z" |
| C11 | `front/src/features/catalogs/components/index.ts` | create | Barrel |

### D. Frontend — 9 entity configs

| # | File | Action | Purpose |
|---|---|---|---|
| D1 | `front/src/features/catalogs/types/entities/store.ts` | create | `StoreEntity`, `storeSchema` (zod), `storeConfig` |
| D2 | `front/src/features/catalogs/types/entities/brand.ts` | create | Brand config |
| D3 | `front/src/features/catalogs/types/entities/clothing-type.ts` | create | Migrate from tracer bullet |
| D4 | `front/src/features/catalogs/types/entities/category.ts` | create | Category config |
| D5 | `front/src/features/catalogs/types/entities/size.ts` | create | Size config |
| D6 | `front/src/features/catalogs/types/entities/condition.ts` | create | Condition config |
| D7 | `front/src/features/catalogs/types/entities/color.ts` | create | Color config (with hex field) |
| D8 | `front/src/features/catalogs/types/entities/payment-method.ts` | create | Payment method config |
| D9 | `front/src/features/catalogs/types/entities/expense-type.ts` | create | Expense type config |
| D10 | `front/src/features/catalogs/types/entities/difference-reason.ts` | create | Difference reason config |
| D11 | `front/src/features/catalogs/config/registry.ts` | create | Array of 9 configs in tab order |

### E. Frontend — Views + routes

| # | File | Action | Purpose |
|---|---|---|---|
| E1 | `front/src/features/catalogs/views/CatalogsPage.tsx` | create | `<CatalogTabs registry={CATALOG_REGISTRY} />` |
| E2 | `front/src/features/catalogs/views/index.ts` | create | Barrel |
| E3 | `front/src/routes.tsx` | modify | Replace `/admin/catalogs` placeholder with `<CatalogsPage />` |
| E4 | `front/src/common/components/layout/Sidebar.tsx` | modify | Restyle with Tailwind (keep structure) |
| E5 | `front/src/common/components/layout/Header.tsx` | modify | Restyle with Tailwind |
| E6 | `front/src/common/components/layout/MobileNav.tsx` | modify | Restyle with Tailwind |
| E7 | `front/src/common/components/layout/AppShell.tsx` | modify | Restyle with Tailwind |
| E8 | `front/src/features/auth/views/LoginPage.tsx` | modify | Use shadcn Card/Input/Button/Label |

### F. Frontend — api-client patch + cleanup

| # | File | Action | Purpose |
|---|---|---|---|
| F1 | `front/src/common/services/api-client.ts` | modify | Add `patch<T>(path, body)` method |
| F2 | `front/src/common/types/api.ts` | modify | Remove `ClothingTypeDto`/`ClothingTypeQueryParams` (move to features/catalogs/types/entities/clothing-type.ts). Keep generic `PaginationMeta`, `PaginatedResponse`, `ApiFilters`, `ApiError`. |
| F3 | `front/src/common/components/ui/Pagination.tsx` | delete | Replaced by CatalogPagination (C10) |
| F4 | `front/src/common/components/ui/CatalogTable.tsx` | delete | Replaced by CatalogDataTable (C4) |
| F5 | `front/src/common/components/ui/index.ts` | modify | Remove deleted exports |
| F6 | `front/src/features/catalogs/views/ClothingTypesPage.tsx` | delete | Replaced by generic CatalogsPage |

### G. Backend — Prisma models for 8 entities

| # | File | Action | Purpose |
|---|---|---|---|
| G1 | `back/prisma/schema.prisma` | modify | Add models: Store, Brand, Category, Size, Condition, Color, PaymentMethod, ExpenseType, DifferenceReason. Each: id, name (unique), active, displayOrder?, metadata? (Json), createdAt, updatedAt. Store: + address, city, state, defaultTaxRate. Brand: + metadata. Color: + hex. |
| G2 | migration | create | `pnpm prisma migrate dev --name add_catalog_entities` |

### H. Backend — Generic catalog CRUD

Decision: build a **generic base controller/service** parameterized by entity,
rather than 9 duplicate modules. Reuse the existing `paginate()` helper.

| # | File | Action | Purpose |
|---|---|---|---|
| H1 | `back/src/modules/catalogs/domain/catalog-entity.ts` | create | Base interface: id, name, active, displayOrder?, metadata?, createdAt, updatedAt |
| H2 | `back/src/modules/catalogs/application/ports/simple-catalog-repository.ts` | create | Generic `SimpleCatalogRepository<T>` interface: findAll, create, update, toggleActive, remove |
| H3 | `back/src/modules/catalogs/infrastructure/repositories/prisma-simple-catalog.repository.ts` | create | Generic Prisma impl using `paginate()`. Configurable via entity metadata (model delegate, searchable fields). |
| H4 | `back/src/modules/catalogs/interface/http/controllers/simple-catalog.controller.ts` | create | Generic base controller: GET /, POST /, PUT /:id, PATCH /:id/active, DELETE /:id. Admin-only mutations. |
| H5 | `back/src/modules/catalogs/interface/http/dto/create-entity.dto.ts` | create | Generic create DTO (name, displayOrder?, active?, metadata?) |
| H6 | `back/src/modules/catalogs/interface/http/dto/update-entity.dto.ts` | create | Generic update DTO (PartialType) |
| H7 | `back/src/modules/catalogs/interface/http/dto/toggle-active.dto.ts` | create | `{ active: boolean }` |
| H8 | `back/src/modules/catalogs/catalogs.module.ts` | modify | Register 9 entity controllers (or 1 generic + 9 route bindings) + repositories |
| H9 | `back/src/modules/catalogs/interface/http/clothing-types.controller.ts` | modify | Add POST, PUT, PATCH /:id/active, DELETE. Or migrate to generic controller. |
| H10 | `back/src/app.module.ts` | modify | Ensure CatalogsModule imported |

### I. Backend — Seeds for 8 entities

| # | File | Action | Purpose |
|---|---|---|---|
| I1 | `back/prisma/seed-catalogs.ts` | modify | Add seed for: categories, sizes, conditions, colors, payment-methods, expense-types, difference-reasons, brands, stores. Use sensible defaults (Camisa, Pantalon, etc. already in product spec). |

---

## Implementation Steps

### Phase 1: Tailwind + shadcn/ui setup (frontend infra)

1. Install Tailwind v4 + shadcn dependencies in `front/`:
   ```bash
   pnpm add tailwindcss @tailwindcss/vite
   pnpm add class-variance-authority clsx tailwind-merge
   ```
2. Add `@tailwindcss/vite` plugin to `front/vite.config.ts`.
3. Create `front/src/index.css` with:
   - `@import "tailwindcss";`
   - `:root` + `.dark` CSS variables mapping Nexo palette to shadcn tokens
     (`--background`, `--foreground`, `--primary` = green #1a5f4a, `--sidebar`,
     `--border`, etc. — see design spec §3.2).
4. Run `npx shadcn@latest init` — configure `components.json` with
   `aliases.ui = "@/common/components/ui"`, `aliases.lib = "@/common/lib"`.
5. Create `front/src/common/lib/utils.ts` with `cn()`:
   ```ts
   import { clsx, type ClassValue } from "clsx";
   import { twMerge } from "tailwind-merge";
   export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
   ```
6. Add shadcn components:
   ```bash
   npx shadcn@latest add button input label select switch table dialog \
     alert-dialog form badge tabs dropdown-menu tooltip skeleton sonner
   ```
7. Update `front/src/main.tsx` to import `index.css` instead of `styles.css`.
8. Restyle `AppShell`, `Sidebar`, `Header`, `MobileNav`, `LoginPage` with
   Tailwind classes (keep structure, replace CSS classes with utility classes).
9. Delete `front/src/styles.css`.
10. Verify `pnpm build` passes.

### Phase 2: Frontend generic infrastructure

11. Create `api.patch` in `common/services/api-client.ts`:
    ```ts
    patch: async <T>(path: string, body: unknown): Promise<T> => {
      const res = await client.patch<T>(path, body);
      return res.data;
    },
    ```
12. Create files B1–B16 (types, services, helpers, hooks, store) per design
    spec §2. Use the exact interfaces from §2.2–2.6.
13. Create components C1–C11 per design spec §3 + §4. Each component reads a
    `CatConfig<T>` and renders generically.
14. Verify `pnpm tsc -b` passes (no runtime test yet — backend CRUD missing).

### Phase 3: Migrate clothing-types to generic pattern

15. Create `features/catalogs/types/entities/clothing-type.ts` with
    `ClothingTypeEntity`, `clothingTypeSchema` (zod), `clothingTypeConfig`.
    Move types from `common/types/api.ts` here.
16. Add clothing-type to `config/registry.ts`.
17. Create `views/CatalogsPage.tsx` = `<CatalogTabs registry={CATALOG_REGISTRY} />`.
18. Update `routes.tsx`: `/admin/catalogs` → `<CatalogsPage />`.
19. Delete old `ClothingTypesPage.tsx`, `CatalogTable.tsx`, `Pagination.tsx`.
20. Verify: `pnpm dev` → login as Admin → `/admin/catalogs` shows clothing-types
    tab with paginated table (read-only, since backend CRUD not yet built).

### Phase 4: Backend CRUD for clothing-types

21. Add POST/PUT/PATCH/DELETE to clothing-types (or migrate to generic
    controller per H4). Mutations Admin-only via `@RequirePermissions(Permission.AdminWorkspace)`.
22. Verify with curl as Admin:
    ```bash
    # create
    curl -X POST localhost:3000/api/v1/catalogs/clothing-types -H "Content-Type: application/json" -d '{"nameEn":"Test","nameEs":"Test","sectionId":"<uuid>","displayOrder":99}'
    # update
    curl -X PUT localhost:3000/api/v1/catalogs/clothing-types/<id> -d '{"nameEs":"Editado"}'
    # toggle
    curl -X PATCH localhost:3000/api/v1/catalogs/clothing-types/<id>/active -d '{"active":false}'
    # delete
    curl -X DELETE localhost:3000/api/v1/catalogs/clothing-types/<id>
    ```
23. Verify Operator gets 403 on POST.

### Phase 5: Frontend CRUD validation (clothing-types end-to-end)

24. Wire `CatalogFormDialog` + `CatalogDeleteDialog` + toggle Badge to the
    hooks (use-catalog-create/update/toggle/delete).
25. Add Sonner `<Toaster />` to App for toast feedback.
26. Manual test: create → edit → toggle → delete clothing-type. Verify toasts,
    table refresh, empty state, error state (try create with empty name).

### Phase 6: Backend — 8 remaining entities

27. Add 8 Prisma models to `schema.prisma` (G1). Each: id, name @unique,
    active, displayOrder?, metadata? (Json), createdAt, updatedAt. Specials:
    Store (+address, city, state, defaultTaxRate Decimal), Brand (+metadata),
    Color (+hex).
28. `pnpm prisma migrate dev --name add_catalog_entities`.
29. Build generic controller + repository (H1–H7) OR replicate the
    clothing-types pattern 8 times (pragmatic choice — generic is preferred
    but if time-boxed, duplication is acceptable for v1).
30. Register all 9 entity routes in CatalogsModule (H8).
31. Extend `seed-catalogs.ts` with default values for each entity (I1).
    Suggested seeds: Categorías (Camisa, Pantalon, Vestido...), Tallas
    (XS, S, M, L, XL, XXL + numeric 26-40), Condiciones (Nuevo, Como nuevo,
    Usado), Colores (Negro, Blanco, Gris, Azul, Rojo, Verde... with hex),
    Métodos de pago (Efectivo, Tarjeta, Transferencia), Tipos de gasto
    (Gasolina, Caseta, Comida, Otro), Motivos de diferencia (Daño, Precio,
    Talla, Otro), Marcas (Nike, Levi's, Gap, Target brand...).
32. Run `pnpm db:seed:catalogs`. Verify counts.

### Phase 7: Frontend — 8 entity configs

33. Create D1–D10 (8 entity configs + registry update). Each ~50 lines.
34. Verify all 9 tabs render with data, search, pagination, CRUD.

### Phase 8: Polish + QA

35. Verify all 9 states (loading, empty, search-no-results, error, mutation
    loading, mutation success, mutation error, toggle, permission) per
    design spec §4.
36. Verify responsive: test at 375px, 768px, 1280px.
37. Verify accessibility: keyboard nav through tabs/table/dialog, focus
    trap in dialog, aria labels on action buttons.
38. `pnpm tsc -b` + `pnpm build` clean in `front/`.
39. `pnpm tsc -b` + `pnpm test` in `back/`.

---

## Interface Contracts

### Backend API — per entity (9 entities)

Base path: `/api/v1/catalogs/{entity}` where entity ∈
{stores, brands, clothing-types, categories, sizes, conditions, colors,
payment-methods, expense-types, difference-reasons}

```
GET    /                  Access (Admin+Operator)  ?page&limit&search&sortBy&sortOrder&active
POST   /                  Admin                    Create
PUT    /:id               Admin                    Update
PATCH  /:id/active        Admin                    { active: boolean }
DELETE /:id               Admin                    Soft delete (sets active=false + deletedAt)
```

Response (GET):
```json
{
  "data": [{ "id": "uuid", "name": "...", "active": true, ... }],
  "meta": { "total": 25, "page": 1, "limit": 20, "totalPages": 2, "hasNext": true, "hasPrevious": false }
}
```

### Frontend `CatConfig<T>` — see design spec §2.2

Each entity config must provide: key, label, singular, description, icon,
basePath, schema (zod), columns[], fields[], defaultValues.

### `api` client methods (after F1 patch)

```ts
api.get<T>(path, params?)       // existing
api.post<T>(path, body?)        // existing
api.put<T>(path, body)          // existing
api.patch<T>(path, body)        // ADD in Phase 2 step 11
api.delete<T>(path)             // existing
```

---

## Verification

- `pnpm tsc -b` passes in `front/` and `back/`.
- `pnpm build` passes in `front/`.
- `pnpm test` passes in `back/` (unit + e2e for at least clothing-types CRUD).
- Manual: login as Admin → `/admin/catalogs` → all 9 tabs work → CRUD each
  entity → toasts appear → table refreshes → empty/error/loading states visible.
- Manual: login as Operator → `/admin/catalogs` blocked by AuthGuard.
- Manual: Operator calling POST `/catalogs/stores` → 403.
- Responsive: 375px / 768px / 1280px all usable.
- Accessibility: keyboard-only navigation through tabs, table, dialog works.

## Risks

- **Tailwind v4 is new** — shadcn CLI may default to v3 conventions. If `npx
  shadcn init` produces v3-style config, follow shadcn's v4 migration or pin
  Tailwind v3. Prefer whatever shadcn CLI outputs.
- **Generic backend controller** with NestJS + Prisma is non-trivial (typed
  delegates). If the generic approach blocks progress, fall back to 9 thin
  controllers duplicating the clothing-types pattern — acceptable for v1.
- **`forbidNonWhitelisted: true`** in backend ValidationPipe means DTOs must
  declare every field. Generic DTOs must use `PartialType` / `PickType` carefully.
- **DELETE semantics**: design spec recommends soft delete. Confirm with
  `nexo-spec` if historical-record integrity requires hard-delete prevention.
  If soft delete, `PATCH /:id/active` and `DELETE /:id` may overlap —
  DELETE can just call toggle to active=false.
- **Theme migration**: converting 495 lines vanilla CSS to Tailwind may miss
  edge cases. Test login page + app shell thoroughly after migration.
- **Existing `ApiFilters.isActive` vs backend `active`**: resolve in
  `build-query-params.ts` helper (map `isActive` → `active`).

## Acceptance Criteria (from NEXO-0008 plan)

1. US-013, US-018, US-019, US-020, US-021, US-022 acceptance criteria pass.
2. All 9 catalog entities support CRUD, active/inactive toggling, filtering,
   sorting, pagination.
3. Admin-only mutation UI exists for all catalog management screens.
4. Operator access to admin catalog mutation is denied by the API (403).
5. Catalog deactivation does not break historical records (soft delete).
6. F3 can use stores, categories, brands, clothing types, difference reasons.
7. Tests and harness records complete.
8. `pnpm tsc -b` + `pnpm build` + `pnpm test` all pass.

## Required Gates

- QA review: required before closeout (`nexo-qa`).
- Security review: required — catalog mutation must be Admin-only enforced
  server-side (`nexo-security`).
- User confirmation: required before commit, push, or deploy.

## Non-Goals (Explicit)

- CSV/JSON export (FR-CAT-007 P2) — defer to subsequent handoff.
- Inventory filtering by catalog values (US-021) — defer to F6 handoff.
- Catalog-driven report grouping (US-022) — defer to F10 handoff.
- No commit, push, or deploy without explicit user confirmation.

## Suggested Skills

- `tdd` — for backend CRUD tests (write the 403-deny test first).
- `commit-work` — when ready to split changes into atomic commits.
- `diagnosing-bugs` — if the generic controller type wrangling breaks.
