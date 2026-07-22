# FR-RES-003: Liberar reserva

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-RES-003 |
| **Título** | Liberar reserva |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Reservations |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §7 — Apartados |
| **Dueño** | Nexo project |
| **Dependencias** | FR-RES-001 (reserva activa) |
| **Stories vinculadas** | US-016 |

## Declaración

El sistema debe permitir a un operador liberar (cancelar) una reserva activa,
regresando la prenda a estado `Available`.

## Racional

Si el cliente no concreta la compra, la prenda debe volver al inventario
disponible para otros clientes.

## Criterio de Aceptación

- Dado que una prenda está `Reserved`,
  cuando libero la reserva,
  entonces la prenda regresa a `Available`.

## Método de Verificación

- [ ] Prueba de integración: liberar reserva cambia Reserved→Available.
- [ ] Demo: UI muestra acción de liberar reserva.

## Artefactos de implementación

### Backend
- Módulo de Reservations (pendiente)
- API: POST /api/v1/reservations/:id/release

### Frontend
- UI de liberación (pendiente)

### Prisma
- Modelo de reserva con estado

## Notas

- P1: Importante pero no bloqueante para el MVP inicial.
