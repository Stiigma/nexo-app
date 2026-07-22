# FR-CAT-004: Tax predeterminado editable por tienda

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-CAT-004 |
| **Título** | Tax predeterminado editable por tienda |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Catalogs |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Implemented |
| **Fuente** | `NEXO_PROJECT.md` §5 — Tax |
| **Dueño** | Nexo project |
| **Dependencias** | FR-CAT-001 (stores catalog) |
| **Stories vinculadas** | US-013 |

## Declaración

Cada tienda debe tener un campo editable de tasa de tax predeterminada, usado
al crear carritos de compra.

## Racional

Distintas tiendas en EE.UU. tienen diferentes tasas de tax. Poder configurarlas
por tienda evita errores de captura recurrentes.

## Criterio de Aceptación

- Dado que soy admin editando una tienda,
  cuando modifico su defaultTaxRate,
  entonces el nuevo valor se usa en carritos nuevos de esa tienda.

- Dado que un carrito se creó con un tax rate,
  cuando el admin cambia el defaultTaxRate después,
  entonces el carrito existente mantiene el valor original.

## Método de Verificación

- [ ] Demo: Editar tax rate de tienda y verificar precarga en nuevo carrito.
- [ ] Prueba de integración: PUT /stores/:id actualiza defaultTaxRate.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/catalogs/`
  - `interface/http/controllers/stores.controller.ts` — endpoint de actualización
  - `interface/http/dto/update-store.dto.ts` — DTO con defaultTaxRate
  - `infrastructure/repositories/prisma-catalog.repository.ts` — persistencia

### Frontend
- Feature: `front/src/features/catalogs/`
  - `components/CatalogFormDialog.tsx` — formulario de tienda con campo taxRate
  - `types/entities/store.ts` — tipo Store con defaultTaxRate

### Prisma
- Modelo `Store` (campo `defaultTaxRate`)

## Notas

- El tax rate se precarga al crear un carrito (FR-PUR-003) y es editable manualmente.
