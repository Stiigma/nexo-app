# FR-SAL-003: Capturar precio final, moneda, método y fecha

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-SAL-003 |
| **Título** | Capturar precio final, moneda, método y fecha |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Sales |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §6 — Flujo: vender prenda |
| **Dueño** | Nexo project |
| **Dependencias** | FR-CAT-003 (payment methods catalog) |
| **Stories vinculadas** | US-005 |

## Declaración

El sistema debe capturar y almacenar para cada venta: el precio final real (por
línea), la moneda de la venta, el método de pago y la fecha.

## Racional

Estos campos son esenciales para los registros financieros y los reportes
operativos.

## Criterio de Aceptación

- Dado que creo una venta,
  cuando capturo cada línea,
  entonces almaceno su precio final real, la moneda (MXN/USD), el método de pago
  y la fecha de venta.

- Dado que consulto la venta después,
  cuando veo su detalle,
  entonces todos estos campos son visibles.

## Método de Verificación

- [ ] Demo: Creación de venta con captura de todos los campos.
- [ ] Prueba de integración: GET /api/v1/sales/:id devuelve todos los campos.

## Artefactos de implementación

### Backend
- Módulo de Ventas (pendiente)
  - DTOs de creación y respuesta

### Frontend
- UI de formulario de venta (pendiente)

### Prisma
- Modelos `Sale` y `SaleLine` con campos financieros

## Notas

- FR-SAL-004 extiende para soporte USD.
- Payment method viene del catálogo (FR-CAT-003).
