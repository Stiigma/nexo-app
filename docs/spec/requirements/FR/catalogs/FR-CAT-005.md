# FR-CAT-005: Catálogo de marcas con metadatos

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-CAT-005 |
| **Título** | Catálogo de marcas (Brands) con metadatos |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Catalogs |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Implemented |
| **Fuente** | `NEXO_PROJECT.md` §7 — Catalogos |
| **Dueño** | Nexo project |
| **Dependencias** | FR-AUTH-002 (Admin role) |
| **Stories vinculadas** | US-018 |

## Declaración

El sistema debe proveer un catálogo de marcas con nombre, active flag, logo URL
(opcional), país de origen (opcional) y un campo JSON de metadatos para
extensibilidad.

## Racional

Las marcas son una dimensión clave para filtros, reportes y análisis. El
metadato permite atributos futuros como segmento, tier o proveedor.

## Criterio de Aceptación

- Dado que soy admin,
  cuando creo una marca,
  entonces puedo ingresar nombre, logo URL, país de origen y metadatos.

- Dado que una marca está desactivada,
  cuando se consultan prendas históricas,
  entonces la marca se conserva en los registros históricos.

- Dado que existen marcas,
  cuando veo el listado,
  entonces soporta paginación y orden por nombre.

## Método de Verificación

- [ ] Demo: CRUD de marcas con todos los campos.
- [ ] Prueba de integración: metadata JSON se almacena correctamente.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/catalogs/`
  - `interface/http/controllers/simple-catalog-controllers.ts` — CRUD genérico
  - `domain/simple-catalog-entity.ts` — entidad base
  - `infrastructure/repositories/prisma-catalog.repository.ts`

### Frontend
- Feature: `front/src/features/catalogs/`
  - `types/entities/brand.ts` — tipo Brand
  - `config/registry.ts` — registro de marca
  - Componentes genéricos de CRUD

### Prisma
- Modelo `Brand` en `back/prisma/schema.prisma`
- Campos: `name`, `active`, `logoUrl`, `originCountry`, `metadata` (JSON)

## Notas

- OQ-009: ¿Qué atributos de metadata seed para marcas?
- FR-CAT-008 usa brands como filtro de inventario.
- FR-CAT-009 usa brands como dimensión de reportes.
