# FR-SAL-006: Marcar prendas como vendidas

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-SAL-006 |
| **Título** | Marcar prendas como vendidas |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Sales |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §6 — Flujo: vender prenda |
| **Dueño** | Nexo project |
| **Dependencias** | FR-INV-004 (transición a Sold), FR-SAL-001 (crear venta) |
| **Stories vinculadas** | US-005 |

## Declaración

Al completar una venta, el sistema debe cambiar el estado de todas las prendas
incluidas a `Sold`.

## Racional

El estado `Sold` es el definitivo en el ciclo de vida de la prenda. Permite
saber qué se ha vendido, separarlo del inventario activo y calcular utilidad.

## Criterio de Aceptación

- Dado que completo una venta con múltiples prendas,
  cuando la venta se guarda,
  entonces todas las prendas cambian a estado `Sold`.

- Dado que una prenda estaba `Reserved` y se vende,
  cuando la venta se completa,
  entonces cambia a `Sold` y la reserva se cierra.

## Método de Verificación

- [ ] Prueba de integración: POST /api/v1/sales cambia estado de prendas a Sold.
- [ ] Demo: UI muestra prendas como vendidas después de completar venta.

## Artefactos de implementación

### Backend
- Módulo de Ventas (pendiente)
  - Servicio que actualiza estado de Items al completar venta
- Módulo NestJS: `back/src/modules/inventory/`
  - `application/item.service.ts` — transición a Sold
  - `domain/item-status.enum.ts` — estado Sold

### Frontend
- UI de venta (pendiente)
- Feature: `front/src/features/inventory/`
  - `components/StatusBadge.tsx` — badge Sold

### Prisma
- Modelo `Item` (campo `status`)

## Notas

- AC-MVP-010: Cambiar prendas vendidas a `Sold` es criterio de aceptación del MVP.
