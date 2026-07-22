# FR-PUR-003: Cargar tax predeterminado de la tienda

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-PUR-003 |
| **Título** | Cargar tax predeterminado de la tienda |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Purchases |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §5 — Tax |
| **Dueño** | Nexo project |
| **Dependencias** | FR-CAT-004 (store tax rate editable), FR-CAT-001 (stores catalog) |
| **Stories vinculadas** | US-001 |

## Declaración

El sistema debe cargar la tasa de tax predeterminada de la tienda seleccionada
al crear un carrito de compra, y debe permitir su corrección manual.

## Racional

Cada tienda en EE.UU. tiene una tasa de tax distinta. Precargarla evita errores
de captura, pero el ticket real puede diferir y necesita corrección manual.

## Criterio de Aceptación

- Dado que selecciono una tienda al crear un carrito,
  cuando el formulario carga,
  entonces el campo de tax rate se prellena con el valor de la tienda.

- Dado que el tax rate precargado no coincide con el ticket real,
  cuando edito el campo,
  entonces puedo modificarlo antes de confirmar.

## Método de Verificación

- [ ] Prueba de integración: creación de carrito prellena taxRate desde store.
- [ ] Demo: Ver precarga y edición en formulario.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/catalogs/`
  - `interface/http/controllers/stores.controller.ts` — endpoint GET store con taxRate
  - `domain/simple-catalog-entity.ts` — entidad base de catálogo
- Módulo NestJS: `back/src/modules/inventory/`
  - `interface/http/purchases.controller.ts` — creación de carrito

### Frontend
- Feature: `front/src/features/catalogs/` — selector de tiendas
  - `services/catalog-service.ts` — obtiene datos de tienda
  - `types/entities/store.ts` — tipo Store con taxRate

### Prisma
- Modelo `Store` (campo `defaultTaxRate`) en `back/prisma/schema.prisma`

## Notas

- El taxRate es un dato operativo; no se valida contra ningún servicio externo en v1.
