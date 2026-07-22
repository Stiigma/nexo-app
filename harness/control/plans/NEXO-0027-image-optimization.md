# NEXO-0027 - Image Optimization Pipeline (Sharp + WebP)

## Objective

Integrar un pipeline de optimización de imágenes directamente en el backend
NestJS usando Sharp (libvips). Toda foto subida a `POST /media/upload` se
convierte automáticamente a WebP, se redimensiona a 2048px máximo, se elimina
EXIF, y se comprime con calidad adaptativa. Esto reduce el tamaño de almacenamiento
60-80% sin pérdida de calidad perceptible, en menos de 200ms por foto.

## Done When

- `POST /media/upload` convierte automáticamente a WebP (calidad 82, resize max 2048px)
- Fotos de 12MP JPEG (~4MB) producen WebP de ≤500KB
- Fotos pequeñas (≤2048px) no se redimensionan — solo conversión
- EXIF/GPS eliminados automáticamente (privacidad)
- Auto-orientación basada en EXIF (fotos de celular siempre derechas)
- Response incluye `width`, `height`, `format`, `originalSize`, `optimizedSize`, `savedPercent`
- Tests unitarios: Sharp adapter (10+ casos) + UploadMediaUseCase (5+ casos)
- No regresiones en tests existentes
- Storage (Azure y Local) recibe versión optimizada, nunca la original

## Scope

- `ImageProcessorPort`: interfaz de procesamiento (Strategy)
- `SharpImageProcessorAdapter`: implementación con sharp
- `NoopImageProcessorAdapter`: adapter null para ambientes sin sharp
- `ImageOptimizationOptions` + `ProcessedImage`: value objects del dominio
- `UploadMediaUseCase`: application service orquestador
- Modificar `MediaController`: delegar en el use case en vez de storage directo
- Tests unitarios para el adapter y use case
- Manejo de errores: buffer inválido, imágenes corruptas, límite de píxeles

## Out Of Scope

- AVIF (codificación demasiado lenta para tiempo real — posible en v2)
- JPEG/PNG fallback (el frontend soporta WebP desde 2020)
- Thumbnails / múltiples resoluciones
- CDN / cache headers
- Procesamiento batch de fotos existentes (CLI separado)
- Commit, push, o deploy sin confirmación del usuario

## Steps

### Phase 1: Dependencies
1. Instalar `sharp` en `back/`

### Phase 2: Domain
2. Crear `back/src/modules/media/domain/image-format.enum.ts` — enumeración de formatos con mimeType/extension
3. Crear `back/src/modules/media/domain/image-processing.ts` — tipos puros: `ImageOptimizationOptions`, `ProcessedImage`, `ImageProcessingMetadata`, `ImageProcessorCapabilities`

### Phase 3: Application
4. Crear `back/src/modules/media/application/ports/image-processor.port.ts` — interfaz `ImageProcessorPort`
5. Modificar `back/src/modules/media/application/tokens.ts` — agregar `IMAGE_PROCESSOR` Symbol
6. Crear `back/src/modules/media/application/services/upload-media.usecase.ts` — `UploadMediaUseCase`

### Phase 4: Infrastructure
7. Crear `back/src/modules/media/infrastructure/adapters/sharp-image-processor.adapter.ts` — adapter principal
8. Crear `back/src/modules/media/infrastructure/adapters/noop-image-processor.adapter.ts` — adapter null

### Phase 5: Interface
9. Modificar `back/src/modules/media/interface/http/media.controller.ts` — usar `UploadMediaUseCase`
10. Modificar `back/src/modules/media/interface/http/dto/upload-response.dto.ts` — añadir campos de optimización

### Phase 6: Module
11. Modificar `back/src/modules/media/media.module.ts` — registrar `ImageProcessorPort`, `UploadMediaUseCase`

### Phase 7: Tests
12. Crear `back/src/modules/media/__tests__/sharp-image-processor.adapter.spec.ts` — 10+ casos
13. Crear `back/src/modules/media/__tests__/upload-media.usecase.spec.ts` — 5+ casos

### Phase 8: Verify
14. Compilar (`pnpm tsc -p tsconfig.build.json`)
15. Ejecutar tests (`pnpm test:unit`)
16. Correr backend localmente y verificar upload con optimización

## Progress

- 2026-07-07: Diseñado por `nexo-plan`. Handoff creado: `HOFF-2026-07-07-image-optimization.md`.
- 2026-07-07: Implementado por `nexo-build` (delegado). 8 files new, 5 modify. 22 tests pasan (50/50 total). `pnpm tsc` 0 errors.
- 2026-07-07: Benchmark report ejecutado sobre 17 fotos reales del fixture. Resultado: 36.4% ahorro en fotos ya comprimidas (2.1 MB → 1.3 MB). Ver `reports/2026-07-07/NEXO-0027-image-optimization-benchmark.md`.

## Decision Log

- 2026-07-07: Sharp (libvips) como procesador de imágenes. 4-10x más rápido que Jimp/Canvas. Streaming nativo, ~50MB RAM.
- 2026-07-07: WebP como formato de salida único. 70% menos tamaño que JPEG con calidad visual idéntica. AVIF descartado por lentitud (30x más lento en encoder).
- 2026-07-07: Resize máximo 2048px. Suficiente para cualquier pantalla. Reduce 50-70% adicional del tamaño.
- 2026-07-07: Calidad adaptativa: empieza en 82, baja de 5 en 5 hasta 60 solo si el output excede 500KB.
- 2026-07-07: Patrón Port-Adapter + Application Service. `ImageProcessorPort` como estrategia, `SharpImageProcessorAdapter` como implementación, `UploadMediaUseCase` como orquestador.
- 2026-07-07: EXIF stripping por defecto (privacidad). Sin GPS, sin metadatos de dispositivo. Opción `preserveMetadata` para mantener ICC profiles.
- 2026-07-07: Auto-orientación vía `sharp().rotate()`. Fotos de celular siempre salen derechas.
- 2026-07-07: `NoopImageProcessorAdapter` para ambientes donde sharp no compila (CI mínimo, testing puro de HTTP sin imágenes reales).
- 2026-07-07: Se extiende el módulo `media` existente en vez de crear módulo separado. La optimización es parte integral del pipeline de upload.

## Risks

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Sharp no compila en CI (binarios nativos) | Build roto | Sharp distribuye binarios precompilados para Linux x64/arm64, macOS, Windows. Docker `node:22-slim` incluye libvips. `NoopImageProcessorAdapter` como fallback. |
| Fotos >100MP saturan RAM | Timeout/OOM | `limitInputPixels: 100_000_000` en sharp. Error claro, no crash. |
| Pérdida de metadatos útiles (ICC profiles) | Colores incorrectos | Opción `preserveMetadata: true` disponible. Default false por privacidad. |
| Timeout en uploads muy grandes | 504 Gateway | Sharp procesa <200ms para fotos normales. Timeout de 30s en controller para seguridad. |
| WebP no visible en Safari <14 | Imagen rota | Safari 14+ (2020) soporta WebP. iOS 14+ cubre >95% de dispositivos activos. |

## Verification

### Unit
- `pnpm test:unit` pasa — tests existentes sin regresiones
- Sharp adapter spec: 10+ tests (JPEG→WebP, resize, auto-rotate, EXIF strip, RGBA→RGB, calidad adaptativa, formato inseguro, buffer inválido)
- Use case spec: 5+ tests (procesa y almacena, metadata en response, extensión .webp, errores de processor, errores de storage)

### Manual (local)
```bash
# Subir JPEG grande
curl -X POST http://localhost:3000/api/v1/media/upload \
  -H "Cookie: nexo_access_token=..." \
  -F "file=@/path/to/12mp-photo.jpeg"

# Verificar response
# → format: "WEBP", mimeType: "image/webp"
# → optimizedSize << originalSize
# → savedPercent > 60
# → width ≤ 2048, height ≤ 2048

# Verificar archivo en storage
# → LS: ./storage/photos/uploads/*.webp
# → Azure: nexo-photos/uploads/*.webp
# → El archivo físico es WebP válido (abrir en navegador)
```

### Edge cases
- JPEG 12MP (4000px) → resize a 2048 + WebP q82 → ~250KB ✅
- PNG RGBA (transparencia) → flatten a RGB blanco + WebP → sin alpha ✅
- WebP input → no double-encode (sharp resize + re-encode q82 o no-op) ✅
- Imagen corrupta → error claro, no 500 ✅
- GIF input → rechazado por PhotoFileValidator (ya existente) ✅
- Foto con EXIF orientation=6 → auto-rotada ✅
- Buffer muy pequeño (no es imagen) → sharp error → traducido a 400 ✅
