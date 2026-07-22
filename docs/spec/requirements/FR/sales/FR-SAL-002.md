# FR-SAL-002: Asociar venta a cliente

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-SAL-002 |
| **Título** | Asociar venta a cliente |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Sales |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §6 — Flujo: vender prenda |
| **Dueño** | Nexo project |
| **Dependencias** | FR-CUS-001 (crear cliente) |
| **Stories vinculadas** | US-005 |

## Declaración

El sistema debe asociar cada venta a un cliente. El detalle de la venta debe
mostrar el cliente seleccionado.

## Racional

La vinculación cliente–venta permite consultar historial de compras por cliente
y analizar comportamiento de compra.

## Criterio de Aceptación

- Dado que creo una venta,
  cuando selecciono un cliente existente o creo uno nuevo,
  entonces la venta queda asociada a ese cliente.

- Dado que consulto una venta,
  cuando veo su detalle,
  entonces el cliente aparece en la pantalla.

## Método de Verificación

- [ ] Prueba de integración: creación de venta con y sin cliente.
- [ ] Demo: Detalle de venta muestra cliente.

## Artefactos de implementación

### Backend
- Módulo de Ventas (pendiente)
- Módulo de Customers (pendiente)

### Frontend
- UI de ventas con selector/buscador de clientes (pendiente)

### Prisma
- Modelo `Sale` con relación a `Customer`

## Notas

- El cliente es requerido (dato obligatorio).
