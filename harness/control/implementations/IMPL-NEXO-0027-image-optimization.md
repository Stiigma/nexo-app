# IMPL-NEXO-0027 — Image Optimization Pipeline (Sharp + WebP)

## Metadata

- **Task:** NEXO-0027
- **Date:** 2026-07-07
- **Agent:** nexo-build
- **Handoff:** HOFF-2026-07-07-image-optimization.md
- **Plan:** NEXO-0027-image-optimization.md

## Architecture

Extended the existing `media` module with a hexagonal Port-Adapter image
optimization pipeline. The `ImageProcessorPort` (Strategy pattern) abstracts
image processing, with `SharpImageProcessorAdapter` as the main implementation
and `NoopImageProcessorAdapter` as a fallback for environments without native
dependencies. The `UploadMediaUseCase` application service orchestrates the
full pipeline: processor → storage.

```
controller → UploadMediaUseCase → ImageProcessorPort → SharpImageProcessorAdapter (sharp/libvips)
                              → FileStoragePort → AzureBlobStorageAdapter | LocalStorageAdapter
```

## Files Created

| # | File | Purpose |
|---|---|---|
| 1 | `domain/image-format.enum.ts` | `IMAGE_FORMATS` const enum with JPEG/PNG/WEBP/AVIF; `ImageFormat` type, helpers |
| 2 | `domain/image-processing.ts` | Pure types: `ImageOptimizationOptions`, `ProcessedImage`, `ImageProcessingMetadata`, `ImageProcessorCapabilities` |
| 3 | `application/ports/image-processor.port.ts` | `ImageProcessorPort` interface (Strategy) + `ImageProcessingError` |
| 4 | `application/services/upload-media.usecase.ts` | `UploadMediaUseCase` orchestrator: process → replace ext → store → enriched result |
| 5 | `infrastructure/adapters/sharp-image-processor.adapter.ts` | sharp impl: WebP conversion, resize ≤2048px, adaptive quality (82→60), EXIF strip, auto-rotate |
| 6 | `infrastructure/adapters/noop-image-processor.adapter.ts` | Null adapter: pass-through for CI/dev, magic byte detection |
| 7 | `__tests__/sharp-image-processor.adapter.spec.ts` | 17 unit tests (process, detectFormat, getCapabilities) |
| 8 | `__tests__/upload-media.usecase.spec.ts` | 5 unit tests (pipeline order, extension swap, metadata, error propagation) |

## Files Modified

| # | File | Change |
|---|---|---|
| 9 | `application/tokens.ts` | Added `IMAGE_PROCESSOR` Symbol |
| 10 | `interface/http/media.controller.ts` | Delegates to `UploadMediaUseCase` instead of `FileStoragePort` directly; uses NestJS built-in `MaxFileSizeValidator`/`FileTypeValidator` |
| 11 | `interface/http/dto/upload-response.dto.ts` | Added `width`, `height`, `format`, `originalSize`, `optimizedSize`, `savedBytes`, `savedPercent` |
| 12 | `media.module.ts` | Registers `IMAGE_PROCESSOR` provider, `UploadMediaUseCase`, env-controlled adapter selection |
| 13 | `package.json` | Added `sharp@^0.35.3` dependency |

## Deviations from Handoff

Two corrections were required to compile:

1. **Import paths** in adapter files: handoff used `../../../application/...` but the correct relative path from `infrastructure/adapters/` is `../../application/...`.
2. **`ImageFormat` import** in `image-processor.port.ts`: handoff imported it from `domain/image-processing` but it's defined in `domain/image-format.enum.ts`.
3. **Sharp type references**: the handoff used `sharp.Metadata` and `sharp.Sharp` namespace types, which don't resolve with `esModuleInterop` + sharp's `export = sharp` pattern in v0.35. Replaced with `Awaited<ReturnType<...>>` and `ReturnType<typeof sharp>` type utilities.

## Verification

- `pnpm install` → success (sharp 0.35.3)
- `pnpm tsc -p tsconfig.build.json` → **clean** (0 errors)
- `pnpm test:unit` → **50 passed** (22 new + 28 existing, 0 regressions)
  - Sharp adapter: 17 tests ✅
  - UploadMediaUseCase: 5 tests ✅
  - Pre-existing tests: 28 tests ✅ (all pass, no regressions)

Note: 5 unhandled error events originate from `request-logging.interceptor.spec.ts` (pre-existing, unrelated to media module). These are Caused by unhandled RxJS errors in the test file's error callback path.

## Remaining

- Manual E2E verification with local backend (curl upload + verify WebP output)
- QA review: verify with both Azure and Local storage adapters
- Security review: EXIF stripping, limitInputPixels
- User confirmation required before commit/push/deploy
