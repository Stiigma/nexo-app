# FR-PUR-006: Diferencia entre total pagado vs esperado

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-PUR-006 |
| **Título** | Diferencia entre total pagado vs esperado |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Purchases |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §5 — Tax (corrección manual) |
| **Dueño** | Nexo project |
| **Dependencias** | FR-PUR-005 (confirmación), FR-CAT-003 (difference reasons catalog) |
| **Stories vinculadas** | US-003 |

## Declaración

Cuando el total pagado difiere del total esperado del carrito, el sistema debe
requerir una razón de diferencia seleccionada de un catálogo, o una nota si la
razón es `other`.

## Racional

Las diferencias entre el ticket real y el cálculo del sistema ocurren
frecuentemente (descuentos, tax distinto, errores de captura). Registrar la
razón mantiene la trazabilidad financiera.

## Criterio de Aceptación

- Dado que el total pagado es diferente al total esperado del carrito,
  cuando intento confirmar el lote,
  entonces debo seleccionar una razón de diferencia del catálogo.

- Dado que la razón seleccionada es `other`,
  cuando confirmo,
  entonces debo proporcionar una nota explicativa.

- Dado que los totales coinciden,
  cuando confirmo el lote,
  entonces no se requiere razón de diferencia.

## Método de Verificación

- [ ] Prueba de integración: confirmación con mismatch requiere differenceReason.
- [ ] Demo: UI muestra campo obligatorio de razón cuando hay diferencia.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `domain/purchase.ts` — validación de diferencia en la entidad
  - `interface/http/purchases.controller.ts` — campo differenceReason en confirmación
- Módulo NestJS: `back/src/modules/catalogs/` — catálogo de razones de diferencia

### Frontend
- Feature: `front/src/features/inventory/` — UI de confirmación con selector de razón
- Feature: `front/src/features/catalogs/` — catálogo de razones de diferencia

### Prisma
- Modelo `DifferenceReason` en `back/prisma/schema.prisma`

## Notas

- Relacionado con US-003 (Confirm Purchase Batch).
- El catálogo de razones es administrable por admins (FR-CAT-003).
