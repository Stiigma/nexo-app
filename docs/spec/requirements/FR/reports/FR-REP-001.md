# FR-REP-001: Reporte de compras por periodo

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-REP-001 |
| **Título** | Reporte de compras por periodo |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Reports |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §7 — Reportes |
| **Dueño** | Nexo project |
| **Dependencias** | FR-PUR-005 (lotes confirmados) |
| **Stories vinculadas** | US-010 |

## Declaración

El sistema debe generar un reporte de compras filtrable por periodo, mostrando
totales y agrupaciones relevantes.

## Racional

El negocio necesita saber cuánto ha comprado en un periodo para control de
gastos y planeación financiera.

## Criterio de Aceptación

- Dado que existen lotes de compra confirmados,
  cuando filtro el reporte por un rango de fechas,
  entonces veo los totales de compra para ese periodo.

## Método de Verificación

- [ ] Demo: Reporte de compras con filtro de fechas.

## Artefactos de implementación

### Backend
- Módulo de Reports (pendiente de implementar)
  - API `/api/v1/reports/purchases`

### Frontend
- UI de reportes (pendiente)
  - Ruta: `/admin/reports` (placeholder actual)

### Prisma
- Modelo `Purchase` para consultas agregadas

## Notas

- Módulo de reportes no implementado aún.
- Feature chain (plan maestro): F10 — `NEXO-0016`.
