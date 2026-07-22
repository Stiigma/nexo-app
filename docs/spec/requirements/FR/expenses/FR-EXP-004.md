# FR-EXP-004: Categorizar gastos

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-EXP-004 |
| **Título** | Categorizar gastos |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Expenses |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §7 — Gastos |
| **Dueño** | Nexo project |
| **Dependencias** | FR-CAT-003 (expense types catalog) |
| **Stories vinculadas** | US-007, US-020 |

## Declaración

El sistema debe requerir que cada gasto tenga un tipo seleccionado del catálogo
de tipos de gasto.

## Racional

Categorizar gastos permite reportes más precisos y análisis de costos por tipo
(ej. casetas, gasolina, empaque, renta).

## Criterio de Aceptación

- Dado que registro un gasto,
  cuando el formulario carga,
  entonces debo seleccionar un tipo de gasto del catálogo de activos.

- Dado que consulto el reporte de gastos,
  cuando filtro por tipo de gasto,
  entonces los resultados se agrupan por categoría.

## Método de Verificación

- [ ] Demo: UI de gastos muestra selector de tipos.
- [ ] Prueba de integración: creación de gasto requiere tipo.

## Artefactos de implementación

### Backend
- Módulo de Catalogs: `back/src/modules/catalogs/`
  - Catálogo de tipos de gasto (`ExpenseType`)
  - `interface/http/dto/` — DTOs de catálogo

### Frontend
- Feature: `front/src/features/catalogs/`
  - `types/entities/expense-type.ts` — tipo ExpenseType
  - UI de selección de tipo de gasto

### Prisma
- Modelo `ExpenseType` en `back/prisma/schema.prisma`

## Notas

- P1: valioso pero no bloqueante para el MVP.
- El catálogo de tipos de gasto es administrable por admins (FR-CAT-003).
