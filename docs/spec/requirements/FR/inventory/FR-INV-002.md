# FR-INV-002: Foto principal obligatoria

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-INV-002 |
| **Título** | Foto principal obligatoria |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Inventory |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §4 — Prenda (campo: Foto principal obligatoria) |
| **Dueño** | Nexo project |
| **Dependencias** | IR-001 (S3 storage integration), FR-PUR-002 (carrito item con foto) |
| **Stories vinculadas** | US-002 |

## Declaración

El sistema debe requerir una foto principal por cada item de carrito de compra
y por cada prenda en inventario. No se puede guardar un item sin foto.

## Racional

La foto principal es esencial para identificar la prenda visualmente durante
captura, venta y consulta de inventario.

## Criterio de Aceptación

- Dado que intento guardar un item de carrito sin foto,
  cuando envío el formulario,
  entonces el sistema rechaza el guardado.

- Dado que una prenda existe en inventario,
  cuando consulto su detalle,
  entonces la foto principal se muestra.

## Método de Verificación

- [ ] Prueba de integración: creación de item sin foto es rechazada.
- [ ] Demo: UI no permite avanzar sin capturar foto.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/media/`
  - `domain/file.ts` — entidad File
  - `application/services/upload-media.usecase.ts` — subida a storage
  - `infrastructure/adapters/azure-blob-storage.adapter.ts` — Azure Blob
  - `infrastructure/adapters/local-storage.adapter.ts` — storage local para dev
  - `interface/http/media.controller.ts` — endpoints de subida
- Módulo NestJS: `back/src/modules/inventory/`
  - `interface/http/items.controller.ts` — validación de foto al crear

### Frontend
- Feature: `front/src/features/inventory/`
  - `components/PhotoLightbox.tsx` — visualizador de fotos
  - UI de captura de foto (pendiente de implementar)

### Prisma
- Modelo `ItemPhoto` en `back/prisma/schema.prisma`

## Notas

- ASM-005: Se asume que los operadores pueden capturar al menos una foto por prenda.
- DR-003: Las fotos se almacenan fuera de PostgreSQL (S3-compatible).
