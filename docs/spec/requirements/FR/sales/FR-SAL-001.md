# FR-SAL-001: Crear venta con líneas

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-SAL-001 |
| **Título** | Crear venta con líneas |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Sales |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §6 — Flujo: vender prenda |
| **Dueño** | Nexo project |
| **Dependencias** | FR-INV-004 (Available/Reserved), FR-CUS-001 (cliente) |
| **Stories vinculadas** | US-005 |

## Declaración

El sistema debe permitir crear una venta con una o más líneas de venta (sale
lines), cada línea correspondiente a una prenda `Available` o `Reserved`.

## Racional

Una venta puede incluir múltiples prendas. Cada prenda tiene su propio precio
final y contribuye a la utilidad de forma independiente.

## Criterio de Aceptación

- Dado que selecciono una o más prendas disponibles o reservadas,
  cuando creo la venta,
  entonces cada prenda se convierte en una línea de venta con su propio precio
  final.

- Dado que la venta se completa,
  cuando la consulto,
  entonces veo todas sus líneas con prenda, precio y subtotal.

## Método de Verificación

- [ ] Prueba de integración: POST /api/v1/sales crea venta con múltiples líneas.
- [ ] Demo: UI permite seleccionar múltiples prendas y crear venta.

## Artefactos de implementación

### Backend
- Módulo de Ventas (pendiente de implementar)
  - API `/api/v1/sales`
  - Entidades: Sale, SaleLine

### Frontend
- UI de ventas (pendiente)
- Feature existente: `front/src/features/inventory/` (selección de prendas)

### Prisma
- Modelos `Sale` y `SaleLine` (pendientes de crear)

## Notas

- Módulo de ventas no implementado aún en backend.
- El feature chain (plan maestro F8) le asigna `NEXO-0014`.
