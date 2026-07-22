# FR-CAT-006: Catálogo de tipos de ropa

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-CAT-006 |
| **Título** | Catálogo de tipos de ropa (Clothing Types) |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Catalogs |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Implemented |
| **Fuente** | `NEXO_PROJECT.md` §7 — Catalogos |
| **Dueño** | Nexo project |
| **Dependencias** | FR-AUTH-002 (Admin role) |
| **Stories vinculadas** | US-017, US-019 |

## Declaración

El sistema debe proveer un catálogo de tipos de ropa (Clothing Types) con
nombre (ej. "Camisa", "Pantalón", "Vestido", "Chamarra", "Sudadera"), active
flag, display order (para orden en frontend) y metadata JSON.

## Racional

Los tipos de ropa son una clasificación estructural distinta de las categorías.
Permiten agrupar prendas en la UI y en reportes.

## Criterio de Aceptación

- Dado que soy admin,
  cuando creo un tipo de ropa,
  entonces puedo ingresar nombre, display order, active flag y metadatos.

- Dado que los tipos tienen display order,
  cuando el frontend muestra el selector,
  entonces se ordenan por display order ascendente.

- Dado que desactivo un tipo de ropa,
  cuando las prendas históricas lo usan,
  entonces se conserva en los registros históricos.

## Método de Verificación

- [ ] Demo: CRUD de tipos de ropa con display order.
- [ ] Prueba de integración: display order se refleja en GET /clothing-types.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/catalogs/`
  - `domain/clothing-type.ts` — entidad específica (con displayOrder)
  - `interface/http/clothing-types.controller.ts` — controlador específico
  - `interface/http/dto/create-clothing-type.dto.ts`
  - `interface/http/dto/update-clothing-type.dto.ts`
  - `interface/http/dto/clothing-type-query.dto.ts`
  - `interface/http/dto/clothing-type-response.dto.ts`
  - `interface/http/dto/toggle-active.dto.ts`
  - `interface/http/__tests__/clothing-types.e2e-spec.ts` — pruebas e2e
  - `application/__tests__/simple-catalog-service.spec.ts`

### Frontend
- Feature: `front/src/features/catalogs/`
  - `types/entities/clothing-type.ts` — tipo ClothingType
  - Componentes genéricos

### Prisma
- Modelo `ClothingType` en `back/prisma/schema.prisma`
- Modelo `ClothingSection` en `back/prisma/schema.prisma` (secci—n, agrupación)

## Notas

- OQ-010: ¿Clothing type debe ser requerido en el archivo mínimo?
- Distinto de `Category`: clothing type es estructural, category es granular.
