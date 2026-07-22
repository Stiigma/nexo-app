# FR-INV-005: Calcular costo total en MXN

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-INV-005 |
| **Título** | Calcular costo total en MXN |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Inventory |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §4 — Costo total |
| **Dueño** | Nexo project |
| **Dependencias** | FR-EXP-003 (asignación de gastos), DR-001 (moneda original + MXN), DR-002 (exchange rate almacenado) |
| **Stories vinculadas** | US-003, US-008 |

## Declaración

El sistema debe calcular y almacenar el costo total de cada prenda en MXN,
incluyendo: costo de compra convertido a MXN, tax correspondiente y gastos
asignados del lote.

## Racional

El costo total es la base para calcular utilidad (BR-003) y evaluar
rentabilidad.

## Criterio de Aceptación

- Dado que una prenda tiene costo de compra, tax y gastos asignados,
  cuando se calcula su costo total,
  entonces: `totalCost = purchaseCostMxn + taxAmount + allocatedExpenses`.

- Dado que los valores cambian (ej. se agrega un gasto),
  cuando se recalcula,
  entonces el costo total se actualiza.

## Método de Verificación

- [ ] Prueba unitaria: cálculo de costo total con valores conocidos.
- [ ] Demo: Detalle de prenda muestra desglose de costo total.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `domain/item.ts` — campos de costo en la entidad
  - `application/item.service.ts` — lógica de cálculo

### Frontend
- Feature: `front/src/features/inventory/`
  - `components/FinancialBreakdown.tsx` — desglose visual de costos
  - `components/ItemDetailModal.tsx` — detalle financiero

### Prisma
- Modelo `Item` (campos: `purchaseCostMxn`, `taxAmount`, `totalCost`)

## Notas

- BR-002: El negocio necesita conocer el costo real estimado de cada prenda.
- Los gastos se asignan proporcionalmente (FR-EXP-003).
