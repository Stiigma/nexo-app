# FR-LST-001: Estado comercial separado del físico

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-LST-001 |
| **Título** | Estado comercial separado del físico |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Listings |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §4 — Prenda (estados) — resolución OQ-007 |
| **Dueño** | Nexo project |
| **Dependencias** | FR-INV-004 (estados físicos), FR-INV-011 (readiness checklist) |
| **Stories vinculadas** | US-024 |

## Declaración

El sistema debe mantener el estado de listing comercial (`DRAFT`,
`READY_FOR_REVIEW`, `PUBLISHED`, `PAUSED`) separado del estado físico de
inventario (`PRICE_PENDING`, `AVAILABLE`, `RESERVED`, `SOLD`).

## Racional

Una prenda puede estar físicamente disponible pero no lista para ofrecerse al
público (ej. falta revisión de fotos, descripción). Separar ambos ciclos
permite control editorial sin afectar la gestión de inventario.

## Criterio de Aceptación

- Dado que una prenda está físicamente `Available`,
  cuando su listing está en `DRAFT`,
  entonces no aparece publicada.

- Dado que una prenda tiene listing `PUBLISHED`,
  cuando la prenda se vende,
  entonces su listing pasa a no publicado mientras el estado físico es `SOLD`.

## Método de Verificación

- [ ] Prueba de integración: transiciones de listing independientes del estado físico.
- [ ] Demo: UI muestra listing state separado del inventory state.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `domain/item.ts` — campo `listingStatus` en la entidad (futuro)
  - `domain/item-status.enum.ts` — posible extensión con listing states

### Frontend
- Feature: `front/src/features/inventory/`
  - UI de listing state (pendiente de implementar)

### Prisma
- Modelo `Item` (campo futuro `listingStatus`)

## Notas

- Resuelto OQ-007: listing lifecycle es independiente del físico.
- `PUBLISHED` requiere prenda `Available` + archivo completo (FR-LST-002).
