# FR-INV-011: Checklist de preparación para venta

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-INV-011 |
| **Título** | Checklist de preparación para venta |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Inventory |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Implemented |
| **Fuente** | `NEXO_PROJECT.md` §4 — Prenda |
| **Dueño** | Nexo project |
| **Dependencias** | FR-INV-010 (editor), FR-INV-003 (archivo mínimo) |
| **Stories vinculadas** | US-023 |

## Declaración

El editor de prenda debe mostrar un checklist de preparación (readiness)
que identifique los campos obligatorios faltantes antes de que la prenda pueda
ser revisada para venta. El checklist no publica, no vende ni cambia el estado
físico por sí mismo.

## Racional

El operador necesita visibilidad clara de qué datos faltan para completar la
ficha de la prenda, sin riesgo de cambiar accidentalmente su estado comercial
o físico.

## Criterio de Aceptación

- Dado que abro el editor de una prenda incompleta,
  cuando el editor carga,
  entonces veo un checklist que marca los campos faltantes: foto principal,
  categoría, marca, talla, condición, color, ubicación física, precio público.

- Dado que completo todos los campos del checklist,
  cuando guardo,
  entonces el checklist se actualiza mostrando todo completo.

- Dado que el checklist está completo,
  cuando cierro el editor,
  entonces la prenda puede pasar a revisión para publicación (FR-LST-001).

## Método de Verificación

- [ ] Demo: Editor muestra checklist en tiempo real.
- [ ] Prueba de integración: endpoint devuelve readiness status.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `interface/http/dto/item-response.dto.ts` — readiness incluido en respuesta
  - `application/item.service.ts` — cálculo de readiness

### Frontend
- Feature: `front/src/features/inventory/`
  - `lib/item-readiness.ts` — lógica de readiness
  - `components/ItemEditorDialog.tsx` — editor con checklist visual

## Notas

- Implementado junto con FR-INV-010 (US-023).
- El checklist es solo informativo; no ejecuta transiciones de estado.
