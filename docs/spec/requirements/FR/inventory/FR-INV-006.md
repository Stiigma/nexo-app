# FR-INV-006: Buscar inventario

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-INV-006 |
| **Título** | Buscar inventario |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Inventory |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §7 — Inventario |
| **Dueño** | Nexo project |
| **Dependencias** | FR-CAT-008 (filtros por catálogo) |
| **Stories vinculadas** | US-015, US-021 |

## Declaración

El sistema debe permitir buscar prendas en inventario por código interno,
categoría, marca, talla y cliente.

## Racional

Los operadores necesitan encontrar prendas rápidamente para consultar, reservar
o vender.

## Criterio de Aceptación

- Dado que existe inventario,
  cuando busco por código interno,
  entonces la prenda correspondiente se muestra.

- Dado que existen prendas con distintos atributos,
  cuando busco por categoría, marca o talla,
  entonces las prendas que coinciden se muestran.

- Dado que combino búsqueda textual con filtros de catálogo,
  cuando aplico ambos,
  entonces los resultados cumplen ambas condiciones.

## Método de Verificación

- [ ] Prueba de integración: búsqueda por código, categoría, marca, talla.
- [ ] Demo: Barra de búsqueda y filtros funcionales en UI.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `interface/http/items.controller.ts` — endpoint GET /items con query params
  - `interface/http/dto/item-query.dto.ts` — DTO de búsqueda
  - `application/item.service.ts` — lógica de búsqueda
  - `infrastructure/repositories/prisma-inventory.repository.ts` — consultas

### Frontend
- Feature: `front/src/features/inventory/`
  - `components/FilterBar.tsx` — barra de filtros
  - `hooks/use-inventory-list.ts` — hook de listado con filtros
  - `hooks/use-faceted-filters.ts` — filtros por facetas

## Notas

- P1: Funcionalidad importante pero el MVP puede funcionar con listado completo.
- Los filtros por catálogo se definen en FR-CAT-008.
