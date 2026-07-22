# FR-CAT-008: Filtros de inventario por catálogo

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-CAT-008 |
| **Título** | Filtros de inventario por catálogo |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Catalogs |
| **Prioridad** | P2 |
| **MoSCoW** | Could |
| **Estado** | Implemented |
| **Fuente** | `NEXO_PROJECT.md` §7 — Inventario |
| **Dueño** | Nexo project |
| **Dependencias** | FR-CAT-001 a FR-CAT-006 (catálogos), FR-INV-006 (búsqueda) |
| **Stories vinculadas** | US-021 |

## Declaración

La vista de inventario debe permitir filtrar prendas por marca, tipo de ropa,
tienda, categoría, talla, condición y color. Las opciones de filtro deben
poblarse desde los catálogos activos.

## Racional

Los filtros por catálogo son la forma más rápida de encontrar prendas en un
inventario que puede crecer a cientos o miles de items.

## Criterio de Aceptación

- Dado que abro la vista de inventario,
  cuando los filtros se cargan,
  entonces veo selectores poblados con valores activos de marca, clothing type,
  tienda, categoría, talla, condición y color.

- Dado que selecciono uno o más filtros,
  cuando los aplico,
  entonces la lista de prendas se reduce a las que coinciden.

- Dado que limpio los filtros,
  cuando la lista se refresca,
  entonces veo todas las prendas nuevamente.

## Método de Verificación

- [ ] Demo: Filtros funcionales en la UI de inventario.
- [ ] Prueba de integración: endpoint GET /items?brandId=&categoryId= devuelve filtrados.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `interface/http/dto/item-query.dto.ts` — query params de filtrado
  - `application/item.service.ts` — lógica de filtrado
  - `application/facet-counts.interface.ts` — interfaz de facetas
  - `application/__tests__/item.service-facets.spec.ts` — pruebas de facetas

### Frontend
- Feature: `front/src/features/inventory/`
  - `components/FilterBar.tsx` — barra de filtros con selects
  - `hooks/use-faceted-filters.ts` — hook de filtrado por facetas
  - `hooks/use-catalog-options.ts` — opciones de catálogo

## Notas

- Implementado en frontend y backend.
- Los valores inactivos no aparecen en los filtros.
