# FR-PUR-004: Tipo de cambio USD→MXN

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-PUR-004 |
| **Título** | Tipo de cambio USD→MXN |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Purchases |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §5 — Tipo de cambio |
| **Dueño** | Nexo project |
| **Dependencias** | IR-002 (exchange rate provider), IR-003 (Banxico recomendado) |
| **Stories vinculadas** | US-001 |

## Declaración

El sistema debe obtener o registrar el tipo de cambio USD→MXN para cada compra
en USD, y almacenar la tasa aplicada para que los cálculos sean auditables.

## Racional

Las compras en USD necesitan convertirse a MXN para reportes consolidados. La
tasa debe quedar fijada en el registro para que el cálculo sea determinístico.

## Criterio de Aceptación

- Dado que se crea un carrito en USD,
  cuando el carrito se guarda,
  entonces el tipo de cambio aplicado queda almacenado.

- Dado que el tipo de cambio externo cambia después de la compra,
  cuando consulto el lote histórico,
  entonces la tasa originalmente aplicada se mantiene.

## Método de Verificación

- [ ] Prueba unitaria: ExchangeRateService obtiene y almacena tasa.
- [ ] Prueba de integración: creación de carrito USD almacena exchangeRate.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/exchange-rate/`
  - `domain/exchange-rate.entity.ts` — entidad ExchangeRate
  - `application/services/exchange-rate.service.ts` — lógica de obtención
  - `application/ports/exchange-rate-provider.port.ts` — puerto del proveedor
  - `infrastructure/adapters/open-er-api.adapter.ts` — adapter open source
  - `infrastructure/repositories/exchange-rate.repository.ts` — persistencia
  - `interface/http/exchange-rate.controller.ts` — endpoints REST

### Frontend
- Sin componente directo; el valor se obtiene server-side al crear el carrito.

### Prisma
- Modelo `ExchangeRate` en `back/prisma/schema.prisma`

## Open Questions

- OQ-003: Fallback cuando el proveedor no está disponible.
- IR-003: ADR pendiente para proveedor definitivo.

## Notas

- La tasa se almacena en el registro de Purchase y en ExchangeRate.
- DR-002 exige que la tasa no se recalcule desde datos externos.
