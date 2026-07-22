# FR-REP-002: Reporte de ventas por periodo

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-REP-002 |
| **Título** | Reporte de ventas por periodo |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Reports |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §7 — Reportes |
| **Dueño** | Nexo project |
| **Dependencias** | FR-SAL-001 (ventas) |
| **Stories vinculadas** | US-010 |

## Declaración

El sistema debe generar un reporte de ventas filtrable por periodo, mostrando
totales en MXN.

## Racional

El reporte de ventas por periodo es esencial para evaluar el desempeño del
negocio.

## Criterio de Aceptación

- Dado que existen ventas registradas,
  cuando filtro por periodo,
  entonces veo el total de ventas en MXN, desglosado por moneda original si
  aplica.

## Método de Verificación

- [ ] Demo: Reporte de ventas con filtro de fechas y totales MXN.

## Artefactos de implementación

### Backend
- Módulo de Reports (pendiente)
  - API `/api/v1/reports/sales`

### Frontend
- UI de reportes (pendiente)
  - Ruta: `/admin/reports` (placeholder)

### Prisma
- Modelos `Sale` y `SaleLine` para consultas agregadas

## Notas

- Las ventas en USD deben mostrar su equivalente MXN (FR-SAL-004).
