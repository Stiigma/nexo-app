# FR-PUR-005: Confirmar carrito como lote de compra

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-PUR-005 |
| **Título** | Confirmar carrito como lote de compra |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Purchases |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §6 — Flujo: cerrar lote de compra |
| **Dueño** | Nexo project |
| **Dependencias** | FR-PUR-002 (items en carrito), FR-PUR-006 (diferencia de total), FR-INV-001 (código interno), FR-INV-004 (estado Acquired Stock) |
| **Stories vinculadas** | US-003 |

## Declaración

El sistema debe permitir confirmar un carrito de compra como lote (purchase
batch) después del pago, asignando códigos internos a cada prenda, calculando
totales y moviendo las prendas a `Acquired Stock`.

## Racional

La confirmación transforma un conjunto temporal de items capturados en
inventario formal del negocio con códigos trazables.

## Criterio de Aceptación

- Dado un carrito con items,
  cuando confirmo el pago,
  entonces debo proporcionar evidencia de pago (foto del ticket).

- Dado que el pago se confirma,
  cuando el lote se crea,
  entonces cada item recibe un código interno único.

- Dado que el lote se confirma exitosamente,
  cuando consulto las prendas,
  entonces su estado de inventario es `Acquired Stock`.

- Dado que el lote se confirma,
  cuando los costos se calculan,
  entonces cada prenda muestra costo total en MXN.

## Método de Verificación

- [ ] Prueba de integración: confirmación de carrito→batch con códigos asignados.
- [ ] Demo: Flujo completo de confirmación desde la UI.

## Datos de Prueba

```json
{
  "purchaseCartId": "uuid-cart-1",
  "paymentEvidence": "data:image/jpeg;base64,...",
  "paidTotal": 199.99,
  "differenceReasonId": null
}
```

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `domain/purchase.ts` — entidad Purchase con transición OPEN→CONFIRMED
  - `domain/item.ts` — entidad Item con asignación de código interno
  - `application/item.service.ts` — lógica de creación de items al confirmar
  - `interface/http/purchases.controller.ts` — endpoint de confirmación

### Frontend
- Feature: `front/src/features/inventory/` (futura vista de confirmación)

### Prisma
- Modelos `Purchase`, `Item` en `back/prisma/schema.prisma`

## Notas

- El código interno es único y estable (DR-004).
- Si el total pagado difiere del esperado, se requiere FR-PUR-006.
