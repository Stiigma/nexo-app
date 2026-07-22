# FR-INV-001: Crear registro de prenda trazable

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-INV-001 |
| **Título** | Crear registro de prenda trazable |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Inventory |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §4 — Prenda |
| **Dueño** | Nexo project |
| **Dependencias** | FR-PUR-005 (confirmación de lote) |
| **Stories vinculadas** | US-003 |

## Declaración

El sistema debe crear un registro de prenda trazable por cada item confirmado
en un lote de compra, con un código interno único asignado después de la
confirmación de pago.

## Racional

Cada prenda debe ser identificable de forma única para trazabilidad de compra,
venta, reserva y ubicación física.

## Criterio de Aceptación

- Dado que un lote se confirma,
  cuando los items se procesan,
  entonces cada item recibe un código interno único (ej. NEXO-000001).

- Dado que la prenda se consulta después,
  cuando veo su detalle,
  entonces el código interno es estable y visible.

## Método de Verificación

- [ ] Prueba de integración: confirmación de lote genera códigos únicos para cada item.
- [ ] Demo: Detalle de prenda muestra código interno.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `domain/item.ts` — entidad Item con `internalCode`
  - `domain/purchase.ts` — lógica de transición OPEN→CONFIRMED
  - `application/item.service.ts` — asignación de código en creación
  - `interface/http/items.controller.ts` — GET item por código

### Frontend
- Feature: `front/src/features/inventory/`
  - `views/InventoryPage.tsx` — listado con código visible
  - `components/InventoryCard.tsx` — tarjeta con código
  - `components/ItemDetailModal.tsx` — detalle con código

### Prisma
- Modelo `Item` (campo `internalCode` con índice único) en `back/prisma/schema.prisma`

## Notas

- DR-004: El código es único y estable después de la confirmación.
- Formato de código: secuencial, prefijo configurable.
