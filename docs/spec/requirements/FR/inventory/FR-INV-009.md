# FR-INV-009: Revisión de categoría

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-INV-009 |
| **Título** | Revisión de categoría |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Inventory |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §4 — Prenda (campo: categoría) |
| **Dueño** | Nexo project |
| **Dependencias** | FR-CAT-002 (categorías catalog) |
| **Stories vinculadas** | US-002, US-017 |

## Declaración

El sistema debe marcar una prenda para revisión de categoría cuando se captura
sin una categoría formal del catálogo. La marca debe persistir hasta que se
asigne una categoría válida.

## Racional

Durante la captura rápida en tienda, el operador puede no saber la categoría
exacta. La marca de revisión asegura que ningún item quede sin categoría
indefinidamente.

## Criterio de Aceptación

- Dado que capturo un item sin categoría del catálogo,
  cuando guardo el item,
  entonces queda marcado para revisión de categoría.

- Dado que un item está marcado para revisión,
  cuando un operador/admin asigna una categoría formal,
  entonces la marca de revisión se limpia.

## Método de Verificación

- [ ] Prueba de integración: creación de item sin categoría crea flag de revisión.
- [ ] Demo: UI muestra indicador de "categoría pendiente".

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `domain/item.ts` — flag `categoryReview` en la entidad
  - `application/item.service.ts` — lógica de marcado/limpieza
  - `interface/http/items.controller.ts` — actualización de categoría

### Frontend
- Feature: `front/src/features/inventory/`
  - `components/ItemEditorDialog.tsx` — editor donde se asigna categoría
  - `types/item.ts` — tipo con campo categoryReview

### Prisma
- Modelo `Item` (campo `categoryReview` booleano)

## Notas

- El flag se limpia automáticamente al asignar una categoría del catálogo.
- Relacionado con US-017 (completar archivo mínimo).
