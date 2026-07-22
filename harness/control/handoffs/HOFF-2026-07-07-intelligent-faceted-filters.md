# HOFF-2026-07-07-intelligent-faceted-filters

## Objective

Reemplazar el sistema actual de filtros del inventario (que carga todos los
catálogos completos) por un sistema de **faceted search** que solo muestra
opciones de filtro con items reales en inventario, con conteos visibles, y
separación visual entre "Con inventario" y "Sin inventario".

## Context

Actualmente:

- `FilterBar` usa `useCatalogOptions` → 3 llamadas `GET /catalogs/brands`,
  `categories`, `sizes` que traen **todos** los registros del catálogo.
- Si hay 20 marcas en catálogo pero solo 5 tienen items, se muestran las 20.
- No hay conteos visibles ni separación entre opciones con/sin inventario.
- El usuario quiere ver de inmediato qué marcas/categorías/tallas **realmente**
  tienen producto adquirido y no vendido.

La solución se basa en **Faceted Search** (navegación por facetas), el patrón
estándar usado por Amazon, Shopify, Algolia y Elasticsearch.

## Source Docs

- Plan: `harness/control/plans/NEXO-0028-intelligent-faceted-filters.md`
- SRS: `docs/spec/SRS.md` (FR-CAT-008, FR-INV-006)
- Design spec: `docs/design/inventory-design-spec.md` (sección 4.2 FilterBar)
- Prisma schema: `back/prisma/schema.prisma`
- Catálogos existentes: `back/src/modules/catalogs/`
- Inventario existente: `back/src/modules/inventory/`
- FilterBar actual: `front/src/features/inventory/components/FilterBar.tsx`
- Zustand store: `front/src/features/inventory/store/inventory-ui.store.ts`

## Files To Create

| File | Purpose |
|---|---|
| `back/src/modules/inventory/interface/http/dto/facet-query.dto.ts` | DTO para el endpoint de facetas (mismos filtros que ItemQueryDto, sin paginación) |
| `back/src/modules/inventory/application/facet-counts.interface.ts` | Interfaz `FacetCounts` (tipos de retorno) |
| `front/src/features/inventory/hooks/use-faceted-filters.ts` | Hook que consume `GET /inventory/items/facets` |

## Files To Modify

| File | Change |
|---|---|
| `back/src/modules/inventory/application/ports/inventory-repository.ts` | Agregar `findFacets(filters): Promise<FacetCounts>` |
| `back/src/modules/inventory/application/item.service.ts` | Agregar método `getFacets(filters)` |
| `back/src/modules/inventory/infrastructure/repositories/prisma-inventory.repository.ts` | Implementar `findFacets` con `groupBy` + resolución de nombres |
| `back/src/modules/inventory/interface/http/items.controller.ts` | Agregar endpoint `GET /facets` |
| `front/src/features/inventory/types/item.ts` | Agregar tipos `FacetCounts`, `FacetOption` |
| `front/src/features/inventory/store/inventory-ui.store.ts` | Agregar `colorId`, `conditionId` (ya existen en el DTO backend) |
| `front/src/features/inventory/hooks/use-inventory-list.ts` | Agregar `colorId` y `conditionId` a `buildParams` |
| `front/src/features/inventory/components/FilterBar.tsx` | Reescritura: consumir `useFacetedFilters` en lugar de `useCatalogOptions` |
| `front/src/features/inventory/views/InventoryPage.tsx` | Pasar `colorId`, `conditionId` al FilterBar (si se agregan) |

## Implementation Steps

### Backend (Steps 1-8)

#### 1. Crear `facet-query.dto.ts`

```typescript
// back/src/modules/inventory/interface/http/dto/facet-query.dto.ts
import { IsOptional, IsString, IsEnum } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { ItemStatus } from "../../../domain/item-status.enum";

export class FacetQueryDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  brandId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  conditionId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  sizeId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  colorId?: string;

  @ApiPropertyOptional({ enum: ItemStatus })
  @IsOptional() @IsEnum(ItemStatus)
  status?: ItemStatus;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  purchaseId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  search?: string;
}
```

#### 2. Crear interfaz `FacetCounts`

```typescript
// back/src/modules/inventory/application/facet-counts.interface.ts
export interface FacetOption {
  id?: string;        // UUID para catálogos (brand, category, etc.)
  value: string;      // Valor (enum para status, name para catálogos)
  label: string;       // Label presentable
  count: number;       // Conteo de items
}

export interface FacetCounts {
  statuses: FacetOption[];
  brands: FacetOption[];
  categories: FacetOption[];
  sizes: FacetOption[];
  conditions: FacetOption[];
  colors: FacetOption[];
}
```

#### 3. Extender `InventoryRepository`

Agregar al port `inventory-repository.ts`:

```typescript
import type { FacetCounts } from "../facet-counts.interface";

// En la interfaz InventoryRepository:
findFacets(filters: ItemFilters): Promise<FacetCounts>;
```

#### 4. Implementar `findFacets` en `PrismaInventoryRepository`

Patrón por cada dimensión (ejemplo para brands):

```typescript
async findFacets(filters: ItemFilters): Promise<FacetCounts> {
  const where = this.buildFacetWhere(filters);

  // Status — directo del enum, sin FK
  const statusGroups = await this.prisma.item.groupBy({
    by: ["status"],
    where,
    _count: { id: true },
  });

  // Brands — groupBy brandId, luego resolver nombres
  const brandGroups = await this.prisma.item.groupBy({
    by: ["brandId"],
    where,
    _count: { id: true },
  });
  const brandMap = await this.resolveNames("brand", brandGroups.map(g => g.brandId));

  // Repetir para category, size, condition, color...

  return {
    statuses: statusGroups.map(g => ({
      id: undefined,
      value: g.status,
      label: STATUS_LABELS[g.status] ?? g.status,
      count: g._count.id,
    })),
    brands: brandGroups.map(g => ({
      id: g.brandId,
      value: g.brandId,
      label: brandMap.get(g.brandId) ?? g.brandId,
      count: g._count.id,
    })),
    // ... resto de dimensiones
  };
}

private buildFacetWhere(filters: ItemFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (filters.brandId) where.brandId = filters.brandId;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  // etc...
  return where;
}

private async resolveNames(
  entity: string, ids: string[]
): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  // Usar PrismaService directo o dynamic delegate
  const records = await (this.prisma as any)[entity].findMany({
    where: { id: { in: [...new Set(ids)] } },
    select: { id: true, name: true },
  });
  return new Map(records.map((r: any) => [r.id, r.name]));
}
```

Nota: Si el filtro `search` está presente, hay que agregarlo al `where` con
`contains` sobre `productName` o `internalCode`.

#### 5. Agregar `getFacets` en `ItemService`

Delegar al repository:

```typescript
async getFacets(filters: ItemFilters) {
  return this.repo.findFacets(filters);
}
```

#### 6. Agregar endpoint en `ItemsController`

```typescript
@Get("facets")
@ApiOperation({ summary: "Obtener conteos de facetas para filtros" })
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@RequirePermissions(Permission.OperatorWorkspace)
getFacets(@Query() query: FacetQueryDto) {
  return this.service.getFacets({
    brandId: query.brandId,
    categoryId: query.categoryId,
    conditionId: query.conditionId,
    sizeId: query.sizeId,
    colorId: query.colorId,
    status: query.status,
    purchaseId: query.purchaseId,
  });
}
```

**IMPORTANTE:** El endpoint `facets` debe ir **ANTES** de `:id` en el
controlador, o NestJS interpretará "facets" como un `:id`. Si el orden no es
suficiente, usar una ruta explícita.

#### 7-8. Tests

- Unit test: mockear `InventoryRepository.findFacets`, verificar que
  `ItemService.getFacets` retorna lo esperado.
- Integration test: con seed de 17 items ACQUIRED_STOCK, llamar
  `GET /inventory/items/facets` y verificar conteos correctos por marca,
  categoría, talla, condición, color.
- Verificar 401 sin autenticación.
- Verificar que al pasar `?status=SOLD`, las facetas solo cuentan items SOLD.

### Frontend (Steps 9-14)

#### 9. Tipos en `item.ts`

Agregar:

```typescript
export interface FacetOption {
  id?: string;
  value: string;
  label: string;
  count: number;
}

export interface FacetCounts {
  statuses: FacetOption[];
  brands: FacetOption[];
  categories: FacetOption[];
  sizes: FacetOption[];
  conditions: FacetOption[];
  colors: FacetOption[];
}
```

#### 10. Hook `useFacetedFilters`

```typescript
// front/src/features/inventory/hooks/use-faceted-filters.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/common/services/api-client";
import type { FacetCounts, InventoryFilters } from "../types/item";

export function useFacetedFilters(filters: InventoryFilters) {
  const params: Record<string, unknown> = {};
  if (filters.search) params.search = filters.search;
  if (filters.status && filters.status !== "all") params.status = filters.status;
  if (filters.brandId) params.brandId = filters.brandId;
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.sizeId) params.sizeId = filters.sizeId;
  // conditionId, colorId cuando se agreguen al store

  return useQuery({
    queryKey: ["inventory", "facets", params],
    queryFn: () => api.get<FacetCounts>("inventory/items/facets", params),
    staleTime: 30_000,
    placeholderData: (prev) => prev, // keepPreviousData
  });
}
```

#### 11-12. Reescritura de `FilterBar`

Cambios principales:

- Cambiar `useCatalogOptions()` → `useFacetedFilters(filters)`.
- Recibir `filters` completos como prop (search, status, brandId, categoryId,
  sizeId) para pasarlos al hook.
- Renderizar cada `<Select>` con los `FacetOption[]` correspondientes.
- Formato de opción: `"Nike (7)"`.
- Agrupar: opciones con count > 0 en el grupo principal; opciones con count
  === 0 en un grupo colapsable (usando `<details>` + `<summary>` nativo para
  evitar dependencia extra).

**Comportamiento clave:** si el usuario selecciona un filtro (ej: brand=Nike),
las facetas se recalculan automáticamente porque el hook recibe los filtros
como query params y TanStack Query refetcha al cambiar la key.

#### 13. Sección "Sin inventario" colapsada

```tsx
{zeroCountOptions.length > 0 && (
  <details className="mt-2 text-xs text-muted-foreground">
    <summary className="cursor-pointer hover:text-foreground">
      Sin inventario ({zeroCountOptions.length})
    </summary>
    <div className="mt-1 space-y-0.5 pl-3">
      {zeroCountOptions.map((opt) => (
        <div key={opt.value} className="opacity-50 line-through">
          {opt.label}
        </div>
      ))}
    </div>
  </details>
)}
```

Las opciones con count=0 NO deben ser seleccionables (o si lo son, no
deberían devolver resultados — la API de listado simplemente retornaría 0
items, lo cual es aceptable).

#### 14. Verificación

- `pnpm dev` back + front, login Admin, `/admin/inventory`.
- Dropdowns solo muestran marcas/categorías/tallas con items reales.
- Conteos visibles: "Nike (3)", "Adidas (5)".
- "Sin inventario" colapsado al final.
- Al cambiar filtro de estado, las facetas se recalculan.
- Al buscar texto, las facetas se reducen.
- Sin regresiones en funcionalidad existente.

## Verification

1. `pnpm test` en `back/` — todos los tests pasan (incluyendo nuevos tests de
   facetas).
2. `GET /api/v1/inventory/items/facets` con Postman/Scalar:
   - Sin filtros → devuelve conteos de todos los items.
   - `?status=ACQUIRED_STOCK` → solo items adquiridos.
   - `?brandId=<nike-id>` → facetas limitadas a items Nike.
   - `?search=camisa` → facetas limitadas a items que contengan "camisa".
3. Frontend: levantar `pnpm dev`, login Admin, `/admin/inventory`:
   - Dropdown "Marca": solo marcas con items (con conteo).
   - Dropdown "Categoría": solo categorías con items.
   - Dropdown "Talla": solo tallas con items.
   - Opciones sin inventario en sección colapsada.
   - Al seleccionar filtro, los otros dropdowns se actualizan.

## Risks

1. **Prisma `groupBy` sin `include`**: requiere queries adicionales para
   resolver nombres de FK. Para 17 items (y hasta ~1000), son ~5 queries
   extra (una por dimensión) — despreciable. Si escala a >10K items, migrar a
   `$queryRaw` con JOINs.

2. **Endpoint `facets` vs ruta `:id`**: NestJS puede interpretar `facets`
   como un `:id`. Solución: poner `@Get("facets")` antes de `@Get(":id")` en
   el controlador, o usar una ruta fija como `@Get("facets")` que NestJS
   prioriza sobre rutas parametrizadas. Si aún falla, renombrar a
   `filter-facets` o `facet-counts`.

3. **Flickering en frontend**: al escribir en el search (debounce 300ms), las
   facetas se recalculan y puede haber un breve flash de datos viejos.
   Mitigación: `placeholderData: (prev) => prev` en TanStack Query.

4. **Filtros de condición y color**: el frontend actual no tiene dropdowns
   para condition y color (aunque el backend los soporta). El endpoint de
   facetas los devuelve desde ya para consumo futuro que estén listos.

## Acceptance Criteria

- [ ] `GET /inventory/items/facets` devuelve conteos correctos agrupados por
  status, brand, category, size, condition, color.
- [ ] Las facetas responden al contexto de filtros activos.
- [ ] Frontend `FilterBar` usa `useFacetedFilters`, no `useCatalogOptions`.
- [ ] Dropdowns muestran opciones con count > 0 visibles; count === 0 en
  sección colapsada.
- [ ] Conteos visibles en cada opción.
- [ ] Tests unitarios y de integración pasan.
- [ ] Navegación manual en `/admin/inventory` confirma comportamiento.

## Receiving Agent

`nexo-build` — es quien tiene acceso de escritura al backend NestJS, frontend
React, y Prisma. No se requiere `nexo-infra` ni `nexo-security` para esta
implementación (no hay cambios de infraestructura ni nuevos secretos).
