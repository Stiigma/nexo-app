# FR-REP-004: Reporte de inventario por estado

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-REP-004 |
| **Título** | Reporte de inventario por estado |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Reports |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §7 — Reportes |
| **Dueño** | Nexo project |
| **Dependencias** | FR-INV-004 (estados de inventario) |
| **Stories vinculadas** | US-009, US-010 |

## Declaración

El sistema debe generar un reporte de inventario que muestre cantidades
separadas por estado: acquired stock, available, reserved y sold.

## Racional

Este reporte es la vista más importante del negocio: saber qué hay, qué se puede
vender y qué se ha vendido.

## Criterio de Aceptación

- Dado que existen prendas en distintos estados,
  cuando genero el reporte de inventario,
  entonces veo el conteo de prendas en cada estado.

- Dado que filtro por estado,
  cuando aplico el filtro,
  entonces veo solo las prendas en ese estado.

## Método de Verificación

- [ ] Demo: Reporte de inventario con filtro por estado.
- [ ] Prueba de integración: GET /api/v1/reports/inventory devuelve conteos por estado.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `interface/http/items.controller.ts` — endpoint con filtro de estado
  - `infrastructure/repositories/prisma-inventory.repository.ts` — consultas agregadas

### Frontend
- Feature: `front/src/features/inventory/`
  - `components/HeroDashboard.tsx` — dashboard con stats
  - `hooks/use-inventory-stats.ts` — estadísticas
  - `views/InventoryPage.tsx` — listado con filtros

## Notas

- Parcialmente implementado (vista de inventario con filtros y stats).
- Reporte formal como página independiente es futuro.
