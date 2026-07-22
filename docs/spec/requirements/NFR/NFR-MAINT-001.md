# NFR-MAINT-001: Lógica de negocio testeable sin UI

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | NFR-MAINT-001 |
| **Título** | Lógica de negocio testeable sin UI |
| **Tipo** | NFR (Non-Functional Requirement) |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Draft |
| **Fuente** | Decisión de arquitectura |
| **Dueño** | Nexo project |

## Declaración

Los cálculos de negocio (tax, tipo de cambio, asignación de gastos, utilidad)
deben ser testeables mediante pruebas unitarias sin necesidad de UI ni
servidores en ejecución.

## Racional

Separar la lógica de negocio de la UI permite pruebas rápidas, detección
temprana de errores financieros y confianza en los cambios.

## Criterio de Aceptación

- Dado que modifico una regla de cálculo financiero,
  cuando ejecuto las pruebas unitarias,
  entonces las reglas se validan sin necesidad de navegador ni servidor HTTP.

## Método de Verificación

- [ ] Las suites de pruebas unitarias se ejecutan con `npx vitest run`.

## Artefactos de implementación

### Backend
- `back/vitest.config.ts` — configuración de vitest
- Pruebas existentes en:
  - `back/src/modules/inventory/application/__tests__/`
  - `back/src/modules/inventory/domain/__tests__/`
  - `back/src/modules/exchange-rate/__tests__/`
  - `back/src/modules/identity/domain/role-policy.spec.ts`
  - `back/src/modules/catalogs/application/__tests__/`

## Notas

- La arquitectura DDD con capas `domain/` puras facilita esta testabilidad.
- NFR-MAINT-001 es la razón por la que las reglas de negocio viven en `domain/`
  y `application/`, no en los controladores HTTP.
