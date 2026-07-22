# NEXO-0026 - Media Module — Storage Azure Blob

## Objective

Crear un módulo `media` con storage desacoplado usando patrón Port-Adapter.
Implementar Azure Blob Storage (SAS tokens, fotos privadas) + local fallback.

## Done When

- `POST /media/upload` acepta JPEG/PNG/WebP ≤ 5MB
- Azure genera SAS tokens con expiración 7 días
- LocalStorage funciona con `STORAGE_PROVIDER=local`
- `FileStoragePort` inyectable en cualquier módulo
- ADR documenta la decisión

## Scope

- Módulo `media` con DDD layers
- `FileStoragePort` interface
- `AzureBlobStorageAdapter`
- `LocalStorageAdapter`
- `POST /media/upload` controller
- Variables de entorno Azure
- ADR

## Out Of Scope

- Thumbnails / CDN
- Gallery UI
- Commit/push/deploy

## Steps

1. Install `@azure/storage-blob` + `@azure/identity`
2. Create domain (`StoredFile`) + application port (`FileStoragePort`)
3. Create `AzureBlobStorageAdapter`
4. Create `LocalStorageAdapter`
5. Create HTTP controller con `FileInterceptor` + validación
6. Create `MediaModule.forRoot()` con factory
7. Register in `AppModule`
8. Configurar `.env` vars
9. Create ADR
10. Verify

## Progress

- 2026-07-07: Designed by `nexo-plan`. Handoff created: `HOFF-2026-07-07-media-storage-azure.md`.

## Decision Log

- 2026-07-07: Patrón Port-Adapter. Azure principal, local fallback. SAS tokens privados con 7 días de expiración. 5MB max, JPEG/PNG/WebP, 5 fotos por artículo.

## Risks

- Connection string expuesta en `.env` → usar secretos de entorno en deploy real.
- Container no existe → crear en startup si no existe.
- SAS URLs muy largas → aceptable, frontend no ve el path crudo.

## Verification

- `pnpm test:unit` pasa
- Upload con Azure: retorna URL con SAS token
- Upload con local: guarda en `./storage/photos/`
- Archivo > 5MB → 400
- Archivo .gif → 400
- Sin auth → 401
