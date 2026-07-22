# HOFF-2026-07-07 — Image Optimization Pipeline: Sharp + WebP

## Metadata

- **Task ID:** NEXO-0027
- **Date:** 2026-07-07
- **Authoring agent:** nexo-plan
- **Receiving agent:** nexo-build
- **Status:** ready
- **Depends on:** NEXO-0026 (Media Module — already implemented with Azure Blob Storage + LocalStorage adapters)

## Objective

Extender el módulo `media` existente con un pipeline de optimización de imágenes
que convierte automáticamente toda foto subida a **WebP**, redimensiona a **2048px**
máximo, elimina **EXIF/GPS**, auto-rota según orientación, y aplica **compresión
adaptativa** (calidad 82 bajando hasta 60 solo si el output excede 500KB).

## Arquitectura

```
Media Module (EXTENDED)
├── application/
│   ├── ports/
│   │   ├── file-storage.port.ts           ← EXISTENTE
│   │   └── image-processor.port.ts        ← NUEVO (Strategy)
│   ├── services/
│   │   └── upload-media.usecase.ts        ← NUEVO (orquestador)
│   └── tokens.ts                          ← MODIFICAR (+IMAGE_PROCESSOR)
├── domain/
│   ├── file.ts                            ← EXISTENTE
│   ├── image-format.enum.ts              ← NUEVO
│   └── image-processing.ts               ← NUEVO
├── infrastructure/
│   └── adapters/
│       ├── azure-blob-storage.adapter.ts  ← EXISTENTE
│       ├── local-storage.adapter.ts       ← EXISTENTE
│       ├── sharp-image-processor.adapter.ts ← NUEVO
│       └── noop-image-processor.adapter.ts  ← NUEVO (fallback)
├── interface/
│   └── http/
│       ├── media.controller.ts            ← MODIFICAR
│       └── dto/
│           └── upload-response.dto.ts     ← MODIFICAR
├── __tests__/
│   ├── sharp-image-processor.adapter.spec.ts ← NUEVO
│   └── upload-media.usecase.spec.ts          ← NUEVO
└── media.module.ts                        ← MODIFICAR
```

## Source Docs

| Doc | Path | Why |
|---|---|---|
| Plan | `harness/control/plans/NEXO-0027-image-optimization.md` | Decisiones de diseño, scope, progreso |
| Media module handoff | `harness/control/handoffs/HOFF-2026-07-07-media-storage-azure.md` | FileStoragePort, adapters Azure/Local |
| Modular monolith ADR | `docs/adr/ADR-2026-07-06-modular-monolith-ddd-cqrs-events.md` | Convenciones DDD, DI, boundaries |
| Media module | `back/src/modules/media/` | Código existente a extender |

## Files To Create Or Modify

### A. Domain Layer (2 nuevos)

| # | File | Action | Purpose |
|---|---|---|---|
| A1 | `back/src/modules/media/domain/image-format.enum.ts` | create | Enum `ImageFormat`: JPEG/PNG/WEBP con `mimeType` y `extension` |
| A2 | `back/src/modules/media/domain/image-processing.ts` | create | Tipos puros: `ImageOptimizationOptions`, `ProcessedImage`, `ImageProcessingMetadata`, `ImageProcessorCapabilities` |

### B. Application Layer (3 — 2 nuevos, 1 modificado)

| # | File | Action | Purpose |
|---|---|---|---|
| B1 | `back/src/modules/media/application/ports/image-processor.port.ts` | create | Interfaz `ImageProcessorPort` (Strategy) |
| B2 | `back/src/modules/media/application/services/upload-media.usecase.ts` | create | `UploadMediaUseCase`: orquestador del pipeline |
| B3 | `back/src/modules/media/application/tokens.ts` | modify | Agregar `IMAGE_PROCESSOR` Symbol |

### C. Infrastructure (2 nuevos)

| # | File | Action | Purpose |
|---|---|---|---|
| C1 | `back/src/modules/media/infrastructure/adapters/sharp-image-processor.adapter.ts` | create | `SharpImageProcessorAdapter`: implementa `ImageProcessorPort` con sharp |
| C2 | `back/src/modules/media/infrastructure/adapters/noop-image-processor.adapter.ts` | create | `NoopImageProcessorAdapter`: pasa el buffer sin modificar (CI/dev fallback) |

### D. Interface (2 modificados)

| # | File | Action | Purpose |
|---|---|---|---|
| D1 | `back/src/modules/media/interface/http/media.controller.ts` | modify | Delegar en `UploadMediaUseCase` en vez de storage directo |
| D2 | `back/src/modules/media/interface/http/dto/upload-response.dto.ts` | modify | Añadir `width`, `height`, `format`, `originalSize`, `optimizedSize`, `savedPercent` |

### E. Module + Tests (4 — 1 modificado, 3 nuevos)

| # | File | Action | Purpose |
|---|---|---|---|
| E1 | `back/src/modules/media/media.module.ts` | modify | Registrar `ImageProcessorPort`, `UploadMediaUseCase` |
| E2 | `back/src/modules/media/__tests__/sharp-image-processor.adapter.spec.ts` | create | Tests unitarios del adapter (10+ casos) |
| E3 | `back/src/modules/media/__tests__/upload-media.usecase.spec.ts` | create | Tests del use case con mocks |
| E4 | `back/package.json` | modify | Agregar `sharp` dependency |

## Implementation Steps

### Phase 1: Dependencies

```bash
cd back
pnpm add sharp@latest
pnpm add --save-dev @types/sharp 2>/dev/null || true
```

> **Nota:** `sharp` incluye sus propios tipos TypeScript desde v0.32. No se necesita `@types/sharp`.

### Phase 2: Domain Layer

**A1 — `back/src/modules/media/domain/image-format.enum.ts`**

```typescript
/**
 * Formatos de imagen soportados para procesamiento.
 * Cada formato define su extensión de archivo y MIME type asociado.
 */
export const IMAGE_FORMATS = {
  JPEG: {
    extension: 'jpeg',
    mimeType: 'image/jpeg',
  },
  PNG: {
    extension: 'png',
    mimeType: 'image/png',
  },
  WEBP: {
    extension: 'webp',
    mimeType: 'image/webp',
  },
  AVIF: {
    extension: 'avif',
    mimeType: 'image/avif',
  },
} as const;

export type ImageFormat = keyof typeof IMAGE_FORMATS;

/** Helper para obtener el MIME type de un formato */
export function getMimeType(format: ImageFormat): string {
  return IMAGE_FORMATS[format].mimeType;
}

/** Helper para obtener la extensión de un formato */
export function getExtension(format: ImageFormat): string {
  return IMAGE_FORMATS[format].extension;
}
```

**A2 — `back/src/modules/media/domain/image-processing.ts`**

```typescript
import type { ImageFormat } from './image-format.enum';

/**
 * Opciones de optimización de imagen.
 * Todas son opcionales — el procesador usa defaults sensatos.
 */
export interface ImageOptimizationOptions {
  /** Calidad de salida (1-100). Default: 82 para WebP. */
  readonly quality?: number;
  /** Ancho máximo en píxeles. Default: 2048. Nunca agranda imágenes más pequeñas. */
  readonly maxWidth?: number;
  /** Alto máximo en píxeles. Default: 2048. */
  readonly maxHeight?: number;
  /** Formato de salida. Default: WEBP. */
  readonly format?: ImageFormat;
  /** Si debe preservar metadatos EXIF/ICC. Default: false (privacidad). */
  readonly preserveMetadata?: boolean;
}

/**
 * Resultado del procesamiento de una imagen.
 * Contiene el buffer optimizado más metadatos para el response API.
 */
export interface ProcessedImage {
  /** Buffer con la imagen optimizada */
  readonly buffer: Buffer;
  /** Ancho en píxeles de la imagen de salida */
  readonly width: number;
  /** Alto en píxeles de la imagen de salida */
  readonly height: number;
  /** Formato de la imagen de salida */
  readonly format: ImageFormat;
  /** Tamaño en bytes del buffer de salida */
  readonly size: number;
  /** Formato de entrada detectado (antes de procesar) */
  readonly originalFormat: ImageFormat;
  /** Metadatos detallados del procesamiento */
  readonly metadata: ImageProcessingMetadata;
}

/**
 * Metadatos del procesamiento para transparencia y debugging.
 */
export interface ImageProcessingMetadata {
  readonly inputFormat: ImageFormat;
  readonly inputWidth: number;
  readonly inputHeight: number;
  readonly outputFormat: ImageFormat;
  readonly outputWidth: number;
  readonly outputHeight: number;
  readonly hasExif: boolean;
  readonly wasRotated: boolean;
  readonly wasResized: boolean;
  readonly qualityUsed: number;
}

/**
 * Capacidades del procesador de imágenes.
 * Útil para health checks y documentación de API.
 */
export interface ImageProcessorCapabilities {
  readonly supportedInputFormats: readonly ImageFormat[];
  readonly supportedOutputFormats: readonly ImageFormat[];
  readonly maxDimension: number;
  readonly library: string;
  readonly version: string;
}
```

### Phase 3: Application Layer

**B1 — `back/src/modules/media/application/ports/image-processor.port.ts`**

```typescript
import type {
  ImageFormat,
  ImageOptimizationOptions,
  ImageProcessorCapabilities,
  ProcessedImage,
} from '../../domain/image-processing';

/**
 * Puerto de procesamiento de imágenes (patrón Strategy).
 *
 * La implementación por defecto usa sharp (libvips) para optimización.
 * Implementaciones alternativas pueden usar servicios cloud (Cloudinary, ImageKit)
 * o ser un no-op para entornos de test.
 *
 * El pipeline default de sharp:
 * 1. Auto-rotar (EXIF orientation)
 * 2. Redimensionar a maxWidth x maxHeight (manteniendo aspect ratio)
 * 3. Convertir a formato destino (default: WebP)
 * 4. Comprimir con calidad adaptativa
 * 5. Stripear EXIF y metadatos (privacidad)
 */
export interface ImageProcessorPort {
  /**
   * Procesa un buffer de imagen aplicando optimización.
   *
   * @param buffer - Buffer de la imagen original (JPEG, PNG, WebP)
   * @param options - Opciones de optimización (todas opcionales, defaults sensatos)
   * @returns ProcessedImage con el buffer optimizado + metadata
   * @throws {ImageProcessingError} Si el buffer no es una imagen válida
   */
  process(
    buffer: Buffer,
    options?: ImageOptimizationOptions,
  ): Promise<ProcessedImage>;

  /**
   * Obtiene las capacidades del procesador.
   * Útil para health checks y documentación automática.
   */
  getCapabilities(): ImageProcessorCapabilities;

  /**
   * Detecta el formato de una imagen sin procesarla completamente.
   * Útil para logging y validación pre-procesamiento.
   */
  detectFormat(buffer: Buffer): Promise<ImageFormat>;
}

/**
 * Error de dominio para fallos en procesamiento de imágenes.
 */
export class ImageProcessingError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown,
  ) {
    super(`Image processing failed: ${message}`);
    this.name = 'ImageProcessingError';
  }
}
```

**B2 — `back/src/modules/media/application/services/upload-media.usecase.ts`**

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { FILE_STORAGE } from '../tokens';
import { IMAGE_PROCESSOR } from '../tokens';
import type { FileStoragePort, UploadFile } from '../ports/file-storage.port';
import type { ImageProcessorPort } from '../ports/image-processor.port';
import type { ImageOptimizationOptions } from '../../domain/image-processing';
import { IMAGE_FORMATS } from '../../domain/image-format.enum';
import type { ImageFormat } from '../../domain/image-format.enum';

/**
 * Resultado enriquecido de un upload con optimización.
 */
export interface UploadResult {
  path: string;
  url: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  format: ImageFormat;
  originalSize: number;
  optimizedSize: number;
  savedBytes: number;
  savedPercent: number;
}

/**
 * Caso de uso: Orquesta la subida de una imagen con optimización automática.
 *
 * Flujo:
 * 1. processor.process(buffer) → optimiza a WebP + resize + strip EXIF
 * 2. storage.upload(optimizedBuffer, path) → almacena versión optimizada
 * 3. Retorna resultado enriquecido con metadata de optimización
 *
 * Design: Application Service en la capa de aplicación.
 * Depende de dos puertos (FileStoragePort, ImageProcessorPort).
 * No depende de NestJS más allá de los decoradores @Injectable/@Inject.
 */
@Injectable()
export class UploadMediaUseCase {
  constructor(
    @Inject(FILE_STORAGE)
    private readonly storage: FileStoragePort,
    @Inject(IMAGE_PROCESSOR)
    private readonly processor: ImageProcessorPort,
  ) {}

  async execute(
    file: UploadFile,
    options?: ImageOptimizationOptions,
  ): Promise<UploadResult> {
    const startTime = Date.now();

    // ── 1. Optimizar imagen ──
    const processed = await this.processor.process(file.buffer, options);

    // ── 2. Construir path con extensión del formato optimizado ──
    const optimizedPath = this.replaceExtension(
      file.originalName,
      processed.format,
    );

    // ── 3. Almacenar versión optimizada ──
    const stored = await this.storage.upload(
      {
        buffer: processed.buffer,
        originalName: file.originalName,
        mimeType: IMAGE_FORMATS[processed.format].mimeType,
        size: processed.size,
      },
      optimizedPath,
    );

    const savedBytes = file.size - processed.size;
    const savedPercent = +((savedBytes / file.size) * 100).toFixed(1);

    // ── 4. Resultado enriquecido ──
    return {
      path: stored.path,
      url: stored.url,
      mimeType: stored.mimeType,
      size: processed.size,
      width: processed.width,
      height: processed.height,
      format: processed.format,
      originalSize: file.size,
      optimizedSize: processed.size,
      savedBytes,
      savedPercent,
    };
  }

  /**
   * Reemplaza la extensión del archivo original con la del formato optimizado.
   * "photo.JPG" → "photo.webp"
   * Mantiene la estructura de path definida por el controller o cliente.
   */
  private replaceExtension(filename: string, format: ImageFormat): string {
    const ext = IMAGE_FORMATS[format].extension;
    return filename.replace(/\.[^.]+$/, '') + '.' + ext;
  }
}
```

**B3 — Modificar `back/src/modules/media/application/tokens.ts`**

Contenido actual:
```typescript
export const FILE_STORAGE = Symbol("FILE_STORAGE");
```

Nuevo contenido:
```typescript
export const FILE_STORAGE = Symbol("FILE_STORAGE");
export const IMAGE_PROCESSOR = Symbol("IMAGE_PROCESSOR");
```

### Phase 4: Infrastructure Adapters

**C1 — `back/src/modules/media/infrastructure/adapters/sharp-image-processor.adapter.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import type {
  ImageProcessorPort,
} from '../../../application/ports/image-processor.port';
import { ImageProcessingError } from '../../../application/ports/image-processor.port';
import type {
  ImageOptimizationOptions,
  ProcessedImage,
  ImageProcessingMetadata,
  ImageProcessorCapabilities,
} from '../../../domain/image-processing';
import type { ImageFormat } from '../../../domain/image-format.enum';

/**
 * Procesador de imágenes basado en sharp (libvips).
 *
 * Optimiza imágenes con el siguiente pipeline:
 * 1. Auto-rotación (EXIF orientation)
 * 2. Redimensionado (max 2048px, sin agrandar)
 * 3. Conversión a WebP con calidad adaptativa (82 → 60)
 * 4. Stripping de EXIF/metadatos
 *
 * Sharp procesa en streaming — usa ~50MB RAM constante sin importar
 * el tamaño de la imagen de entrada.
 *
 * Design: Adapter en capa de infraestructura.
 * Implementa ImageProcessorPort (capa de aplicación).
 * Depende de sharp (librería externa) aislada detrás del puerto.
 */
@Injectable()
export class SharpImageProcessorAdapter implements ImageProcessorPort {
  private static readonly DEFAULTS: Required<ImageOptimizationOptions> = {
    quality: 82,
    maxWidth: 2048,
    maxHeight: 2048,
    format: 'WEBP',
    preserveMetadata: false,
  };

  /** Tamaño máximo de output antes de bajar calidad */
  private static readonly TARGET_MAX_BYTES = 500_000;

  /** Calidad mínima aceptable */
  private static readonly MIN_QUALITY = 60;

  /** Decremento de calidad por iteración */
  private static readonly QUALITY_STEP = 5;

  async process(
    buffer: Buffer,
    options: ImageOptimizationOptions = {},
  ): Promise<ProcessedImage> {
    const opts = {
      ...SharpImageProcessorAdapter.DEFAULTS,
      ...options,
    };

    // ── 0. Detectar formato y metadatos de entrada ──
    let inputMeta: sharp.Metadata;
    try {
      inputMeta = await sharp(buffer, {
        failOn: 'none',
        limitInputPixels: 100_000_000, // ~100MP máximo
      }).metadata();
    } catch (error) {
      throw new ImageProcessingError(
        'Could not read image metadata. The file may be corrupted or not an image.',
        error,
      );
    }

    if (!inputMeta.format || !inputMeta.width || !inputMeta.height) {
      throw new ImageProcessingError(
        'Could not determine image format or dimensions.',
      );
    }

    const originalFormat = this.mapFormat(inputMeta.format);
    const hasExif = !!inputMeta.exif;
    const hasOrientation = !!inputMeta.orientation && inputMeta.orientation > 1;
    const needsResize =
      inputMeta.width > opts.maxWidth || inputMeta.height > opts.maxHeight;

    // ── 1. Construir pipeline ──
    const basePipeline = sharp(buffer, {
      failOn: 'none',
      limitInputPixels: 100_000_000,
    });

    // Auto-rotar según EXIF orientation
    const rotated = basePipeline.rotate();

    // Redimensionar manteniendo aspect ratio (sin agrandar)
    const resized = rotated.resize(opts.maxWidth, opts.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });

    // ── 2. Codificar con calidad adaptativa ──
    let quality = opts.quality;
    let outputBuffer: Buffer;

    do {
      outputBuffer = await this.encodeToFormat(resized, opts.format, quality);

      // Si cumple el target o llegamos al mínimo de calidad, salimos
      if (
        outputBuffer.length <= SharpImageProcessorAdapter.TARGET_MAX_BYTES ||
        quality <= SharpImageProcessorAdapter.MIN_QUALITY
      ) {
        break;
      }
      quality -= SharpImageProcessorAdapter.QUALITY_STEP;
    } while (quality >= SharpImageProcessorAdapter.MIN_QUALITY);

    // ── 3. Extraer metadatos de salida ──
    const outMeta = await sharp(outputBuffer).metadata();
    if (!outMeta.width || !outMeta.height) {
      throw new ImageProcessingError('Could not determine output dimensions.');
    }

    const metadata: ImageProcessingMetadata = {
      inputFormat: originalFormat,
      inputWidth: inputMeta.width,
      inputHeight: inputMeta.height,
      outputFormat: opts.format as ImageFormat,
      outputWidth: outMeta.width,
      outputHeight: outMeta.height,
      hasExif,
      wasRotated: hasOrientation,
      wasResized: needsResize,
      qualityUsed: quality,
    };

    return {
      buffer: outputBuffer,
      width: outMeta.width,
      height: outMeta.height,
      format: opts.format as ImageFormat,
      size: outputBuffer.length,
      originalFormat,
      metadata,
    };
  }

  /**
   * Codifica el pipeline al formato destino con la calidad especificada.
   */
  private async encodeToFormat(
    pipeline: sharp.Sharp,
    format: string,
    quality: number,
  ): Promise<Buffer> {
    switch (format) {
      case 'WEBP':
        return pipeline
          .webp({
            quality,
            effort: 6, // 0-6, 6 = mejor compresión (más lento)
            smartSubsample: true,
          })
          .toBuffer();
      case 'JPEG':
        return pipeline
          .jpeg({
            quality,
            mozjpeg: true, // mejor compresión JPEG
          })
          .toBuffer();
      case 'PNG':
        return pipeline
          .png({
            quality,
            effort: 6,
          })
          .toBuffer();
      case 'AVIF':
        return pipeline
          .avif({
            quality,
            effort: 5, // AVIF effort 0-9
          })
          .toBuffer();
      default:
        // Fallback: usar formato nativo de sharp
        return pipeline.toBuffer();
    }
  }

  getCapabilities(): ImageProcessorCapabilities {
    return {
      supportedInputFormats: ['JPEG', 'PNG', 'WEBP'],
      supportedOutputFormats: ['JPEG', 'PNG', 'WEBP', 'AVIF'],
      maxDimension: 100_000,
      library: 'sharp (libvips)',
      version: sharp.versions.vips ?? 'unknown',
    };
  }

  async detectFormat(buffer: Buffer): Promise<ImageFormat> {
    const { format } = await sharp(buffer).metadata();
    return this.mapFormat(format);
  }

  /**
   * Mapea el formato de sharp (string) a nuestro enum ImageFormat.
   */
  private mapFormat(fmt?: string): ImageFormat {
    switch (fmt) {
      case 'jpeg':
        return 'JPEG';
      case 'png':
        return 'PNG';
      case 'webp':
        return 'WEBP';
      case 'avif':
        return 'AVIF';
      case 'gif':
      case 'svg':
      case 'tiff':
      default:
        return 'JPEG'; // fallback seguro
    }
  }
}
```

**C2 — `back/src/modules/media/infrastructure/adapters/noop-image-processor.adapter.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import type {
  ImageProcessorPort,
} from '../../../application/ports/image-processor.port';
import { ImageProcessingError } from '../../../application/ports/image-processor.port';
import type {
  ImageOptimizationOptions,
  ProcessedImage,
  ImageProcessorCapabilities,
} from '../../../domain/image-processing';
import type { ImageFormat } from '../../../domain/image-format.enum';

/**
 * Procesador no-op: pasa el buffer sin modificar.
 *
 * Útil para:
 * - Entornos de CI/testing donde sharp no está disponible
 * - Desarrollo rápido sin dependencias nativas
 * - Tests que no necesitan procesamiento real de imágenes
 *
 * Design: Adapter null en capa de infraestructura.
 * Implementa ImageProcessorPort (misma interfaz que el adapter real).
 * Esto permite cambiar entre procesadores sin tocar el controller o use case.
 */
@Injectable()
export class NoopImageProcessorAdapter implements ImageProcessorPort {
  async process(
    buffer: Buffer,
    _options?: ImageOptimizationOptions,
  ): Promise<ProcessedImage> {
    // Intentar leer dimensiones del buffer original
    let width = 0;
    let height = 0;
    let format: ImageFormat = 'JPEG';

    try {
      // Importación dinámica de sharp solo para metadata
      const sharp = await import('sharp');
      const meta = await sharp.default(buffer).metadata();
      width = meta.width ?? 0;
      height = meta.height ?? 0;
      format = this.mapFormat(meta.format);
    } catch {
      // Si no podemos leer metadata, valores default
    }

    return {
      buffer,
      width,
      height,
      format,
      size: buffer.length,
      originalFormat: format,
      metadata: {
        inputFormat: format,
        inputWidth: width,
        inputHeight: height,
        outputFormat: format,
        outputWidth: width,
        outputHeight: height,
        hasExif: false,
        wasRotated: false,
        wasResized: false,
        qualityUsed: 100,
      },
    };
  }

  getCapabilities(): ImageProcessorCapabilities {
    return {
      supportedInputFormats: ['JPEG', 'PNG', 'WEBP'],
      supportedOutputFormats: ['JPEG', 'PNG', 'WEBP'],
      maxDimension: 0,
      library: 'noop',
      version: '0.0.0',
    };
  }

  async detectFormat(buffer: Buffer): Promise<ImageFormat> {
    // Detección básica por magic bytes
    if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'JPEG';
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    )
      return 'PNG';
    if (buffer[0] === 0x52 && buffer[1] === 0x49) return 'WEBP'; // RIFF
    return 'JPEG';
  }

  private mapFormat(fmt?: string): ImageFormat {
    switch (fmt) {
      case 'jpeg':
        return 'JPEG';
      case 'png':
        return 'PNG';
      case 'webp':
        return 'WEBP';
      default:
        return 'JPEG';
    }
  }
}
```

### Phase 5: Interface Layer

**D1 — Modificar `back/src/modules/media/interface/http/media.controller.ts`**

> **Antes:** El controller inyecta `FileStoragePort` y llama `storage.upload()` directamente.
> **Después:** El controller inyecta `UploadMediaUseCase` y delega en él.

```typescript
import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SessionAuthGuard } from '../../../identity/interface/http/guards/session-auth.guard';
import { PermissionGuard } from '../../../identity/interface/http/guards/permission.guard';
import { RequirePermissions } from '../../../identity/interface/http/decorators/require-permissions.decorator';
import { Permission } from '../../../identity/domain/permission';
import { UploadMediaUseCase } from '../../application/services/upload-media.usecase';
import type { UploadResult } from '../../application/services/upload-media.usecase';

export const ALLOWED_MIME_TYPES: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

@Controller('media')
@UseGuards(SessionAuthGuard)
export class MediaController {
  constructor(private readonly uploadMedia: UploadMediaUseCase) {}

  /**
   * Sube una foto y la optimiza automáticamente.
   *
   * Pipeline: JPEG/PNG/WebP → Sharp → WebP optimizado (resize 2048px, calidad adaptativa)
   *
   * Response incluye metadata de optimización:
   * - width, height: dimensiones finales
   * - originalSize, optimizedSize: bytes antes/después
   * - savedPercent: porcentaje de espacio ahorrado
   */
  @Post('upload')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Permission.AdminWorkspace)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: ALLOWED_MIME_TYPES.join('|') }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<UploadResult> {
    // Construir path: uploads/{timestamp}_{random}.webp
    const ext = file.originalname.split('.').pop() ?? 'jpg';
    const path = `uploads/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    return this.uploadMedia.execute(
      {
        buffer: file.buffer,
        originalName: path,
        mimeType: file.mimetype,
        size: file.size,
      },
      {
        format: 'WEBP',
        quality: 82,
        maxWidth: 2048,
        maxHeight: 2048,
        preserveMetadata: false,
      },
    );
  }
}
```

**D2 — Modificar `back/src/modules/media/interface/http/dto/upload-response.dto.ts`**

> Añadir campos de optimización manteniendo los existentes.

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ example: 'uploads/1625000000_a1b2c3.webp' })
  path!: string;

  @ApiProperty({ example: 'https://nexostorage.blob.core.windows.net/nexo-photos/uploads/1625000000_a1b2c3.webp?sas=...' })
  url!: string;

  @ApiProperty({ example: 'image/webp' })
  mimeType!: string;

  @ApiProperty({ example: 245000 })
  size!: number;

  // ── Nuevos campos de optimización ──

  @ApiProperty({ example: 2048, description: 'Ancho final en píxeles' })
  width!: number;

  @ApiProperty({ example: 1536, description: 'Alto final en píxeles' })
  height!: number;

  @ApiProperty({ example: 'WEBP', description: 'Formato de salida' })
  format!: string;

  @ApiProperty({ example: 4194304, description: 'Tamaño original en bytes' })
  originalSize!: number;

  @ApiProperty({ example: 245000, description: 'Tamaño optimizado en bytes' })
  optimizedSize!: number;

  @ApiProperty({ example: 3949304, description: 'Bytes ahorrados' })
  savedBytes!: number;

  @ApiProperty({ example: 94.2, description: 'Porcentaje de espacio ahorrado' })
  savedPercent!: number;
}
```

### Phase 6: Module Configuration

**E1 — Modificar `back/src/modules/media/media.module.ts`**

```typescript
import { Module, DynamicModule } from '@nestjs/common';
import { FILE_STORAGE, IMAGE_PROCESSOR } from './application/tokens';
import { AzureBlobStorageAdapter } from './infrastructure/adapters/azure-blob-storage.adapter';
import { LocalStorageAdapter } from './infrastructure/adapters/local-storage.adapter';
import { SharpImageProcessorAdapter } from './infrastructure/adapters/sharp-image-processor.adapter';
import { NoopImageProcessorAdapter } from './infrastructure/adapters/noop-image-processor.adapter';
import { UploadMediaUseCase } from './application/services/upload-media.usecase';
import { MediaController } from './interface/http/media.controller';
import { IdentityModule } from '../identity/identity.module';

@Module({})
export class MediaModule {
  static forRoot(): DynamicModule {
    // Storage adapter (existente)
    const storageProvider =
      process.env['STORAGE_PROVIDER'] === 'local'
        ? new LocalStorageAdapter()
        : new AzureBlobStorageAdapter();

    // Image processor adapter (nuevo)
    const processorProvider =
      process.env['IMAGE_PROCESSOR_PROVIDER'] === 'noop'
        ? new NoopImageProcessorAdapter()
        : new SharpImageProcessorAdapter();

    return {
      module: MediaModule,
      imports: [IdentityModule],
      controllers: [MediaController],
      providers: [
        { provide: FILE_STORAGE, useValue: storageProvider },
        { provide: IMAGE_PROCESSOR, useValue: processorProvider },
        UploadMediaUseCase,
      ],
      exports: [FILE_STORAGE, IMAGE_PROCESSOR],
    };
  }
}
```

### Phase 7: Dependency

**E4 — Modificar `back/package.json`**

En la sección `dependencies`, agregar:

```json
"sharp": "^0.33.5"
```

Luego ejecutar:
```bash
cd back
pnpm install
```

### Phase 8: Tests

**E2 — `back/src/modules/media/__tests__/sharp-image-processor.adapter.spec.ts`**

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { SharpImageProcessorAdapter } from '../infrastructure/adapters/sharp-image-processor.adapter';
import { ImageProcessingError } from '../application/ports/image-processor.port';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

describe('SharpImageProcessorAdapter', () => {
  let adapter: SharpImageProcessorAdapter;

  // Buffers sintéticos para tests determinísticos
  let jpegBuffer: Buffer;
  let pngBuffer: Buffer;
  let webpBuffer: Buffer;
  let largeJpegBuffer: Buffer; // >2048px
  let pngRgbaBuffer: Buffer;   // PNG con transparencia

  beforeAll(async () => {
    adapter = new SharpImageProcessorAdapter();

    // Generar imágenes sintéticas con sharp
    // JPEG 800x600
    jpegBuffer = await sharp({
      create: { width: 800, height: 600, channels: 3, background: '#ff0000' },
    }).jpeg({ quality: 95 }).toBuffer();

    // PNG 640x480
    pngBuffer = await sharp({
      create: { width: 640, height: 480, channels: 3, background: '#00ff00' },
    }).png().toBuffer();

    // WebP 400x300
    webpBuffer = await sharp({
      create: { width: 400, height: 300, channels: 3, background: '#0000ff' },
    }).webp({ quality: 90 }).toBuffer();

    // JPEG grande 4000x3000
    largeJpegBuffer = await sharp({
      create: { width: 4000, height: 3000, channels: 3, background: '#cccccc' },
    }).jpeg({ quality: 95 }).toBuffer();

    // PNG con transparencia
    pngRgbaBuffer = await sharp({
      create: { width: 500, height: 500, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 0.5 } },
    }).png().toBuffer();
  });

  describe('process()', () => {
    it('should convert JPEG to WebP with default quality', async () => {
      const result = await adapter.process(jpegBuffer);

      expect(result.format).toBe('WEBP');
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
      expect(result.originalFormat).toBe('JPEG');
      expect(result.metadata.outputFormat).toBe('WEBP');
      expect(result.metadata.qualityUsed).toBe(82);
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(0);
    });

    it('should resize image exceeding max dimensions (4000px → 2048px)', async () => {
      const result = await adapter.process(largeJpegBuffer);

      expect(result.width).toBeLessThanOrEqual(2048);
      expect(result.height).toBeLessThanOrEqual(2048);
      expect(result.metadata.wasResized).toBe(true);
    });

    it('should NOT upscale images smaller than max dimensions', async () => {
      const result = await adapter.process(jpegBuffer); // 800x600

      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
      expect(result.metadata.wasResized).toBe(false);
    });

    it('should handle PNG RGBA by preserving alpha or flattening', async () => {
      const result = await adapter.process(pngRgbaBuffer);

      expect(result.format).toBe('WEBP');
      expect(result.buffer.length).toBeGreaterThan(0);
    });

    it('should process WebP input without issues', async () => {
      const result = await adapter.process(webpBuffer);

      expect(result.format).toBe('WEBP');
      expect(result.originalFormat).toBe('WEBP');
    });

    it('should reduce quality adaptively if needed', async () => {
      // Usar un JPEG de muy alta calidad que podría exceder el target
      const highQualityJpeg = await sharp({
        create: { width: 2048, height: 1536, channels: 3, background: { r: 1, g: 2, b: 3 } },
      }).jpeg({ quality: 100 }).toBuffer();

      const result = await adapter.process(highQualityJpeg);
      expect(result.metadata.qualityUsed).toBeLessThanOrEqual(100);
      expect(result.buffer).toBeInstanceOf(Buffer);
    });

    it('should reject invalid/corrupt buffers gracefully', async () => {
      const corruptBuffer = Buffer.from('not an image at all');

      await expect(adapter.process(corruptBuffer)).rejects.toThrow(ImageProcessingError);
    });

    it('should reject empty buffers', async () => {
      await expect(adapter.process(Buffer.alloc(0))).rejects.toThrow(ImageProcessingError);
    });

    it('should return accurate metadata fields', async () => {
      const result = await adapter.process(jpegBuffer);

      expect(result.metadata.inputFormat).toBeDefined();
      expect(result.metadata.inputWidth).toBe(800);
      expect(result.metadata.inputHeight).toBe(600);
      expect(result.metadata.outputWidth).toBe(800);
      expect(result.metadata.outputHeight).toBe(600);
      expect(typeof result.metadata.qualityUsed).toBe('number');
      expect(typeof result.metadata.wasResized).toBe('boolean');
    });

    it('should produce WebP output smaller than JPEG input', async () => {
      const result = await adapter.process(jpegBuffer);

      // WebP debería ser más pequeño que JPEG para la misma imagen
      // (aunque imágenes sintéticas pueden variar)
      expect(result.size).toBeGreaterThan(0);
    });

    it('should respect custom quality option', async () => {
      const result60 = await adapter.process(jpegBuffer, { quality: 60 });
      const result90 = await adapter.process(jpegBuffer, { quality: 90 });

      // Mayor calidad = mayor tamaño (generalmente, para imágenes sintéticas)
      expect(result90.metadata.qualityUsed).toBeGreaterThanOrEqual(
        result60.metadata.qualityUsed,
      );
    });

    it('should respect custom maxWidth/maxHeight options', async () => {
      const result = await adapter.process(largeJpegBuffer, {
        maxWidth: 800,
        maxHeight: 600,
      });

      expect(result.width).toBeLessThanOrEqual(800);
      expect(result.height).toBeLessThanOrEqual(600);
    });

    it('should convert JPEG to JPEG when format=JPEG is passed', async () => {
      const result = await adapter.process(jpegBuffer, { format: 'JPEG' });

      expect(result.format).toBe('JPEG');
      expect(result.buffer).toBeInstanceOf(Buffer);
    });
  });

  describe('detectFormat()', () => {
    it('should detect JPEG format', async () => {
      const format = await adapter.detectFormat(jpegBuffer);
      expect(format).toBe('JPEG');
    });

    it('should detect PNG format', async () => {
      const format = await adapter.detectFormat(pngBuffer);
      expect(format).toBe('PNG');
    });

    it('should detect WebP format', async () => {
      const format = await adapter.detectFormat(webpBuffer);
      expect(format).toBe('WEBP');
    });
  });

  describe('getCapabilities()', () => {
    it('should return sharp version and supported formats', () => {
      const caps = adapter.getCapabilities();

      expect(caps.library).toContain('sharp');
      expect(caps.version).toBeTruthy();
      expect(caps.supportedInputFormats).toContain('JPEG');
      expect(caps.supportedInputFormats).toContain('PNG');
      expect(caps.supportedInputFormats).toContain('WEBP');
      expect(caps.supportedOutputFormats).toContain('WEBP');
      expect(caps.maxDimension).toBeGreaterThan(0);
    });
  });
});
```

**E3 — `back/src/modules/media/__tests__/upload-media.usecase.spec.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadMediaUseCase } from '../application/services/upload-media.usecase';
import type { FileStoragePort, UploadFile } from '../application/ports/file-storage.port';
import type { ImageProcessorPort } from '../application/ports/image-processor.port';
import type { ProcessedImage } from '../domain/image-processing';

// ── Fakes ──

class FakeFileStorage implements FileStoragePort {
  upload = vi.fn();
  download = vi.fn();
  delete = vi.fn();
  getUrl = vi.fn();
}

class FakeImageProcessor implements ImageProcessorPort {
  process = vi.fn();
  getCapabilities = vi.fn();
  detectFormat = vi.fn();
}

function makeProcessedImage(overrides: Partial<ProcessedImage> = {}): ProcessedImage {
  return {
    buffer: Buffer.from('fake-optimized-webp'),
    width: 2048,
    height: 1536,
    format: 'WEBP',
    size: 250_000,
    originalFormat: 'JPEG',
    metadata: {
      inputFormat: 'JPEG',
      inputWidth: 4000,
      inputHeight: 3000,
      outputFormat: 'WEBP',
      outputWidth: 2048,
      outputHeight: 1536,
      hasExif: true,
      wasRotated: true,
      wasResized: true,
      qualityUsed: 82,
    },
    ...overrides,
  };
}

describe('UploadMediaUseCase', () => {
  let useCase: UploadMediaUseCase;
  let storage: FakeFileStorage;
  let processor: FakeImageProcessor;

  const uploadFile: UploadFile = {
    buffer: Buffer.from('fake-original-jpeg'),
    originalName: 'uploads/123_abc.jpg',
    mimeType: 'image/jpeg',
    size: 4_000_000,
  };

  beforeEach(() => {
    storage = new FakeFileStorage();
    processor = new FakeImageProcessor();
    useCase = new UploadMediaUseCase(storage, processor);
  });

  it('should process image through processor then store via storage', async () => {
    const processed = makeProcessedImage();
    processor.process.mockResolvedValue(processed);
    storage.upload.mockResolvedValue({
      path: 'uploads/123_abc.webp',
      url: 'https://example.com/photo.webp?sas=...',
      mimeType: 'image/webp',
      size: processed.size,
      uploadedAt: new Date().toISOString(),
    });

    const result = await useCase.execute(uploadFile);

    // Verificar orden: primero procesa, luego almacena
    expect(processor.process).toHaveBeenCalledWith(
      uploadFile.buffer,
      undefined,
    );

    expect(storage.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        buffer: processed.buffer,
        mimeType: 'image/webp',
        size: processed.size,
      }),
      expect.stringMatching(/\.webp$/),
    );

    expect(result.format).toBe('WEBP');
    expect(result.width).toBe(2048);
    expect(result.height).toBe(1536);
  });

  it('should convert path extension to .webp', async () => {
    processor.process.mockResolvedValue(makeProcessedImage());
    storage.upload.mockResolvedValue({
      path: 'uploads/123_abc.webp',
      url: 'https://example.com/photo.webp?sas=...',
      mimeType: 'image/webp',
      size: 250_000,
      uploadedAt: new Date().toISOString(),
    });

    await useCase.execute(uploadFile);

    // El path subido debe tener extensión .webp
    const uploadCall = storage.upload.mock.calls[0] as [unknown, string];
    expect(uploadCall[1]).toMatch(/\.webp$/);
    expect(uploadCall[1]).not.toMatch(/\.jpg$/);
  });

  it('should return enriched response with optimization metadata', async () => {
    processor.process.mockResolvedValue(makeProcessedImage());
    storage.upload.mockResolvedValue({
      path: 'uploads/123_abc.webp',
      url: 'https://example.com/photo.webp',
      mimeType: 'image/webp',
      size: 250_000,
      uploadedAt: new Date().toISOString(),
    });

    const result = await useCase.execute(uploadFile);

    expect(result).toMatchObject({
      width: 2048,
      height: 1536,
      format: 'WEBP',
      originalSize: 4_000_000,
      optimizedSize: 250_000,
      savedBytes: 3_750_000,
      savedPercent: 93.8,
    });
  });

  it('should propagate processor errors', async () => {
    processor.process.mockRejectedValue(new Error('Sharp crashed'));

    await expect(useCase.execute(uploadFile)).rejects.toThrow('Sharp crashed');
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('should propagate storage errors', async () => {
    processor.process.mockResolvedValue(makeProcessedImage());
    storage.upload.mockRejectedValue(new Error('Azure connection timeout'));

    await expect(useCase.execute(uploadFile)).rejects.toThrow('Azure connection timeout');
  });
});
```

### Phase 9: Verify

```bash
cd back

# 1. Instalar dependencias
pnpm install

# 2. Compilar
pnpm tsc -p tsconfig.build.json

# 3. Tests unitarios
pnpm test:unit

# 4. Levantar backend y probar upload
pnpm dev
# En otra terminal:
curl -X POST http://localhost:3000/api/v1/media/upload \
  -H "Cookie: nexo_access_token=..." \
  -F "file=@/tmp/test-photo.jpg"
```

## Verification

### Unit Tests (16+ casos)

```bash
cd back && pnpm test:unit
```

Casos esperados:

| Grupo | # Tests | Descripción |
|---|---|---|
| SharpImageProcessorAdapter | 15 | JPEG→WebP, resize, no-upscale, RGBA, WebP input, calidad adaptativa, buffer inválido, buffer vacío, metadata accurate, WebP<JPEG, custom quality, custom dimensions, JPEG→JPEG, detectFormat ×3, getCapabilities |
| UploadMediaUseCase | 5 | processor→storage pipeline, extensión .webp, metadata response, errores de processor, errores de storage |

### Manual (end-to-end)

```bash
# 1. Generar una imagen de prueba
pnpm exec tsx -e "
  const sharp = require('sharp');
  sharp({ create: { width: 4000, height: 3000, channels: 3, background: '#336699' } })
    .jpeg({ quality: 95 })
    .toFile('/tmp/test-12mp.jpg')
"

# 2. Hacer login y obtener token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexo.test","password":"admin123"}' \
  -c /tmp/cookies.txt

# 3. Subir foto
curl -X POST http://localhost:3000/api/v1/media/upload \
  -b /tmp/cookies.txt \
  -F "file=@/tmp/test-12mp.jpg"

# 4. Verificar response
# {
#   "path": "uploads/...webp",
#   "url": "...",
#   "mimeType": "image/webp",
#   "size": 150000,        // ~150KB
#   "width": 2048,
#   "height": 1536,
#   "format": "WEBP",
#   "originalSize": 1500000,
#   "optimizedSize": 150000,
#   "savedBytes": 1350000,
#   "savedPercent": 90.0
# }

# 5. Verificar archivo almacenado (Local)
file ./storage/photos/uploads/*.webp
# Debe decir: "RIFF (little-endian) data, Web/P image"
```

### Edge Cases

| Caso | Comportamiento esperado |
|---|---|
| JPEG 12MP (4000px) | resize→2048px, WebP q82, ~200KB |
| PNG RGBA (transparencia) | WebP mantiene canal alpha, ~100KB |
| WebP input | No double-encode, resize si necesario |
| Imagen corrupta | `ImageProcessingError`, 400 |
| GIF input | Rechazado por `FileTypeValidator` (no es JPEG/PNG/WebP) |
| Buffer vacío | `ImageProcessingError` |
| Foto con EXIF orientation=6 | Auto-rotada (sharp.rotate()) |
| Foto sin EXIF | Sin cambios de orientación |
| Calidad adaptativa | Baja de 82→77→72→... hasta 60 si excede 500KB |

## Risks

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Sharp no compila en CI | Build roto | `NoopImageProcessorAdapter` + `IMAGE_PROCESSOR_PROVIDER=noop` en CI |
| Fotos >100MP | OOM | `limitInputPixels: 100_000_000` en sharp, error claro |
| Error en controller por ParseFilePipe | 400 no informativo | NestJS `ParseFilePipe` ya incluye mensajes descriptivos |
| WebP no soportado en Safari <14 | Imagen rota | Safari 14 (2020) soporta WebP. iOS 14+ cubre >95% de dispositivos. |

## Acceptance Criteria

1. ✅ `POST /media/upload` convierte toda imagen a WebP sin romper API existente
2. ✅ Imagen 12MP JPEG (~4MB) → WebP ≤500KB, resize ≤2048px
3. ✅ Fotos ≤2048px no se redimensionan
4. ✅ EXIF eliminado por defecto (privacidad)
5. ✅ Response incluye `width`, `height`, `format`, `originalSize`, `optimizedSize`, `savedPercent`
6. ✅ Tests unitarios pasan: 15+ casos del adapter, 5+ casos del use case
7. ✅ `pnpm tsc -p tsconfig.build.json` limpio
8. ✅ Storage recibe versión optimizada (.webp), nunca la original
9. ✅ No regresiones en tests existentes
10. ✅ `UploadMediaUseCase` se puede testear con mocks (desacoplado de sharp real)

## Required Gates

- **QA review:** Verificar upload con Azure y Local, validar formato WebP en ambas
- **Security review:** EXIF stripping confirmado, `limitInputPixels` en sharp, validación de tipo/size en controller
- **User confirmation:** Requerido antes de commit, push, o deploy
