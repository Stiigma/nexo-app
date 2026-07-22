# FR-REP-005: Reporte de costo vendido, utilidad y margen

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-REP-005 |
| **Título** | Reporte de costo vendido, utilidad y margen |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Reports |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §7 — Reportes |
| **Dueño** | Nexo project |
| **Dependencias** | FR-SAL-005 (utilidad), FR-INV-005 (costo total), FR-REP-002 (ventas) |
| **Stories vinculadas** | US-010 |

## Declaración

El sistema debe generar un reporte que muestre el costo de lo vendido, la
utilidad total y el margen por periodo.

## Racional

Este es el reporte financiero más importante del negocio. Sin él no se puede
evaluar si el negocio es rentable.

## Criterio de Aceptación

- Dado que existen prendas vendidas en un periodo,
  cuando genero el reporte,
  entonces veo: total ventas MXN, costo vendido MXN, utilidad MXN y margen %.

## Método de Verificación

- [ ] Prueba unitaria: cálculo de margen = utilidad / ventas.
- [ ] Demo: Reporte con costo vendido, utilidad y margen.

## Artefactos de implementación

### Backend
- Módulo de Reports (pendiente)
  - API `/api/v1/reports/profit`

### Frontend
- UI de reportes (pendiente)
  - Ruta: `/admin/reports` (placeholder)

### Prisma
- Modelos `Item` (costo total) y `SaleLine` (precio final)

## Notas

- BR-003: El negocio debe conocer ventas y utilidad por prenda y periodo.
- AC-MVP-011: Consultar utilidad por prenda vendida.
