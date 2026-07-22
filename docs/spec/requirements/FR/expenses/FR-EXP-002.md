# FR-EXP-002: Registrar gastos ligados a lote

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-EXP-002 |
| **Título** | Registrar gastos ligados a lote |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Expenses |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §4 — Gasto |
| **Dueño** | Nexo project |
| **Dependencias** | FR-PUR-005 (lote confirmado), FR-EXP-004 (categorizar) |
| **Stories vinculadas** | US-007 |

## Declaración

El sistema debe permitir registrar gastos ligados a un lote de compra. Estos
gastos aparecen en el detalle del lote y se distribuyen entre sus prendas
(FR-EXP-003).

## Racional

Gastos como casetas, gasolina o empaque están directamente vinculados a un viaje
de compra específico y deben reflejarse en el costo real de las prendas de ese
lote.

## Criterio de Aceptación

- Dado que existe un lote de compra confirmado,
  cuando registro un gasto ligado a ese lote,
  entonces el gasto aparece en el detalle del lote.

- Dado que registro un gasto ligado a lote,
  cuando veo el detalle de las prendas del lote,
  entonces el gasto está disponible para asignación proporcional.

## Método de Verificación

- [ ] Prueba de integración: creación de gasto ligado a lote.
- [ ] Demo: Detalle de lote muestra gastos asociados.

## Artefactos de implementación

### Backend
- Módulo de Expenses (pendiente)
  - Relación con `Purchase`

### Frontend
- UI de gastos (pendiente)

### Prisma
- Modelo `Expense` con `purchaseId` opcional

## Notas

- La asignación se define en FR-EXP-003.
- Si no se asigna, el gasto queda pendiente de distribución.
