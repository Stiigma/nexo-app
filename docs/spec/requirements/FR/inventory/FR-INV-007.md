# FR-INV-007: Trazabilidad de compra y venta

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-INV-007 |
| **Título** | Trazabilidad de compra y venta |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Inventory |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §7 — Inventario |
| **Dueño** | Nexo project |
| **Dependencias** | FR-PUR-005 (lote de compra), FR-SAL-006 (marcar vendida) |
| **Stories vinculadas** | US-009, US-015 |

## Declaración

El sistema debe mostrar, en el detalle de la prenda, los vínculos a su lote de
compra de origen y a su venta (si aplica).

## Racional

La trazabilidad permite al operador y admin saber exactamente cuándo, dónde y
en qué condiciones se compró y vendió cada prenda.

## Criterio de Aceptación

- Dado que una prenda fue comprada en un lote,
  cuando veo su detalle,
  entonces veo un enlace al lote de compra con fecha, tienda y costo.

- Dado que una prenda fue vendida,
  cuando veo su detalle,
  entonces veo un enlace a la venta con fecha, precio y cliente.

## Método de Verificación

- [ ] Demo: Detalle de prenda muestra origen de compra y venta cuando existen.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `domain/item.ts` — relación con Purchase y Sale
  - `interface/http/items.controller.ts` — endpoint que incluye relaciones
  - `interface/http/dto/item-response.dto.ts` — DTO con datos de trazabilidad

### Frontend
- Feature: `front/src/features/inventory/`
  - `components/ItemDetailModal.tsx` — detalle con sección de trazabilidad
  - `types/item.ts` — tipo con relaciones

### Prisma
- Modelo `Item` (relación con `Purchase` y futura `Sale`)

## Notas

- P1: Funcionalidad valiosa pero no bloqueante para el MVP.
- La trazabilidad de venta depende de que exista el módulo de ventas (FR-SAL-*).
