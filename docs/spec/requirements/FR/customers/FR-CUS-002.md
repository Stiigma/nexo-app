# FR-CUS-002: Almacenar contacto opcional

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-CUS-002 |
| **Título** | Almacenar contacto opcional |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Customers |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §4 — Cliente |
| **Dueño** | Nexo project |
| **Dependencias** | FR-CUS-001 (crear cliente) |
| **Stories vinculadas** | US-014 |

## Declaración

El sistema debe almacenar campos opcionales de contacto para cada cliente:
teléfono, Instagram, WhatsApp y notas.

## Racional

Los datos de contacto permiten al negocio comunicarse con los clientes para
notificarles de nuevas prendas, reservas o promociones.

## Criterio de Aceptación

- Dado que creo o edito un cliente,
  cuando ingreso teléfono, Instagram, WhatsApp o notas,
  entonces estos campos se guardan y son visibles en el detalle.

- Dado que un cliente no tiene datos de contacto,
  cuando veo su detalle,
  entonces los campos aparecen vacíos u ocultos.

## Método de Verificación

- [ ] Demo: Detalle de cliente muestra campos de contacto cuando existen.

## Artefactos de implementación

### Backend
- Módulo de Customers (pendiente)
  - DTOs con campos opcionales

### Frontend
- UI de detalle de cliente (pendiente)

### Prisma
- Modelo `Customer` con campos opcionales

## Notas

- P1: valioso pero no bloqueante para el MVP.
