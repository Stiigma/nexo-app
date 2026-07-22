# FR-CAT-002: Gestionar categorías, tallas, condiciones, colores

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-CAT-002 |
| **Título** | Gestionar categorías, tallas, condiciones, colores |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Catalogs |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Implemented |
| **Fuente** | `NEXO_PROJECT.md` §7 — Catalogos |
| **Dueño** | Nexo project |
| **Dependencias** | FR-AUTH-002 (Admin role), FR-INV-003 (archivo mínimo de prenda) |
| **Stories vinculadas** | US-017, US-020 |

## Declaración

El sistema debe permitir a administradores gestionar los catálogos de
categorías, tallas, condiciones y colores usados en el archivo mínimo de la
prenda.

## Racional

Estos catálogos clasifican las prendas y son esenciales para filtros de
inventario, reportes y consistencia de datos.

## Criterio de Aceptación

- Dado que soy admin,
  cuando creo, edito o desactivo una categoría, talla, condición o color,
  entonces los operadores ven solo los valores activos en los selectores.

- Dado que desactivo un valor de catálogo,
  cuando las prendas históricas lo usan,
  entonces el valor se conserva en los registros históricos.

## Método de Verificación

- [ ] Demo: CRUD de cada catálogo.
- [ ] Prueba de integración: desactivación preserva referencias históricas.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/catalogs/`
  - `interface/http/controllers/simple-catalog-controllers.ts` — controladores genéricos
  - `interface/http/controllers/colors.controller.ts` — controlador específico de colores
  - `interface/http/dto/` — DTOs para cada entidad
  - `domain/simple-catalog-entity.ts` — entidad base

### Frontend
- Feature: `front/src/features/catalogs/`
  - `types/entities/category.ts` — tipo Category
  - `types/entities/size.ts` — tipo Size
  - `types/entities/condition.ts` — tipo Condition
  - `types/entities/color.tsx` — tipo Color (con preview visual)
  - `config/registry.ts` — registro de entidades
  - Componentes genéricos reutilizables

### Prisma
- Modelos: `Category`, `Size`, `Condition`, `Color` en `back/prisma/schema.prisma`

## Notas

- Valores se usan en FR-INV-003 (archivo mínimo de prenda) y FR-INV-010 (editor).
