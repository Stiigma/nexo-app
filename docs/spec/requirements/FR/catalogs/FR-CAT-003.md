# FR-CAT-003: Gestionar métodos de pago, tipos de gasto, razones de diferencia

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-CAT-003 |
| **Título** | Gestionar métodos de pago, tipos de gasto, razones de diferencia |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Catalogs |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Implemented |
| **Fuente** | `NEXO_PROJECT.md` §7 — Catalogos |
| **Dueño** | Nexo project |
| **Dependencias** | FR-AUTH-002 (Admin role) |
| **Stories vinculadas** | US-020 |

## Declaración

El sistema debe permitir a administradores gestionar los catálogos operativos:
métodos de pago, tipos de gasto y razones de diferencia. Cada uno debe soportar
un campo JSON de metadatos para futura integración analítica.

## Racional

Estos catálogos alimentan flujos de venta, gastos y compras. El metadata JSON
permite extensibilidad sin cambiar el esquema.

## Criterio de Aceptación

- Dado que soy admin,
  cuando gestiono métodos de pago,
  entonces los operadores pueden seleccionar métodos activos en ventas.

- Dado que gestiono tipos de gasto,
  entonces los operadores pueden seleccionar tipos activos en gastos.

- Dado que gestiono razones de diferencia,
  entonces los operadores deben seleccionar una razón cuando hay diferencia
  en la confirmación del lote.

- Dado que creo una entidad con metadatos,
  cuando guardo,
  entonces el campo JSON se almacena y recupera correctamente.

## Método de Verificación

- [ ] Demo: CRUD de cada catálogo.
- [ ] Prueba de integración: metadata JSON se almacena y recupera.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/catalogs/`
  - `interface/http/controllers/simple-catalog-controllers.ts`
  - `domain/simple-catalog-entity.ts`

### Frontend
- Feature: `front/src/features/catalogs/`
  - `types/entities/payment-method.ts` — tipo PaymentMethod
  - `types/entities/expense-type.ts` — tipo ExpenseType
  - `types/entities/difference-reason.ts` — tipo DifferenceReason
  - `config/registry.ts` — registro de entidades

### Prisma
- Modelos: `PaymentMethod`, `ExpenseType`, `DifferenceReason` en `back/prisma/schema.prisma`
- Todos con campo `metadata` (JSON)

## Notas

- El metadata JSON prepara el sistema para data engineering futuro.
- FR-PUR-006 usa las razones de diferencia.
- FR-SAL-003 usa los métodos de pago.
- FR-EXP-001/002 usan los tipos de gasto.
