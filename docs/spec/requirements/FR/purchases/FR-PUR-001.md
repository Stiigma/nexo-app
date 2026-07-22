# FR-PUR-001: Crear carrito de compra

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-PUR-001 |
| **Título** | Crear carrito de compra |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Purchases |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §6 — Flujo: iniciar lote de compra |
| **Dueño** | Nexo project |
| **Dependencias** | FR-CAT-001 (stores), FR-CAT-004 (store tax rate), IR-002 (exchange rate) |
| **Stories vinculadas** | US-001 |

## Declaración

El sistema debe permitir a un operador crear un carrito de compra seleccionando
tienda, fecha, moneda y capturando un tipo de cambio.

## Racional

Antes de pagar, el operador necesita un contenedor temporal para capturar
prendas mientras está en la tienda. La tienda y moneda determinan el tax y las
conversiones a MXN.

## Criterio de Aceptación

- Dado que soy un operador autenticado,
  cuando creo un carrito,
  entonces puedo seleccionar una tienda activa, una fecha y una moneda (MXN/USD).

- Dado que selecciono una tienda,
  cuando el formulario carga,
  entonces la tasa de tax predeterminada se prellena y es editable.

- Dado que el carrito usa USD,
  cuando se crea el carrito,
  entonces el tipo de cambio USD→MXN se obtiene automáticamente (o se captura
  manual como fallback) y queda almacenado.

## Método de Verificación

- [ ] Prueba de integración: `POST /api/v1/purchase-carts` crea carrito con campos requeridos.
- [ ] Demo manual: Flujo mobile de creación de carrito.

## Datos de Prueba

```json
{
  "storeId": "uuid-store-1",
  "currency": "USD",
  "date": "2026-07-18",
  "exchangeRate": 18.50
}
```

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `domain/purchase.ts` — entidad Purchase (estado OPEN)
  - `interface/http/purchases.controller.ts` — endpoints REST de compras
  - `application/ports/inventory-repository.ts` — puerto de persistencia
  - `infrastructure/repositories/prisma-inventory.repository.ts` — impl. Prisma

### Frontend
- Feature: `front/src/features/inventory/` (futura vista de creación de carrito)
  - Vistas de carrito pendientes de implementar
- Feature relacionada: `front/src/features/catalogs/` (selector de tiendas)

### Prisma
- Modelo `Purchase` en `back/prisma/schema.prisma`

## Open Questions

- OQ-003: ¿Qué pasa si el proveedor de tipo de cambio no está disponible?
- IR-003: Proveedor recomendado: Banxico SIE/FIX (pendiente ADR)

## Notas

- El carrito en estado `OPEN` permite agregar/remover items (FR-PUR-002).
- Se confirma como lote (FR-PUR-005) después del pago.
