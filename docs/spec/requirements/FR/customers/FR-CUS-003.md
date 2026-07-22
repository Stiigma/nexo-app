# FR-CUS-003: Historial de compras y reservas

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-CUS-003 |
| **Título** | Historial de compras y reservas |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Customers |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §4 — Cliente |
| **Dueño** | Nexo project |
| **Dependencias** | FR-CUS-001 (cliente), FR-RES-001 (reservas), FR-SAL-001 (ventas) |
| **Stories vinculadas** | US-014 |

## Declaración

El detalle del cliente debe mostrar su historial de compras (ventas) y reservas
(activas y pasadas).

## Racional

El historial permite al operador dar un mejor servicio, conocer las preferencias
del cliente y hacer seguimiento de reservas.

## Criterio de Aceptación

- Dado que un cliente tiene ventas registradas,
  cuando veo su detalle,
  entonces veo la lista de sus compras con fechas y montos.

- Dado que un cliente tiene reservas activas o pasadas,
  cuando veo su detalle,
  entonces veo la lista de sus reservas.

## Método de Verificación

- [ ] Demo: Detalle de cliente muestra historial de compras y reservas.

## Artefactos de implementación

### Backend
- Módulo de Customers (pendiente)
  - Relaciones con Sale y Reservation

### Frontend
- UI de detalle de cliente con pestañas/tabs (pendiente)

### Prisma
- Relaciones entre `Customer`, `Sale` y `Reservation`

## Notas

- P1: valioso para la operación diaria pero no bloqueante.
- Depende de que existan los módulos de ventas y reservas.
