# FR-PUR-002: Agregar y remover items del carrito

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-PUR-002 |
| **Título** | Agregar y remover items del carrito |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Purchases |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §6 — Flujo: agregar prenda al lote |
| **Dueño** | Nexo project |
| **Dependencias** | FR-PUR-001 (carrito activo), FR-INV-002 (foto obligatoria), IR-001 (S3 storage) |
| **Stories vinculadas** | US-002 |

## Declaración

El sistema debe permitir a un operador agregar y remover items de un carrito de
compra abierto antes de la confirmación de pago. Cada item requiere foto
principal y costo de compra capturado.

## Racional

El operador necesita capturar prendas rápidamente mientras revisa mercancía en
tienda, y poder corregir la selección antes de pagar.

## Criterio de Aceptación

- Dado un carrito activo en estado `OPEN`,
  cuando agrego un item,
  entonces el sistema requiere una foto principal y un costo de compra capturado.

- Dado que guardo el item sin categoría conocida,
  cuando el formulario se envía,
  entonces el item queda marcado para revisión de categoría.

- Dado que remuevo un item antes de confirmar el pago,
  cuando el lote se confirma,
  entonces ese item no entra al inventario.

## Método de Verificación

- [ ] Prueba de integración: agregar item a carrito con/without foto.
- [ ] Prueba de integración: remover item y confirmar que no persiste.
- [ ] Demo manual: flujo completo mobile de captura de items.

## Datos de Prueba

```json
{
  "purchaseCartId": "uuid-cart-1",
  "mainPhoto": "data:image/jpeg;base64,...",
  "purchaseCost": 15.99,
  "currency": "USD"
}
```

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `domain/purchase.ts` — PurchaseItem dentro del agregado Purchase
  - `interface/http/purchases.controller.ts` — endpoints para items del carrito
  - `domain/item.ts` — entidad Item (se crea al confirmar)

### Frontend
- Feature: `front/src/features/inventory/` (futura vista de captura de items)

### Prisma
- Modelos `Purchase` (con items embedidos o relacionados) y `ItemPhoto` en `back/prisma/schema.prisma`

## Notas

- La foto se sube a S3-compatible (IR-001) y se guarda la referencia.
- La categoría se puede asignar después (FR-INV-009).
