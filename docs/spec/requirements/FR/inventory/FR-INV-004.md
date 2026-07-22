# FR-INV-004: Estados de inventario

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-INV-004 |
| **Título** | Estados de inventario |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Inventory |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §4 — Prenda (estados) |
| **Dueño** | Nexo project |
| **Dependencias** | FR-PUR-005 (→Acquired Stock), FR-RES-001 (→Reserved), FR-SAL-006 (→Sold) |
| **Stories vinculadas** | US-003, US-004, US-005, US-009, US-016, US-017 |

## Declaración

El sistema debe soportar los estados de inventario `Acquired Stock`,
`Available`, `Reserved` y `Sold`, con transiciones controladas.

## Racional

El estado de inventario es la base para saber qué se puede vender, qué está
apartado y qué ya se vendió.

## Criterio de Aceptación

- Dado que un lote se confirma,
  cuando las prendas se crean,
  entonces su estado es `Acquired Stock`.

- Dado que una prenda completa su archivo mínimo,
  cuando se marca como lista,
  entonces su estado cambia a `Available`.

- Dado que una prenda `Available` se reserva,
  cuando la reserva se guarda,
  entonces su estado cambia a `Reserved`.

- Dado que una prenda se vende,
  cuando la venta se completa,
  entonces su estado cambia a `Sold`.

## Método de Verificación

- [ ] Prueba unitaria: transiciones de estado válidas e inválidas.
- [ ] Prueba de integración: forbidden transition es rechazada.
- [ ] Demo: Visualización de estado en UI.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `domain/item-status.enum.ts` — `PRICE_PENDING`, `AVAILABLE`, `RESERVED`, `SOLD`
  - `domain/item.ts` — entidad con validación de transiciones
  - `domain/__tests__/item-status.spec.ts` — pruebas de estado
  - `application/item.service.ts` — lógica de cambios de estado

### Frontend
- Feature: `front/src/features/inventory/`
  - `components/StatusBadge.tsx` — badge visual del estado
  - `types/item.ts` — tipo Item con status
  - `lib/item-readiness.ts` — helper de preparación

### Prisma
- Modelo `Item` (campo `status` con enum) en `back/prisma/schema.prisma`

## Notas

- `PricePending` (sin precio) existe como estado intermedio entre Acquired Stock
  y Available (ver FR-INV-008).
- El listing state (FR-LST-001) es independiente del estado físico.
