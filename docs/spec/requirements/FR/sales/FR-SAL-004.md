# FR-SAL-004: Soporte USD con equivalente MXN

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-SAL-004 |
| **Título** | Soporte USD con equivalente MXN |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Sales |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §5 — Ventas en Mexico o USD |
| **Dueño** | Nexo project |
| **Dependencias** | FR-SAL-003 (captura de venta), DR-001 (moneda original + MXN), DR-002 (exchange rate almacenado), IR-002 (exchange rate provider) |
| **Stories vinculadas** | US-006 |

## Declaración

El sistema debe soportar ventas en USD, almacenando el monto original en USD,
el tipo de cambio aplicado y el equivalente en MXN.

## Racional

El negocio vende tanto en MXN (México) como en USD (turistas, frontera). Los
reportes consolidados deben estar en MXN.

## Criterio de Aceptación

- Dado que creo una venta en USD,
  cuando capturo el monto final,
  entonces el sistema almacena el monto original en USD, el tipo de cambio
  aplicado y el equivalente en MXN.

- Dado que el tipo de cambio externo cambia después de la venta,
  cuando consulto la venta histórica,
  entonces veo la tasa originalmente aplicada, no la actual.

## Método de Verificación

- [ ] Prueba unitaria: cálculo de equivalente MXN desde USD.
- [ ] Demo: Creación de venta en USD con visualización de equivalente MXN.

## Artefactos de implementación

### Backend
- Módulo de Ventas (pendiente)
- Módulo NestJS: `back/src/modules/exchange-rate/`
  - `application/services/exchange-rate.service.ts` — obtención de tasa
  - `infrastructure/repositories/exchange-rate.repository.ts` — almacenamiento

### Frontend
- UI de venta con selector de moneda (pendiente)

### Prisma
- Modelo `ExchangeRate` existente
- Modelos `Sale`/`SaleLine` con campos `originalCurrency`, `originalAmount`, `exchangeRate`, `mxnEquivalent`

## Notas

- DR-001 y DR-002: trazabilidad monetaria completa.
- La tasa usada debe ser la del momento de la venta, no la actual.
