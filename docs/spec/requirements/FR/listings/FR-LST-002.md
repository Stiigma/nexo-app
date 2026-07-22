# FR-LST-002: Publicación solo tras archivo completo y disponible

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-LST-002 |
| **Título** | Publicación solo tras archivo completo y disponible |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Listings |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §4 — Prenda — resolución OQ-007 |
| **Dueño** | Nexo project |
| **Dependencias** | FR-LST-001 (listing state), FR-INV-004 (Available state), FR-INV-011 (readiness) |
| **Stories vinculadas** | US-024 |

## Declaración

El sistema debe permitir la publicación comercial (`PUBLISHED`) solo cuando la
prenda está físicamente `Available` y su archivo comercial está completo según
el checklist de preparación. Una venta automáticamente retira la prenda de
publicación.

## Racional

Publicar una prenda incompleta daña la imagen del negocio y confunde a los
clientes. La despublicación automática al vender evita ofrecer prendas ya
vendidas.

## Criterio de Aceptación

- Dado que una prenda está físicamente `Available` y su readiness checklist
  está completo,
  cuando un admin la aprueba,
  entonces su listing cambia a `PUBLISHED`.

- Dado que una prenda está `PUBLISHED`,
  cuando la prenda se vende,
  entonces su listing deja de estar publicado (`DRAFT` o retirado).

- Dado que una prenda no está `Available` o le faltan datos del checklist,
  cuando intento publicarla,
  entonces el sistema lo rechaza.

## Método de Verificación

- [ ] Prueba de integración: publicación rechazada si no está Available.
- [ ] Prueba de integración: venta despublica automáticamente.
- [ ] Demo: UI muestra botón de publicar solo cuando es válido.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `application/item.service.ts` — validación de precondiciones de publicación
  - `interface/http/items.controller.ts` — endpoint de publicación

### Frontend
- Feature: `front/src/features/inventory/`
  - UI de publicación (pendiente de implementar)

## Notas

- La publicación es una acción de admin (parte de FR-AUTH-002).
- Implementar después del editor de prenda (FR-INV-010).
