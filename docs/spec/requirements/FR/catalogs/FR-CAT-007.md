# FR-CAT-007: API de catálogos con filtros y exportación

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-CAT-007 |
| **Título** | API de catálogos con filtros y exportación |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Catalogs |
| **Prioridad** | P2 |
| **MoSCoW** | Could |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §7 — Catalogos |
| **Dueño** | Nexo project |
| **Dependencias** | FR-CAT-001 a FR-CAT-006 (catálogos individuales) |
| **Stories vinculadas** | US-022 |

## Declaración

Todos los endpoints de catálogo deben soportar filtrado (`?filter=`),
ordenamiento (`?sort=`), paginación (`?page=`, `?limit=`) y exportación en JSON
y CSV.

## Racional

Para análisis externo y data engineering, los catálogos deben ser consultables
y exportables programáticamente.

## Criterio de Aceptación

- Dado que accedo a un endpoint de catálogo,
  cuando paso `?filter=nombre&sort=name:asc&page=1&limit=20`,
  entonces la respuesta contiene los resultados filtrados, ordenados y paginados.

- Dado que solicito exportación,
  cuando uso `?format=csv` o `Accept: text/csv`,
  entonces recibo los datos en formato CSV.

## Método de Verificación

- [ ] Prueba de integración: filtros, orden y paginación funcionan.
- [ ] Prueba de integración: exportación CSV devuelve datos correctos.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/catalogs/`
  - `interface/http/dto/catalog-query.dto.ts` — DTO de query params
  - `interface/http/dto/clothing-type-query.dto.ts` — DTO específico
  - `infrastructure/repositories/prisma-catalog.repository.ts` — consultas con filtros

### Frontend
- Feature: `front/src/features/catalogs/`
  - Componente de exportación (pendiente)
  - `helpers/build-query-params.ts` — construcción de query params

## Notas

- P2: valioso para data engineering pero no necesario para operación diaria.
- La exportación CSV puede implementarse con pipe NestJS o middleware.
