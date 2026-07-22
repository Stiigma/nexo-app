# FR-SAL-005: Calcular utilidad por prenda vendida

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-SAL-005 |
| **Título** | Calcular utilidad por prenda vendida |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Sales |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §4 — Utilidad |
| **Dueño** | Nexo project |
| **Dependencias** | FR-INV-005 (costo total), FR-SAL-003 (precio final) |
| **Stories vinculadas** | US-005 |

## Declaración

El sistema debe calcular la utilidad de cada prenda vendida como:
`utilidad = precio_final_venta_mxn - costo_total_prenda_mxn`.

## Racional

La utilidad por prenda es la métrica central del negocio. Sin ella no se puede
evaluar rentabilidad.

## Criterio de Aceptación

- Dado que una prenda se vende con precio final en MXN,
  cuando la venta se completa,
  entonces la utilidad se calcula como la diferencia entre el precio final y el
  costo total.

- Dado que consulto una prenda vendida,
  cuando veo su detalle,
  entonces veo la utilidad generada.

## Método de Verificación

- [ ] Prueba unitaria: cálculo de utilidad con valores conocidos.
- [ ] Demo: Detalle de prenda vendida muestra utilidad.

## Artefactos de implementación

### Backend
- Módulo de Ventas (pendiente)
  - Lógica de cálculo en servicio de ventas

### Frontend
- Feature: `front/src/features/inventory/`
  - `components/FinancialBreakdown.tsx` — desglose financiero
  - `components/ItemDetailModal.tsx` — detalle con utilidad

## Notas

- Fórmula: `utilidad = salePriceMxn - totalCost`.
- Relacionado con BR-003 (conocer ventas y utilidad por prenda y periodo).
