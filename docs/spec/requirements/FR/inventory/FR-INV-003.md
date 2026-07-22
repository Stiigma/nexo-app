# FR-INV-003: Archivo mínimo de prenda

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-INV-003 |
| **Título** | Archivo mínimo de prenda |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Inventory |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §4 — Prenda (campos esenciales) |
| **Dueño** | Nexo project |
| **Dependencias** | FR-CAT-002 (categorías, tallas, condiciones, colores), FR-CAT-006 (clothing types) |
| **Stories vinculadas** | US-017 |

## Declaración

El sistema debe almacenar y mostrar los campos mínimos de una prenda: categoría,
marca, talla, condición, color, ubicación física, precio sugerido, costo de
compra, costo total, tax y notas.

## Racional

Sin estos datos no se puede completar la ficha comercial de la prenda para
ponerla disponible a la venta.

## Criterio de Aceptación

- Dado que una prenda existe,
  cuando veo su detalle,
  entonces se muestran: categoría, marca, talla, condición, color, ubicación
  física, precio sugerido, costo de compra, costo total y notas.

## Método de Verificación

- [ ] Demo: Detalle de prenda muestra todos los campos del archivo mínimo.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `domain/item.ts` — entidad con todos los campos
  - `interface/http/items.controller.ts` — endpoints GET /items/:id
  - `interface/http/dto/item-response.dto.ts` — DTO de respuesta
  - `infrastructure/repositories/prisma-inventory.repository.ts` — consulta

### Frontend
- Feature: `front/src/features/inventory/`
  - `components/ItemDetailModal.tsx` — detalle completo de prenda
  - `types/item.ts` — tipos del dominio

### Prisma
- Modelo `Item` en `back/prisma/schema.prisma`

## Notas

- Los campos de catálogo (categoría, marca, talla, etc.) se cargan de los
  catálogos respectivos (FR-CAT-*).
