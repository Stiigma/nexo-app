# FR-RES-004: Vender prenda reservada

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-RES-004 |
| **Título** | Vender prenda reservada |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Reservations |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §6 — Flujo: vender prenda |
| **Dueño** | Nexo project |
| **Dependencias** | FR-RES-001 (reserva), FR-SAL-001 (crear venta) |
| **Stories vinculadas** | US-016 |

## Declaración

El sistema debe permitir vender una prenda que está `Reserved`, cambiando su
estado a `Sold` y cerrando la reserva asociada.

## Racional

La reserva existe para facilitar la venta; cuando el cliente decide comprar,
la transición debe ser directa.

## Criterio de Aceptación

- Dado que una prenda está `Reserved`,
  cuando la vendo dentro de una venta,
  entonces cambia a `Sold`.

## Método de Verificación

- [ ] Prueba de integración: venta de prenda reservada cambia a Sold.
- [ ] Demo: Flujo completo reserva→venta en UI.

## Artefactos de implementación

### Backend
- Módulo de Ventas (pendiente)
- Módulo de Reservations (pendiente)

### Frontend
- UI de venta con opción de incluir prendas reservadas (pendiente)

### Prisma
- Modelos de reserva y venta

## Notas

- Integración entre el flujo de reservas y el de ventas.
