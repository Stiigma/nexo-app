# NEXO-0028 - Filtrado Inteligente por Facetas (Faceted Search)

## Feature Metadata

- Feature: F2/F6 (cruce entre catálogos operativos e inventario).
- Depends on: `NEXO-0008` (catálogos activos), frontend inventory existente.
- Primary agent: `nexo-build`.
- Required gates: QA review antes de closeout.
- Linked SRS requirements: FR-CAT-008, FR-INV-006, FR-REP-004.
- Trigger: iniciativa del usuario para filtrado más inteligente.

## Business Objective

Cuando un operador o admin abre la vista de inventario, los filtros deben mostrar
**solo los valores que realmente tienen items en inventario**, con conteos
visibles, en lugar de desplegar todos los catálogos indiscriminadamente. Las
categorías/marcas/tallas sin items en inventario deben colapsarse u omitirse.

Esto elimina carga cognitiva, acelera la navegación, y responde inmediatamente
la pregunta: "¿de qué marcas/categorías/tallas tengo inventario?"

## Domain Rules

- Los filtros se alimentan de los items reales en BD, no del catálogo completo.
- Los conteos de facetas dependen de los filtros ya activos (filter-dependent).
- Una faceta con count=0 no se muestra como opción seleccionable (pero puede
  listarse en una sección colapsada "Sin inventario").
- El endpoint de facetas acepta los mismos parámetros de filtro que el endpoint
  de listado (status, brandId, categoryId, sizeId, conditionId, colorId,
  purchaseId, search).
- Estados no-vendidos por defecto: `ACQUIRED_STOCK` + `AVAILABLE` (no
  `RESERVED` a menos que el filtro de estado sea "Todos").

## Done When

- Backend expone `GET /api/v1/inventory/items/facets` que devuelve conteos
  agrupados por status, brand, category, size, condition, color.
- Las facetas aceptan filtros activos como contexto (p.ej., si filtro por
  marca Nike, las categorías devueltas solo cuentan items Nike).
- Frontend `FilterBar` consume el endpoint de facetas en lugar del catálogo
  completo.
- Los dropdowns de filtro muestran opciones con `count > 0` primero, separadas
  visualmente de las opciones con `count === 0` (colapsadas por defecto).
- Cada opción muestra su conteo: "Nike (7)", "Adidas (5)", etc.
- Al cambiar un filtro, las facetas se recalculan automáticamente.
- Los filtros que no están en el alcance actual del frontend (condition,
  color) quedan preparados en el endpoint para consumo futuro.
- Tests unitarios y de integración para el endpoint de facetas.
- No se rompe el comportamiento existente de filtrado.

## Scope

- Backend: nuevo endpoint `GET /inventory/items/facets` con agregaciones
  `GROUP BY` + `COUNT` por dimensión.
- Backend: nuevo método `findFacets` en `InventoryRepository` +
  `PrismaInventoryRepository`.
- Backend: nuevo DTO `FacetQueryDto` (hereda filtros de `ItemQueryDto` sin
  paginación).
- Frontend: nuevo hook `useFacetedFilters` que consume el endpoint de facetas.
- Frontend: `FilterBar` reescrito para usar `useFacetedFilters` en lugar de
  `useCatalogOptions`.
- Frontend: opciones con conteos visibles; separación visual "Con inventario" /
  "Sin inventario".
- Tests: unitarios para el servicio de facetas; integración para el endpoint.

## Out Of Scope

- Cambiar el endpoint de listado (`GET /inventory/items`).
- Modificar los endpoints de catálogos.
- Cambiar la UI de catálogos admin.
- Reportes con breakdown por facetas (eso es NEXO-0016 / FR-CAT-009).
- Búsqueda full-text o autocomplete (eso es F6 / NEXO-0012).

## Acceptance Criteria

- Al abrir `/admin/inventory` con 17 items `ACQUIRED_STOCK`, los dropdowns de
  filtro solo muestran marcas/categorías/tallas/condiciones/colores que
  aparecen en esos 17 items.
- Si cambio el filtro de estado a `SOLD` y no hay items vendidos, todos los
  dropdowns excepto "Estado" deben quedar vacíos o mostrar solo "Sin inventario".
- Si selecciono marca "Nike", las categorías disponibles se limitan a las que
  tienen items Nike.
- Cada opción muestra el conteo entre paréntesis.
- Las opciones con count=0 aparecen en una sección colapsable "Sin inventario
  (0)" si el usuario quiere verlas.
- El filtro de búsqueda por texto (search) reduce las facetas correctamente.
- Los tests pasan: `pnpm test` en back/ sin regresiones.

## Required Tests

- Unit: `ItemService.getFacets()` devuelve agregaciones correctas.
- Unit: `FacetQueryDto` valida correctamente.
- Integration: `GET /api/v1/inventory/items/facets` con y sin filtros activos.
- Integration: endpoint rechaza usuario no autenticado (401).
- UI manual: verificar que los dropdowns solo muestran opciones con inventario
  real.

## Steps

1. Backend — crear `FacetQueryDto` en `dto/facet-query.dto.ts` (extiende
   filtros de `ItemQueryDto`, sin paginación).
2. Backend — extender `InventoryRepository` con `findFacets(filters)` que
   devuelva `FacetCounts`.
3. Backend — implementar `findFacets` en `PrismaInventoryRepository` usando
   `prisma.item.groupBy()` por cada dimensión (status, brandId, categoryId,
   sizeId, conditionId, colorId). Incluir `_count` y resolver nombres de FK
   con queries adicionales o joins con `$queryRaw`.
4. Backend — agregar método `getFacets` en `ItemService`.
5. Backend — agregar endpoint `GET /inventory/items/facets` en
   `ItemsController`.
6. Backend — documentar el nuevo endpoint en OpenAPI/Scalar (`@ApiOperation`,
   `@ApiQuery`).
7. Backend — tests unitarios para `ItemService.getFacets`.
8. Backend — tests de integración para el endpoint.
9. Frontend — crear tipo `FacetCounts` y `FacetOption` en
   `features/inventory/types/`.
10. Frontend — crear hook `useFacetedFilters(filters)` que llame al endpoint
    de facetas con TanStack Query, pasando los filtros activos como query params.
11. Frontend — reescribir `FilterBar` para consumir `useFacetedFilters` en
    lugar de `useCatalogOptions`.
12. Frontend — cada `<Select>` muestra opciones con conteo: `"Nike (7)"`.
13. Frontend — agrupar opciones: "Con inventario" (count > 0) visibles
    primero, "Sin inventario" (count === 0) colapsadas (usando
    `<Collapsible>` de shadcn/ui o un simple details/summary).
14. Frontend — verificar que el debounce de búsqueda (300ms) también aplica
    al recalcular facetas.
15. Ejecutar `pnpm test` y `pnpm test:e2e` para asegurar cero regresiones.
16. QA manual: levantar servidores, login Admin, navegar a `/admin/inventory`,
    verificar dropdowns inteligentes.
17. Escribir reporte de verificación y closeout.

## Technical Decisions

### Estrategia de agregaciones

Prisma `groupBy` es la primera opción porque es type-safe y portable. Para
dimensiones que necesitan resolver nombres (brand, category, size, condition,
color), hay dos enfoques:

**Opción A — groupBy + consultas adicionales (recomendado para v1):**
```typescript
// Paso 1: Agrupar items por brandId
const brandGroups = await this.prisma.item.groupBy({
  by: ["brandId"],
  where: baseWhere,
  _count: { id: true },
});
// Paso 2: Resolver nombres en batch
const brandIds = brandGroups.map((g) => g.brandId);
const brands = await this.prisma.brand.findMany({
  where: { id: { in: brandIds } },
  select: { id: true, name: true },
});
// Paso 3: Merge
```

Para 17 items (y escalando a cientos/miles), esto es perfectamente eficiente
(3-6 queries extra). Si en el futuro hay miles de items, se puede migrar a
`$queryRaw` con `LEFT JOIN` + `GROUP BY`.

### Endpoint vs metadata en respuesta de listado

Se elige **endpoint separado** (`/facets`) porque:
- Desacopla la paginación de las facetas (las facetas se necesitan aunque no
  haya resultados de listado).
- Permite al frontend cargar facetas en paralelo al listado.
- Sigue el patrón REST común (Algolia, Shopify Admin API, Elasticsearch
  `_search` con `aggs`).

### Comportamiento del filtro de estado por defecto

El frontend muestra inicialmente `status=all`, lo que significa que las
facetas cuentan items de cualquier estado. Si el usuario quiere ver solo
"adquirido no vendido", debe seleccionar `ACQUIRED_STOCK` (o `AVAILABLE`) en
el dropdown de estado.

Alternativa discutida: hacer que el default sea `ACQUIRED_STOCK`. Esto cambia
la experiencia actual que muestra "Todos". Se deja `all` como default por
consistencia con el comportamiento actual; el usuario elige el filtro de
estado que necesita.

## Decision Log

- 2026-07-07: **Faceted search, no catalog-driven filters.** Se migra de
  `useCatalogOptions` (catálogo completo) a `useFacetedFilters` (conteos desde
  items reales). El patrón es Faceted Search con filter-dependent counts,
  estándar en e-commerce. Endpoint separado `GET /inventory/items/facets`.
  Prisma `groupBy` como primera opción; `$queryRaw` con JOINs como fallback
  si la performance lo requiere.
- 2026-07-07: **Separación visual:** opciones con count > 0 visibles; count
  === 0 en sección colapsada "Sin inventario". No se eliminan del todo para
  que el usuario pueda ver qué catálogos existen aunque estén vacíos.

## Progress

- 2026-07-07: Plan creado por `nexo-plan` a partir de iniciativa del usuario.
  Handoff generado: `HOFF-2026-07-07-intelligent-faceted-filters.md`.
- 2026-07-07: **Implementado por `nexo-build`.** 13 archivos (4 nuevos, 9
  modificados). Backend: endpoint `GET /inventory/items/facets` con 6 `groupBy`
  en paralelo + resolución batch de nombres FK. Frontend: `FilterBar` reescrito
  con `useFacetedFilters` + conteos visibles + sección "Sin inventario"
  colapsada. 50 tests pasan (3 nuevos para `getFacets` unit test). Verificación
  manual pendiente con seed de 17 items.

## Risks

- Prisma `groupBy` no soporta `include` de relaciones, lo que requiere queries
  adicionales para resolver nombres. Mitigación: cache de nombres en memoria o
  una sola query batch por dimensión.
- Si hay miles de items, las agregaciones podrían ser lentas sin índices.
  Mitigación: PostgreSQL ya tiene índices en las FKs (creados por Prisma en
  las migraciones). Monitorear con `EXPLAIN ANALYZE` si es necesario.
- El frontend actual usa `useCatalogOptions` con `staleTime: 5min`. El nuevo
  hook de facetas debe tener un `staleTime` más corto (30s-1min) porque las
  facetas cambian al modificar filtros.
- Si el usuario escribe en el search y el debounce dispara el recálculo de
  facetas, podría haber flickering. Mitigación: `placeholderData:
  keepPreviousData` en TanStack Query.

## Verification

- El endpoint `/facets` devuelve conteos correctos con y sin filtros.
- Los dropdowns del frontend solo muestran opciones con inventario real.
- Con 17 items ACQUIRED_STOCK en la fixture actual, los dropdowns muestran las
  marcas/categorías/tallas correspondientes (no el catálogo completo de 149
  tipos de ropa).
- Sin regresiones en tests existentes.
