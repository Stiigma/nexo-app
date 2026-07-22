# FR-RES-002: Guardar fecha y nota de reserva

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-RES-002 |
| **Título** | Guardar fecha y nota de reserva |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Reservations |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §4 — Apartado |
| **Dueño** | Nexo project |
| **Dependencias** | FR-RES-001 (crear reserva) |
| **Stories vinculadas** | US-004 |

## Declaración

El sistema debe almacenar la fecha de reserva y una nota opcional asociada a
cada reserva.

## Racional

La fecha y nota ayudan al operador a dar contexto a la reserva (ej. "lo pasa a
recoger el sábado").

## Criterio de Aceptación

- Dado que creo una reserva,
  cuando guardo,
  entonces la fecha actual se registra automáticamente.

- Dado que agrego una nota opcional a la reserva,
  cuando guardo,
  entonces la nota queda almacenada y visible en el detalle.

## Método de Verificación

- [ ] Demo: Detalle de reserva muestra fecha y nota.
- [ ] Prueba de integración: creación de reserva con y sin nota.

## Artefactos de implementación

### Backend
- Módulo de Reservations (pendiente de implementar)
- API: POST /api/v1/reservations

### Frontend
- UI de reserva (pendiente)

### Prisma
- Modelo de reserva con campos `reservationDate` y `note`

## Notas

- La nota es opcional; la fecha se asigna automáticamente.
