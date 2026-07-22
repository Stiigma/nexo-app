# NFR-REL-001: Cálculos financieros determinísticos

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | NFR-REL-001 |
| **Título** | Cálculos financieros determinísticos |
| **Tipo** | NFR (Non-Functional Requirement) |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §5 — Política de moneda |
| **Dueño** | Nexo project |

## Declaración

Dados los mismos datos de entrada almacenados, el sistema debe producir
siempre los mismos totales, utilidades y márgenes.

## Racional

La confianza en los reportes financieros del negocio depende de que los
cálculos sean reproducibles y auditables.

## Criterio de Aceptación

- Dado un conjunto fijo de datos de compra, gastos y ventas,
  cuando ejecuto el cálculo de costo total,
  entonces el resultado es siempre el mismo.

- Dado un conjunto fijo de datos de venta,
  cuando ejecuto el cálculo de utilidad,
  entonces el resultado es siempre el mismo.

## Método de Verificación

- [ ] Prueba unitaria: ejecución repetida del mismo cálculo produce el mismo resultado.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/exchange-rate/`
  - `application/services/exchange-rate.service.ts` — tasa fijada en DB
- Módulo de Expenses (pendiente)
  - Lógica de asignación proporcional

## Notas

- DR-002: Los tipos de cambio se almacenan, no se recalculan.
- Open Question OQ-001: política de redondeo pendiente de definir.
