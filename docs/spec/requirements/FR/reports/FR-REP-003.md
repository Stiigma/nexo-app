# FR-REP-003: Reporte de gastos por periodo

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-REP-003 |
| **Título** | Reporte de gastos por periodo |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Reports |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §7 — Reportes |
| **Dueño** | Nexo project |
| **Dependencias** | FR-EXP-001 (gastos generales), FR-EXP-002 (gastos de lote) |
| **Stories vinculadas** | US-010 |

## Declaración

El sistema debe generar un reporte de gastos filtrable por periodo, separando
gastos generales de gastos ligados a lotes.

## Racional

Separar ambos tipos de gasto permite entender cuánto se gasta en operación
general vs. cuánto se invierte en adquisición de inventario.

## Criterio de Aceptación

- Dado que existen gastos generales y de lote,
  cuando filtro por periodo,
  entonces el reporte muestra ambas categorías separadas.

## Método de Verificación

- [ ] Demo: Reporte de gastos con separación general/lote.

## Artefactos de implementación

### Backend
- Módulo de Reports (pendiente)
  - API `/api/v1/reports/expenses`

### Frontend
- UI de reportes (pendiente)

### Prisma
- Modelo `Expense` para consultas agregadas

## Notas

- AC-MVP-005: Registrar gastos generales y de lote.
