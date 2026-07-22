# FR-EXP-003: Asignar gastos proporcionalmente

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-EXP-003 |
| **Título** | Asignar gastos proporcionalmente |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Expenses |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §4 — Gasto (reparto proporcional) |
| **Dueño** | Nexo project |
| **Dependencias** | FR-EXP-002 (gasto ligado a lote), FR-INV-005 (costo total) |
| **Stories vinculadas** | US-008 |

## Declaración

El sistema debe asignar los gastos ligados a un lote proporcionalmente al costo
base de cada prenda en MXN, de modo que la suma de las asignaciones iguale el
monto total del gasto (sujeto a política de redondeo).

## Racional

No todas las prendas tienen el mismo costo base. La asignación proporcional
distribuye el gasto de forma equitativa según el valor de cada prenda.

## Criterio de Aceptación

- Dado que un lote tiene gastos ligados,
  cuando se calculan los costos totales,
  entonces cada prenda recibe: `(gastoTotal * costoPrenda / sumCostos)`.

- Dado que la asignación se completa,
  cuando sumo los montos asignados,
  entonces el total es igual al monto del gasto original (sujeto a redondeo).

## Método de Verificación

- [ ] Prueba unitaria: cálculo de asignación proporcional.
- [ ] Prueba unitaria: la suma de asignaciones iguala el total del gasto.

## Artefactos de implementación

### Backend
- Módulo de Expenses (pendiente)
  - Lógica de asignación en servicio de gastos

### Frontend
- UI de visualización de asignación (pendiente)

### Prisma
- Modelo `Item` (campo `allocatedExpenses`)
- Modelo `Expense` (relación con items/ purchase)

## Open Questions

- OQ-001: ¿Qué política de redondeo aplicar?

## Notas

- AC-MVP-006: Calcular costo total por prenda es criterio de aceptación del MVP.
- La asignación puede ser automática o bajo demanda del admin.
