# FR-CAT-009: Reportes agrupados por dimensión de catálogo

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-CAT-009 |
| **Título** | Reportes agrupados por dimensión de catálogo |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Catalogs |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §7 — Catalogos |
| **Dueño** | Nexo project |
| **Dependencias** | FR-REP-001 a FR-REP-005 (reportes), FR-CAT-005 (brands), FR-CAT-006 (clothing types), FR-CAT-001 (stores) |
| **Stories vinculadas** | US-022 |

## Declaración

Los reportes de ventas e inventario deben soportar agrupación por marca, tipo
de ropa y tienda.

## Racional

Agrupar por dimensiones de catálogo permite análisis más profundos: qué marcas
venden más, qué tipo de ropa rota más rápido, qué tienda es más rentable.

## Criterio de Aceptación

- Dado que genero un reporte de ventas,
  cuando selecciono agrupar por marca,
  entonces el reporte muestra totales agregados por marca.

- Dado que genero un reporte de inventario,
  cuando selecciono agrupar por clothing type,
  entonces el reporte muestra conteos por tipo.

## Método de Verificación

- [ ] Demo: Reporte de ventas agrupado por marca.
- [ ] Prueba de integración: endpoint de reportes acepta ?groupBy=brand.

## Artefactos de implementación

### Backend
- Módulo de Reports (pendiente)
  - Lógica de agrupación por catálogo

### Frontend
- UI de reportes con selector de agrupación (pendiente)

## Notas

- P1: valioso para la toma de decisiones.
- Depende de que existan los módulos de reportes (FR-REP-*).
