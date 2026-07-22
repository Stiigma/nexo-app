# FR-RES-001: Reservar prenda disponible

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-RES-001 |
| **Título** | Reservar prenda disponible |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Reservations |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §6 — Flujo: apartar prenda |
| **Dueño** | Nexo project |
| **Dependencias** | FR-INV-004 (estado Available), FR-CUS-001 (crear cliente) |
| **Stories vinculadas** | US-004 |

## Declaración

El sistema debe permitir a un operador reservar una prenda `Available` para un
cliente, cambiando su estado a `Reserved`.

## Racional

Los clientes solicitan apartar prendas mientras deciden la compra. La reserva
evita que otro cliente la compre mientras tanto.

## Criterio de Aceptación

- Dado que una prenda está `Available`,
  cuando la reservo para un cliente,
  entonces su estado cambia a `Reserved`.

- Dado que el cliente no existe en el sistema,
  cuando intento reservar,
  entonces puedo crear un cliente con al menos nombre.

## Método de Verificación

- [ ] Prueba de integración: reserva cambia estado Available→Reserved.
- [ ] Demo: UI permite seleccionar prenda, crear/buscar cliente y reservar.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/` (pendiente crear módulo reservations)
  - `domain/item.ts` — transición de estado
  - `application/item.service.ts` — lógica de reserva
- Módulo de Customers (pendiente de implementar)

### Frontend
- Feature: `front/src/features/inventory/` — UI de reserva (pendiente)

### Prisma
- Modelo `Item` (transición de estado)
- Modelo de reserva (pendiente de crear)

## Notas

- La reserva en v1 es simple: sin anticipos ni cuentas por cobrar.
- FR-RES-002: la reserva guarda fecha y nota opcional.
