# HOFF-2026-07-07 — Catalogs: Pagination Infrastructure + Clothing Types Seed & Display

## Objective

Seed clothing types into the database, build the reusable pagination
infrastructure, and display the first catalog entity (clothing types) in the
frontend `/admin/catalogs` section with paginated browsing. This is the tracer
bullet for all 9 catalog entities — the pattern established here repeats for
stores, brands, categories, sizes, conditions, colors, payment methods, expense
types, and difference reasons.

## Context

- **Task:** `NEXO-0008` — F2 Operational Catalogs (active).
- **Plan:** `harness/control/plans/NEXO-0008-operational-catalogs.md`.
- **Architecture:** Modular monolith DDD/CQRS (ADR in `docs/adr/`).
  Catalog modules follow `domain → application → infrastructure → interface`.
- **Auth:** F1 guards (`SessionAuthGuard`, `PermissionGuard`) are exported from
  `IdentityModule`. Admin-only catalog mutation; operator read for dropdowns.
- **Current state:** Prisma schema has `ClothingSection` + `ClothingType`
  (migration applied). Seed JSON at `harness/fixtures/clothing-types-seed.json`
  has 13 sections / 149 types. No backend catalog code, no frontend catalog
  components. No `class-validator`/`class-transformer` installed. No
  `ValidationPipe` registered.
- **Concern:** Large datasets require pagination from day one. The common
  pagination infrastructure must be reusable across all modules.

## Source Docs

| Doc | Path |
|---|---|
| Plan | `harness/control/plans/NEXO-0008-operational-catalogs.md` |
| SRS (catalog reqs) | `docs/spec/SRS.md` §10.7 (FR-CAT-001–009) |
| Modular monolith ADR | `docs/adr/ADR-2026-07-06-modular-monolith-ddd-cqrs-events.md` |
| Auth implementation | `harness/control/implementations/NEXO-0007-auth-permissions-base.md` |
| Clothing seed fixture | `harness/fixtures/clothing-types-seed.json` |
| Prisma schema | `back/prisma/schema.prisma` |
| Frontend design | `docs/design/nexo-v1-frontend-complete-design.md` |

## Receiving Agent

`nexo-build` — implements all code, config, and frontend components described
below. `nexo-design` reviews the frontend visual quality after build.
`nexo-qa` verifies acceptance criteria.

---

## Files to Create

### Backend — Common Pagination Infrastructure

| # | File | Purpose |
|---|---|---|
| B1 | `back/src/common/pagination/paginated-query.dto.ts` | Base query DTO with `page`, `limit`, `search`, `sortBy`, `sortOrder`. All validated. |
| B2 | `back/src/common/pagination/paginated-response.dto.ts` | Generic `PaginatedResponse<T>` with `data` + `meta` (total, page, limit, totalPages, hasNext, hasPrevious). `@ApiProperty` documented. |
| B3 | `back/src/common/pagination/pagination.helper.ts` | `paginate<T>(...)` function. Accepts Prisma delegate, validated query, where/orderBy/include/select. Returns `PaginatedResponse<T>`. Runs `findMany` + `count` in parallel. Enforces hard limit. |
| B4 | `back/src/common/pagination/index.ts` | Barrel export. |

### Backend — Catalogs Module (Clothing Types Tracer Bullet)

| # | File | Purpose |
|---|---|---|
| B5 | `back/src/modules/catalogs/domain/clothing-section.ts` | Plain TS: `ClothingSectionEntity` type/class with `id`, `nameEn`, `nameEs`, `displayOrder`, `active`, `createdAt`, `updatedAt`. No framework deps. |
| B6 | `back/src/modules/catalogs/domain/clothing-type.ts` | Plain TS: `ClothingTypeEntity` type/class with `id`, `sectionId`, `nameEn`, `nameEs`, `displayOrder`, `active`, `metadata`, `section`. |
| B7 | `back/src/modules/catalogs/application/ports/catalog-repository.ts` | Interface `CatalogRepository` with `findClothingTypes(query, where)` → `PaginatedResponse<ClothingTypeEntity>`. |
| B8 | `back/src/modules/catalogs/infrastructure/repositories/prisma-catalog.repository.ts` | `PrismaCatalogRepository implements CatalogRepository`. Uses `paginate()` helper. Maps Prisma rows to domain entities. |
| B9 | `back/src/modules/catalogs/interface/http/dto/clothing-type-query.dto.ts` | Extends `PaginatedQueryDto`, adds `sectionId?`, `active?`. |
| B10 | `back/src/modules/catalogs/interface/http/dto/clothing-type-response.dto.ts` | Response DTO: `ClothingTypeDto` + `ClothingTypeListResponse`.
| B11 | `back/src/modules/catalogs/interface/http/clothing-types.controller.ts` | `@Controller("catalogs/clothing-types")`. `GET /` paginated, admin-only. Operator read for dropdown (compact endpoint). |
| B12 | `back/src/modules/catalogs/catalogs.module.ts` | NestJS module. Imports `IdentityModule` for guards. Registers controller and repository provider. Exports `CatalogRepository` for reporting/filtering modules. |

### Backend — Seed Script

| # | File | Purpose |
|---|---|---|
| B13 | `back/prisma/seed-catalogs.ts` | Reads `harness/fixtures/clothing-types-seed.json`. Upserts sections then types. Idempotent (re-run safe). Logs counts. |

### Backend — Infrastructure Updates

| # | File | Purpose |
|---|---|---|
| B14 | `back/src/main.ts` | Register global `ValidationPipe` with `transform: true`, `whitelist: true`, `forbidNonWhitelisted: true`. |
| B15 | `back/package.json` | Add `class-validator`, `class-transformer` (pinned). Add `db:seed:catalogs` script to `scripts` block. |

### Frontend

| # | File | Purpose |
|---|---|---|
| F1 | `front/src/components/ui/Pagination.tsx` | Reusable `Pagination` component. Props: `{ page, totalPages, total, limit, onPageChange }`. Renders prev/next + page numbers + "mostrando X-Y de Z". |
| F2 | `front/src/features/catalogs/CatalogTable.tsx` | Reusable data table component. Props: `{ columns, data, isLoading }`. Renders `<table>` with CSS classes from `styles.css`. |
| F3 | `front/src/features/catalogs/hooks/use-paginated-query.ts` | Custom hook wrapping TanStack Query `useQuery` with `keepPreviousData: true`. Accepts query params, returns `{ data, meta, isLoading, page, setPage }`. |
| F4 | `front/src/features/catalogs/ClothingTypesPage.tsx` | Full page: combines `usePaginatedQuery`, `CatalogTable`, and `Pagination`. Shows clothing type list with section name, names (es/en), active badge, display order. |
| F5 | `front/src/routes.tsx` | Replace `/admin/catalogs` `PlaceholderPage` with `ClothingTypesPage`. |
| F6 | `front/src/lib/api-types.ts` | TypeScript types mirroring `PaginatedResponse<T>`, `ClothingTypeDto`, query params. |

---

## Implementation Steps

### Phase 1: Dependencies & Validation Pipe (prerequisite)

1. **Install `class-validator` + `class-transformer`** in `back/`:
   ```bash
   pnpm add class-validator class-transformer
   ```
   Pin exact versions.

2. **Register `ValidationPipe` globally** in `back/src/main.ts`:
   ```typescript
   app.useGlobalPipes(
     new ValidationPipe({
       transform: true,
       whitelist: true,
       forbidNonWhitelisted: true,
       transformOptions: { enableImplicitConversion: true },
     }),
   );
   ```

3. Run `pnpm tsc -b` in `back/` to confirm no type errors after the install.

### Phase 2: Reusable Pagination Infrastructure

4. Create `back/src/common/pagination/paginated-query.dto.ts`:
   ```typescript
   import { ApiPropertyOptional } from "@nestjs/swagger";
   import { Type } from "class-transformer";
   import { IsInt, IsOptional, IsString, Min, Max } from "class-validator";

   export class PaginatedQueryDto {
     @ApiPropertyOptional({ default: 1, minimum: 1 })
     @IsOptional()
     @Type(() => Number)
     @IsInt()
     @Min(1)
     page?: number = 1;

     @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
     @IsOptional()
     @Type(() => Number)
     @IsInt()
     @Min(1)
     @Max(100)
     limit?: number = 20;

     @ApiPropertyOptional({ description: "Búsqueda por texto" })
     @IsOptional()
     @IsString()
     search?: string;

     @ApiPropertyOptional({ description: "Campo para ordenar" })
     @IsOptional()
     @IsString()
     sortBy?: string;

     @ApiPropertyOptional({ enum: ["asc", "desc"], default: "asc" })
     @IsOptional()
     @IsString()
     sortOrder?: "asc" | "desc" = "asc";
   }
   ```

5. Create `back/src/common/pagination/paginated-response.dto.ts`:
   ```typescript
   import { ApiProperty } from "@nestjs/swagger";

   export class PaginationMeta {
     @ApiProperty() total: number;
     @ApiProperty() page: number;
     @ApiProperty() limit: number;
     @ApiProperty() totalPages: number;
     @ApiProperty() hasNext: boolean;
     @ApiProperty() hasPrevious: boolean;
   }

   export class PaginatedResponse<T> {
     @ApiProperty({ isArray: true })
     data: T[];

     @ApiProperty({ type: PaginationMeta })
     meta: PaginationMeta;
   }
   ```

6. Create `back/src/common/pagination/pagination.helper.ts`:
   ```typescript
   import { PaginatedQueryDto } from "./paginated-query.dto";
   import { PaginatedResponse } from "./paginated-response.dto";

   interface PaginateParams<TDelegate, TWhere, TOrderBy, TInclude, TSelect> {
     delegate: {
       findMany: (args: any) => Promise<any[]>;
       count: (args: any) => Promise<number>;
     };
     query: PaginatedQueryDto;
     where?: TWhere;
     orderBy?: TOrderBy;
     include?: TInclude;
     select?: TSelect;
   }

   export async function paginate<T, TWhere = any, TOrderBy = any, TInclude = any, TSelect = any>(
     params: PaginateParams<any, TWhere, TOrderBy, TInclude, TSelect>,
   ): Promise<PaginatedResponse<T>> {
     const { delegate, query, where, orderBy, include, select } = params;
     const page = query.page ?? 1;
     const limit = query.limit ?? 20;
     const skip = (page - 1) * limit;

     const [data, total] = await Promise.all([
       delegate.findMany({ skip, take: limit, where, orderBy, include, select }),
       delegate.count({ where }),
     ]);

     const totalPages = Math.ceil(total / limit);

     return {
       data: data as T[],
       meta: {
         total,
         page,
         limit,
         totalPages,
         hasNext: page < totalPages,
         hasPrevious: page > 1,
       },
     };
   }
   ```

7. Create `back/src/common/pagination/index.ts` barrel.

### Phase 3: Seed Clothing Types

8. Create `back/prisma/seed-catalogs.ts`:
   - Read `../../harness/fixtures/clothing-types-seed.json` with `fs`.
   - For each section: `prisma.clothingSection.upsert` by `nameEn`.
   - For each type in a section: `prisma.clothingType.upsert` by `[sectionId, nameEn]`.
   - Log: `Seeded X sections, Y types`.
   - Wrap in `async function seedCatalogs(prisma: PrismaClient)`.

9. Add `db:seed:catalogs` script in `back/package.json`:
   ```json
   "db:seed:catalogs": "tsx prisma/seed-catalogs.ts"
   ```

10. Execute the seed:
    ```bash
    pnpm db:seed:catalogs
    ```
    Verify with `pnpm prisma studio` or a quick Prisma query that 13 sections
    and 149 types exist.

### Phase 4: Catalogs Module — Backend

11. Create domain entities in `back/src/modules/catalogs/domain/`:
    - `clothing-section.ts`: type-only or class. No NestJS/Prisma imports.
    - `clothing-type.ts`: type-only or class. No NestJS/Prisma imports.
    These are plain data containers. Use `readonly` where appropriate.

12. Create `CatalogRepository` interface in `application/ports/catalog-repository.ts`:
    ```typescript
    import { PaginatedResponse } from "../../../common/pagination/paginated-response.dto";
    
    export interface ClothingTypeFilters {
      sectionId?: string;
      active?: boolean;
      search?: string;
    }
    
    export interface CatalogRepository {
      findClothingTypes(query: any, filters: ClothingTypeFilters): Promise<PaginatedResponse<any>>;
    }
    ```

13. Create `PrismaCatalogRepository` in `infrastructure/repositories/`:
    - Inject `PrismaService`.
    - Build `where` from filters: `active` → exact match; `sectionId` → exact
      match; `search` → `OR` on `nameEn`/`nameEs` (case-insensitive via
      Prisma `mode: "insensitive"`).
    - Call `paginate()`. Include `section` relation so the response carries
      section names.

14. Create `ClothingTypeQueryDto` extending `PaginatedQueryDto`:
    - `sectionId?: string` (optional UUID filter).
    - `active?: boolean` (optional; omit to show all).

15. Create `ClothingTypeResponseDto` and a list response wrapper using
    `PaginatedResponse`.

16. Create `ClothingTypesController`:
    ```typescript
    @Controller("catalogs/clothing-types")
    @UseGuards(SessionAuthGuard)
    export class ClothingTypesController {
      constructor(private readonly repo: CatalogRepository) {}
    
      @Get()
      @RequirePermissions(Permission.AdminWorkspace)
      findAll(@Query() query: ClothingTypeQueryDto) {
        return this.repo.findClothingTypes(query, {
          sectionId: query.sectionId,
          active: query.active,
          search: query.search,
        });
      }
    
      @Get("dropdown")
      @RequirePermissions(Permission.OperatorWorkspace)
      findForDropdown() {
        // Active-only, sorted by displayOrder, no pagination — used by operator forms
      }
    }
    ```

17. Create `CatalogsModule`:
    ```typescript
    @Module({
      imports: [IdentityModule],
      controllers: [ClothingTypesController],
      providers: [
        { provide: CatalogRepository, useClass: PrismaCatalogRepository },
      ],
      exports: [CatalogRepository],
    })
    export class CatalogsModule {}
    ```

18. Import `CatalogsModule` into `AppModule`.

19. **Verify backend:** Start the server, call `GET /api/v1/catalogs/clothing-types?page=1&limit=10` as Admin. Confirm paginated response with `meta.total`, `data[0].section.nameEn`, correct counts.

### Phase 5: Frontend — Catalog Display

20. Create `front/src/lib/api-types.ts` with TypeScript interfaces:
    ```typescript
    export interface PaginationMeta {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    }
    
    export interface PaginatedResponse<T> {
      data: T[];
      meta: PaginationMeta;
    }
    
    export interface ClothingTypeDto {
      id: string;
      nameEn: string;
      nameEs: string;
      displayOrder: number;
      active: boolean;
      metadata: Record<string, unknown>;
      sectionId: string;
      section: { id: string; nameEn: string; nameEs: string };
    }
    
    export interface ClothingTypeQueryParams {
      page?: number;
      limit?: number;
      search?: string;
      sectionId?: string;
      active?: boolean;
    }
    ```

21. Create `front/src/components/ui/Pagination.tsx`:
    - A functional component that renders:
      - "Anterior" / "Siguiente" buttons (disabled at boundaries).
      - Page number buttons: `1 ... [current-1] [current] [current+1] ... N`
        (ellipsis for large page counts).
      - "Mostrando X-Y de Z resultados" summary line.
    - Use existing CSS variables for colors. Add specific `.pagination` and
      `.pagination-btn` classes to `styles.css`.

22. Create `front/src/features/catalogs/hooks/use-paginated-query.ts`:
    ```typescript
    import { useQuery, keepPreviousData } from "@tanstack/react-query";
    import { useState } from "react";
    import { api } from "../../../lib/api-client";
    
    export function usePaginatedQuery<T>(
      queryKey: string[],
      url: string,
      defaultParams: Record<string, unknown> = {},
    ) {
      const [params, setParams] = useState({ page: 1, limit: 20, ...defaultParams });
      
      const query = useQuery({
        queryKey: [...queryKey, params],
        queryFn: () => api.get<T>(url, { params }),
        placeholderData: keepPreviousData,
      });
      
      return { ...query, params, setParams };
    }
    ```
    Note: `api.get` currently doesn't accept config — update it to accept an
    optional second parameter `config?: AxiosRequestConfig` and pass it to
    `client.get(url, config)`. Or create a new wrapper: `api.getPaginated<T>(url, params)`.

    **Decision:** Add a `config` parameter to the existing `api.get`:
    ```typescript
    // In api-client.ts:
    const get: ApiClient["get"] = async (path, config) => {
      const res = await client.get<T>(path, config);
      return res.data;
    };
    ```

23. Create `front/src/features/catalogs/CatalogTable.tsx`:
    - A generic table component using vanilla `<table>` elements.
    - Props:
      ```typescript
      interface CatalogTableProps<T> {
        columns: { key: string; label: string; render?: (item: T) => ReactNode }[];
        data: T[];
        isLoading: boolean;
        emptyMessage?: string;
      }
      ```
    - Renders `<thead>` with column labels, `<tbody>` with rows.
    - Loading state: show a "Cargando..." overlay or skeleton rows.
    - Empty state: show `emptyMessage` (default: "No se encontraron resultados").
    - Use `.data-table` CSS class already in `styles.css` or add minimal styles.

24. Create `front/src/features/catalogs/ClothingTypesPage.tsx`:
    - Uses `usePaginatedQuery<PaginatedResponse<ClothingTypeDto>>` with
      URL `/catalogs/clothing-types`.
    - Renders `CatalogTable` with columns:
      - Sección (section.nameEs)
      - Tipo (nameEs)
      - Activo (active → badge: "Activo" green / "Inactivo" gray)
      - Orden (displayOrder)
    - Below the table, renders `<Pagination>` with `meta` from response.

25. Update `front/src/routes.tsx`:
    - Import `ClothingTypesPage`.
    - Replace the `/admin/catalogs` PlaceholderPage route with:
      ```tsx
      <Route index element={<ClothingTypesPage />} />
      ```

### Phase 6: Verification

26. **End-to-end manual test:**
    - Start backend (`pnpm dev` in `back/`).
    - Start frontend (`pnpm dev` in `front/`).
    - Login as Admin.
    - Navigate to "Catálogos".
    - Confirm: table shows 149 clothing types paginated 20 per page.
    - Click page 2 → confirm data changes.
    - Confirm "Mostrando 1-20 de 149 resultados" / "Mostrando 21-40 de 149".
    - Login as Operator → confirm `/admin/catalogs` shows 403 or redirects.
    - Call `GET /api/v1/catalogs/clothing-types/dropdown` as Operator —
      confirm active-only compact list returns.

27. **Backend tests (vitest):**
    - Unit test for `paginate()` helper: verify correct `skip`/`take`,
      parallel execution, hard limit enforcement.
    - Unit test for `PrismaCatalogRepository.findClothingTypes` with in-memory
      Prisma delegate or mocked PrismaService.
    - E2E test for `GET /catalogs/clothing-types` with auth headers: 200 for
      Admin with data+meta, 200 for Operator with data+meta, 403 for
      unauthenticated.
    - Architecture test: confirm `domain/` files import no NestJS/Prisma.

28. **Frontend TypeScript compile:** `tsc -b` in `front/` must pass.

---

## Interface Contracts

### `PaginatedQueryDto` (base)
```
?page=1           int, min 1, default 1
?limit=20         int, min 1, max 100, default 20
?search=          string, optional
?sortBy=          string, optional
?sortOrder=asc    "asc" | "desc", default "asc"
```

### `GET /api/v1/catalogs/clothing-types` (Admin/Operator)
```
Queries: all PaginatedQueryDto fields + ?sectionId=uuid&active=true
Response 200:
{
  "data": [
    {
      "id": "uuid",
      "nameEn": "Hoodies",
      "nameEs": "Sudaderas con capucha",
      "displayOrder": 1,
      "active": true,
      "metadata": {},
      "sectionId": "uuid",
      "section": { "id": "uuid", "nameEn": "Activewear", "nameEs": "Ropa deportiva" },
      "createdAt": "2026-07-07T...",
      "updatedAt": "2026-07-07T..."
    }
  ],
  "meta": {
    "total": 149,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### `Pagination` Component
```
Props:
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void

Renders:
  [Anterior] 1 ... 4 [5] 6 ... 8 [Siguiente]
  Mostrando 81–100 de 149 resultados
```

---

## Acceptance Criteria

1. `pnpm db:seed:catalogs` populates 13 sections + 149 types in local
   PostgreSQL. Re-run is idempotent (no duplicates, no errors).
2. `GET /api/v1/catalogs/clothing-types?page=1&limit=20` returns 20 items
   with correct `meta.total = 149` and `meta.totalPages = 8`.
3. Changing `limit=50` returns 50 items with `meta.totalPages = 3`.
4. Filter `?sectionId=<uuid>` returns only types for that section.
5. Filter `?search=cami` matches "Camiseta", "Camisa", "Camisón".
6. Filter `?active=false` returns inactive types only (all active by default).
7. Operator cannot access `/admin/catalogs` in the frontend (403 or redirect).
8. Frontend pagination controls navigate pages without full-page reload.
9. `tsc -b` passes in both `back/` and `front/`.
10. `vitest` passes all new tests in `back/`.
11. Architecture test confirms `domain/` files have zero NestJS/Prisma imports.

---

## Risks

- **`class-validator` + `ValidationPipe` may break existing DTOs** if any
  existing controllers receive unexpected query params. Mitigation:
  `whitelist: true` strips unknown fields silently. Test all existing auth
  endpoints after registering the pipe.
- **Search performance on 149 rows is trivial** now, but the pattern must
  scale. The `mode: "insensitive"` on `search` should include a note that
  PostgreSQL `ILIKE` is acceptable for catalogs (<10K rows) but large
  inventories (F6) may need `pg_trgm` indexes. Add a comment in the code.
- **Frontend `api-client.ts` change** (adding `config` param) is backward
  compatible since the param defaults to `undefined`.

---

## Non-Goals (Explicit)

- This handoff does NOT implement CRUD (create/update/delete) for clothing
  types. That follows in a subsequent handoff once the paginated read pattern
  is validated.
- This handoff does NOT implement the other 8 catalog entities.
- This handoff does NOT implement CSV/JSON export (FR-CAT-007 P2).
- This handoff does NOT implement inventory filtering (FR-CAT-008/US-021).
- No commit, push, or deploy — local verification only.
