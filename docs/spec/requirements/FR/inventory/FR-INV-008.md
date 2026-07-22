# FR-INV-008: Bloquear adquiridas hasta completar archivo

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-INV-008 |
| **Título** | Bloquear adquiridas hasta completar archivo |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Inventory |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §4 — Prenda (estado disponible) |
| **Dueño** | Nexo project |
| **Dependencias** | FR-INV-003 (archivo mínimo), FR-CAT-002 (catálogos requeridos), FR-CAT-006 (clothing types) |
| **Stories vinculadas** | US-017 |

## Declaración

El sistema debe mantener las prendas en estado `PricePending` (sin precio) hasta
que su archivo mínimo esté completo, y solo entonces permitir el cambio a
`Available`.

## Racional

Una prenda sin categoría, marca, talla, condición, color, ubicación física o
precio sugerido no puede venderse porque falta información esencial.

## Criterio de Aceptación

- Dado que una prenda está en `PricePending`,
  cuando faltan categoría, marca, talla, condición, color, ubicación o precio
  sugerido,
  entonces la prenda no puede cambiar a `Available`.

- Dado que completo todos los campos requeridos del archivo mínimo,
  cuando guardo,
  entonces la prenda puede cambiar a `Available`.

## Método de Verificación

- [ ] Prueba unitaria: validación de campos requeridos antes de Available.
- [ ] Prueba de integración: transición PricePending→Available rechazada si faltan campos.
- [ ] Demo: UI muestra checklist y bloquea publicación hasta completar.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `domain/item.ts` — validación de integridad del archivo mínimo
  - `application/item.service.ts` — lógica de transición de estado
  - `application/__tests__/item.service-status.spec.ts` — pruebas de estado

### Frontend
- Feature: `front/src/features/inventory/`
  - `lib/item-readiness.ts` — helper de readiness
  - `components/ItemEditorDialog.tsx` — editor con validación
  - `hooks/use-item-editor-update.ts` — hook de actualización

## Notas

- Estados: `PricePending` → `Available` (vía editor FR-INV-010).
- FR-INV-011 define el checklist de preparación.
