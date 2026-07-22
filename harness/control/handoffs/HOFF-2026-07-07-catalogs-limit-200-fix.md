# HOFF-2026-07-07 — Catalogs: Fix `limit=200` Bad Request in Inventory Dropdowns

## Metadata

- **Task ID:** NEXO-0008
- **Date:** 2026-07-07
- **Authoring agent:** nexo-plan
- **Receiving agent:** nexo-build
- **Status:** ready
- **Predecessors:** `HOFF-2026-07-07-catalogs-complete-implementation.md`,
  `HOFF-2026-07-07-catalogs-fix-500-and-tests.md`

## Objective

Eliminar los errores HTTP 400 `Bad Request: limit must not be greater than 100`
que aparecen en la vista de inventario (`/admin/inventory`) cuando se cargan las
opciones de los filtros desplegables (marca, categoría, talla).

## Context

La decisión de arquitectura de paginación de NEXO-0008 estableció un **hard
limit de 100 items por página** en el backend
(`back/src/common/pagination/paginated-query.dto.ts` usa `@Max(100)`).

El hook de frontend `useCatalogOptions` pide `limit: 200` para intentar traer
todas las opciones de catálogo de una sola vez. Eso viola la validación del DTO
y produce 400 en:

- `GET /api/v1/catalogs/brands?active=true&limit=200`
- `GET /api/v1/catalogs/categories?active=true&limit=200`
- `GET /api/v1/catalogs/sizes?active=true&limit=200`

Esto hace que los filtros de inventario no tengan datos y contribuye al mensaje
"No pudimos cargar el inventario" que ve el usuario.

## Source Docs

| Doc | Path | Why |
|---|---|---|
| Pagination DTO | `back/src/common/pagination/paginated-query.dto.ts` | Define `@Max(100)` |
| Pagination helper | `back/src/common/pagination/pagination.helper.ts` | Aplica `Math.min(limit, 100)` |
| F2 plan | `harness/control/plans/NEXO-0008-operational-catalogs.md` | Decisión de hard limit 100 |
| Journal | `harness/control/journal/2026-07-07.md` | Registra la decisión de límite 100 |

## Files To Create Or Modify

| # | File | Action | Purpose |
|---|---|---|---|
| 1 | `front/src/features/inventory/hooks/use-catalog-options.ts` | modify | Cambiar `limit: 200` → `limit: 100` en las 3 llamadas a `api.get` |

## Implementation Steps

1. Abrir `front/src/features/inventory/hooks/use-catalog-options.ts`.
2. Reemplazar `limit: 200` por `limit: 100` en:
   - Llamada a `catalogs/brands` (línea ~21)
   - Llamada a `catalogs/categories` (línea ~30)
   - Llamada a `catalogs/sizes` (línea ~39)
3. Verificar que no queden más `limit: 200` en el frontend.
4. Verificar TypeScript: `cd front && pnpm tsc -b` o `pnpm build`.
5. (Opcional) Levantar backend + frontend y confirmar que los tres endpoints
   devuelven 200 con `limit=100`.

## Verification

- `grep -R "limit: 200" front/src` no devuelve resultados.
- `cd front && pnpm build` compila sin errores.
- En DevTools, las peticiones a:
  - `/api/v1/catalogs/brands?active=true&limit=100`
  - `/api/v1/catalogs/categories?active=true&limit=100`
  - `/api/v1/catalogs/sizes?active=true&limit=100`
  responden 200 OK y devuelven la lista de opciones.
- Los filtros de inventario se llenan con marcas, categorías y tallas.

## Risks

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Si algún catálogo supera los 100 registros, el dropdown no mostrará todo | Funcionalidad incompleta a largo plazo | Es aceptable para v1. Cuando ocurra, implementar búsqueda/lazy-load en el dropdown o un endpoint dedicado `/options` sin paginado. |
| Otros hooks/pages usan `limit` > 100 | Mismo 400 en otras vistas | Verificar con `grep -R "limit:" front/src` antes de cerrar. |

## Acceptance Criteria

1. `front/src/features/inventory/hooks/use-catalog-options.ts` usa `limit: 100`
   en las 3 llamadas.
2. Los endpoints de brands/categories/sizes dejan de devolver 400 por exceso de
   `limit` en la vista de inventario.
3. El frontend compila y buildea sin errores.

## Non-Goals (Explicit)

- **No** cambiar el límite del backend (se mantiene `@Max(100)` por decisión de
  arquitectura).
- **No** implementar paginación real ni búsqueda en los dropdowns de inventario.
- **No** agregar nuevos endpoints `/options` despaginados.
- **No** commit, push, o deploy sin confirmación explícita del usuario.

## Required Gates

- **QA review:** no aplica (fix menor, verificación manual en local basta).
- **Security review:** no aplica.
- **User confirmation:** requerido antes de commit, push, o deploy.
