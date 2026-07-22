# FR-EXP-001: Registrar gastos generales

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-EXP-001 |
| **Título** | Registrar gastos generales |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Expenses |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §7 — Gastos |
| **Dueño** | Nexo project |
| **Dependencias** | FR-EXP-004 (categorizar gastos) |
| **Stories vinculadas** | US-007 |

## Declaración

El sistema debe permitir registrar gastos generales (no ligados a un lote).
Estos gastos aparecen en reportes pero no afectan el costo de las prendas.

## Racional

Los gastos generales (renta, servicios, etc.) son necesarios para tener una
visión completa de los costos del negocio, aunque no se asignan a prendas
individuales.

## Criterio de Aceptación

- Dado que registro un gasto general,
  cuando guardo,
  entonces aparece en el reporte de gastos.

- Dado que registro un gasto general,
  cuando consulto el costo de las prendas,
  entonces ese gasto no altera ningún costo de prenda.

## Método de Verificación

- [ ] Prueba de integración: creación de gasto general.
- [ ] Demo: Reporte de gastos muestra gastos generales.

## Artefactos de implementación

### Backend
- Módulo de Expenses (pendiente de implementar)
  - API `/api/v1/expenses`
  - DTOs: `CreateExpenseDto`

### Frontend
- UI de gastos (pendiente)

### Prisma
- Modelo `Expense` (pendiente de crear) con campo `type` = `GENERAL` | `BATCH`

## Notas

- Módulo de gastos no implementado aún.
- Feature chain (plan maestro): F9 — `NEXO-0015`.
