# HOFF-2026-07-07 — Media Module: Storage Desacoplado con Azure Blob

## Metadata

- **Task ID:** NEXO-0026
- **Date:** 2026-07-07
- **Authoring agent:** nexo-plan
- **Receiving agent:** nexo-build
- **Status:** ready
- **Depends on:** NEXO-0008 (catálogos), Inventory schema (ya migrado)

## Objective

Crear un módulo `media` con storage desacoplado usando el patrón **Port-Adapter**.
Implementar adaptador **Azure Blob Storage** como principal y **Local Storage**
como fallback de desarrollo. Las fotos serán privadas con **SAS tokens** (URLs
firmadas con expiración de 7 días).

## Decisiones de diseño

| Decisión | Valor | Justificación |
|---|---|---|
| Tamaño máximo por foto | **5 MB** | Suficiente para JPEG de alta calidad. WebP pesa aún menos. |
| Formatos permitidos | **JPEG, PNG, WebP** | Cobertura universal + WebP para eficiencia. |
| Máximo fotos por artículo | **5** | Principal + 4 adicionales (etiquetas, defectos, detalles). |
| Expiración SAS | **7 días** | Balance entre seguridad y no regenerar constantemente. |
| Organización de blobs | `items/{itemId}/main.{ext}` | Predecible, sin colisiones, fácil de encontrar. |
| Container | `nexo-photos` (dev) / `nexo-photos-prod` (prod) | Separar entornos. |

## Patrones de diseño aplicados

```
                    PORT-ADAPTER (Hexagonal)
                    ═══════════════════════

  application/ports/
  ┌──────────────────────┐
  │   FileStoragePort    │  ← PORT (interfaz pura, sin dependencias externas)
  │                      │
  │ + upload(file, path) │
  │ + download(path)     │
  │ + delete(path)       │
  │ + getUrl(path)       │
  └──────────────────────┘
           ▲
           │ implements
    ┌──────┴──────┐
    │             │
┌───┴────────┐ ┌──┴───────────┐
│  Azure     │ │  Local       │  ← ADAPTERS
│  Blob      │ │  Storage     │
│  Storage   │ │  (fallback)  │
└────────────┘ └──────────────┘

         STRATEGY + FACTORY (via NestJS DI)

  MediaModule.forRoot()  ──→  lee STORAGE_PROVIDER env
                               ├─ "azure" → AzureBlobStorageAdapter
                               └─ "local" → LocalStorageAdapter
```

## Source Docs

| Doc | Path | Why |
|---|---|---|
| Modular monolith ADR | `docs/adr/ADR-2026-07-06-modular-monolith-ddd-cqrs-events.md` | Module boundaries, DI conventions |
| Prisma schema | `back/prisma/schema.prisma` | ItemPhoto model |
| Environment config | `back/.env` | Connection strings |

## Files To Create Or Modify

### A. Domain + Application (port)

| # | File | Action | Purpose |
|---|---|---|---|
| A1 | `back/src/modules/media/domain/file.ts` | create | `StoredFile` value object |
| A2 | `back/src/modules/media/application/tokens.ts` | create | `FILE_STORAGE` Symbol token |
| A3 | `back/src/modules/media/application/ports/file-storage.port.ts` | create | `FileStoragePort` interface + `UploadFile`, `StoredFile` types |

### B. Infrastructure (adapters)

| # | File | Action | Purpose |
|---|---|---|---|
| B1 | `back/src/modules/media/infrastructure/adapters/azure-blob-storage.adapter.ts` | create | Implementa `FileStoragePort` con `@azure/storage-blob` |
| B2 | `back/src/modules/media/infrastructure/adapters/local-storage.adapter.ts` | create | Implementa `FileStoragePort` con `fs` (dev fallback) |

### C. Interface (HTTP)

| # | File | Action | Purpose |
|---|---|---|---|
| C1 | `back/src/modules/media/interface/http/dto/upload-file.dto.ts` | create | DTO con validación: `@UploadedFile()` con ParseFilePipe |
| C2 | `back/src/modules/media/interface/http/media.controller.ts` | create | `POST /media/upload` — Admin-only multipart upload |
| C3 | `back/src/modules/media/interface/http/dto/upload-response.dto.ts` | create | Response con path + url + metadata |

### D. Module

| # | File | Action | Purpose |
|---|---|---|---|
| D1 | `back/src/modules/media/media.module.ts` | create | NestJS module con `forRoot()` factory |

### E. App + Config

| # | File | Action | Purpose |
|---|---|---|---|
| E1 | `back/src/app.module.ts` | modify | Importar `MediaModule.forRoot()` |
| E2 | `back/.env` | modify | Agregar vars Azure |
| E3 | `back/package.json` | modify | Agregar `@azure/storage-blob` y `@azure/identity` |

### F. ADR

| # | File | Action | Purpose |
|---|---|---|---|
| F1 | `docs/adr/ADR-2026-07-07-media-storage-azure.md` | create | Decisión de arquitectura |

## Implementation Steps

### Phase 1: Dependencies

```bash
cd back
pnpm add @azure/storage-blob @azure/identity
pnpm add --save-dev @types/multer
```

### Phase 2: Domain + Port

**A1 — `back/src/modules/media/domain/file.ts`**
```typescript
export interface StoredFile {
  path: string;       // "items/{itemId}/main.jpeg"
  url: string;        // URL completa o SAS
  mimeType: string;
  size: number;       // bytes
  uploadedAt: string; // ISO 8601
}
```

**A2 — `back/src/modules/media/application/tokens.ts`**
```typescript
export const FILE_STORAGE = Symbol("FILE_STORAGE");
```

**A3 — `back/src/modules/media/application/ports/file-storage.port.ts`**
```typescript
export interface UploadFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface FileStoragePort {
  upload(file: UploadFile, path: string): Promise<import("../../domain/file").StoredFile>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  getUrl(path: string): Promise<string>;
}
```

Design note: the domain file must NOT import NestJS, Azure, Multer, or any infrastructure dependency.

### Phase 3: Azure Blob Storage Adapter

**B1 — `back/src/modules/media/infrastructure/adapters/azure-blob-storage.adapter.ts`**

```typescript
import { BlobServiceClient, generateBlobSASQueryParameters, StorageSharedKeyCredential, BlobSASPermissions, SASProtocol } from "@azure/storage-blob";
import type { FileStoragePort, UploadFile } from "../../../application/ports/file-storage.port";
import type { StoredFile } from "../../../domain/file";

export class AzureBlobStorageAdapter implements FileStoragePort {
  private readonly client: BlobServiceClient;
  private readonly containerName: string;
  private readonly sasExpiryHours: number;

  constructor() {
    const connectionString = process.env["AZURE_STORAGE_CONNECTION_STRING"];
    if (!connectionString) {
      throw new Error("AZURE_STORAGE_CONNECTION_STRING no configurada");
    }
    this.client = BlobServiceClient.fromConnectionString(connectionString);
    this.containerName = process.env["AZURE_STORAGE_CONTAINER_NAME"] ?? "nexo-photos";
    this.sasExpiryHours = Number(process.env["AZURE_SAS_EXPIRY_HOURS"]) || 168; // 7 días
  }

  private container() {
    return this.client.getContainerClient(this.containerName);
  }

  async upload(file: UploadFile, path: string): Promise<StoredFile> {
    const blockBlobClient = this.container().getBlockBlobClient(path);
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimeType },
    });
    const url = await this.getUrl(path);
    return { path, url, mimeType: file.mimeType, size: file.size, uploadedAt: new Date().toISOString() };
  }

  async download(path: string): Promise<Buffer> {
    const blockBlobClient = this.container().getBlockBlobClient(path);
    return blockBlobClient.downloadToBuffer();
  }

  async delete(path: string): Promise<void> {
    const blockBlobClient = this.container().getBlockBlobClient(path);
    await blockBlobClient.deleteIfExists();
  }

  async getUrl(path: string): Promise<string> {
    const blockBlobClient = this.container().getBlockBlobClient(path);
    const exists = await blockBlobClient.exists();
    if (!exists) throw new Error(`Blob not found: ${path}`);

    const now = new Date();
    const expiresOn = new Date(now.getTime() + this.sasExpiryHours * 3600000);

    // Generar SAS token con las credenciales embebidas en connection string
    // (connection string contiene AccountName + AccountKey)
    const connectionString = process.env["AZURE_STORAGE_CONNECTION_STRING"] ?? "";
    const accountName = connectionString.match(/AccountName=([^;]+)/)?.[1] ?? "";
    const accountKey = connectionString.match(/AccountKey=([^;]+)/)?.[1] ?? "";
    const credential = new StorageSharedKeyCredential(accountName, accountKey);

    const sasToken = generateBlobSASQueryParameters({
      containerName: this.containerName,
      blobName: path,
      permissions: BlobSASPermissions.parse("r"), // solo lectura
      startsOn: now,
      expiresOn,
      protocol: SASProtocol.Https,
    }, credential).toString();

    return `${blockBlobClient.url}?${sasToken}`;
  }
}
```

### Phase 4: Local Storage Adapter (dev fallback)

**B2 — `back/src/modules/media/infrastructure/adapters/local-storage.adapter.ts`**

```typescript
import * as fs from "fs/promises";
import * as path from "path";
import type { FileStoragePort, UploadFile } from "../../../application/ports/file-storage.port";
import type { StoredFile } from "../../../domain/file";

export class LocalStorageAdapter implements FileStoragePort {
  private readonly basePath: string;

  constructor() {
    this.basePath = process.env["LOCAL_STORAGE_PATH"] ?? path.resolve(process.cwd(), "storage", "photos");
  }

  async upload(file: UploadFile, destPath: string): Promise<StoredFile> {
    const fullPath = path.join(this.basePath, destPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, file.buffer);
    return {
      path: destPath,
      url: `/storage/photos/${destPath}`,
      mimeType: file.mimeType,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
  }

  async download(destPath: string): Promise<Buffer> {
    return fs.readFile(path.join(this.basePath, destPath));
  }

  async delete(destPath: string): Promise<void> {
    await fs.unlink(path.join(this.basePath, destPath)).catch(() => {});
  }

  async getUrl(destPath: string): Promise<string> {
    return `/storage/photos/${destPath}`;
  }
}
```

### Phase 5: HTTP Controller

**C1 — `back/src/modules/media/interface/http/dto/upload-file.dto.ts`**

Validation approach: use NestJS `FileInterceptor` + custom `ParseFilePipe` validators.

```typescript
import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from "@nestjs/common";

// Constantes de validación
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_EXTENSIONS = /\.(jpeg|jpg|png|webp)$/i;
```

Option: Use NestJS's built-in `FileValidator`:

```typescript
import { FileValidator } from "@nestjs/common";

export class PhotoFileValidator extends FileValidator<{ maxSize: number }> {
  isValid(file: Express.Multer.File): boolean {
    const validMime = ALLOWED_MIME_TYPES.includes(file.mimetype);
    const validExt = ALLOWED_EXTENSIONS.test(file.originalname);
    const validSize = file.size <= this.validationOptions.maxSize;
    return validMime && validExt && validSize;
  }
  buildErrorMessage(file: Express.Multer.File): string {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype))
      return `Formato no permitido: ${file.mimetype}. Solo JPEG, PNG, WebP.`;
    if (file.size > this.validationOptions.maxSize)
      return `Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(1)} MB. Máximo 5 MB.`;
    return "Archivo inválido.";
  }
}
```

**C2 — `back/src/modules/media/interface/http/media.controller.ts`**

```typescript
import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Inject } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SessionAuthGuard } from "../../../identity/interface/http/guards/session-auth.guard";
import { PermissionGuard } from "../../../identity/interface/http/guards/permission.guard";
import { RequirePermissions } from "../../../identity/interface/http/decorators/require-permissions.decorator";
import { Permission } from "../../../identity/domain/permission";
import { FILE_STORAGE } from "../../application/tokens";
import type { FileStoragePort } from "../../application/ports/file-storage.port";
import { PhotoFileValidator, MAX_FILE_SIZE } from "./dto/upload-file.dto";
import * as path from "path";

@Controller("media")
@UseGuards(SessionAuthGuard)
export class MediaController {
  constructor(@Inject(FILE_STORAGE) private readonly storage: FileStoragePort) {}

  @Post("upload")
  @UseGuards(PermissionGuard)
  @RequirePermissions(Permission.AdminWorkspace)
  @UseInterceptors(FileInterceptor("file"))
  async upload(@UploadedFile(
    new PhotoFileValidator({ maxSize: MAX_FILE_SIZE })
  ) file: Express.Multer.File) {
    const ext = path.extname(file.originalname).toLowerCase();
    const destPath = `uploads/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;

    const result = await this.storage.upload({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    }, destPath);

    return {
      path: result.path,
      url: result.url,
      mimeType: result.mimeType,
      size: result.size,
    };
  }
}
```

**C3 — `back/src/modules/media/interface/http/dto/upload-response.dto.ts`**

```typescript
import { ApiProperty } from "@nestjs/swagger";

export class UploadResponseDto {
  @ApiProperty({ example: "uploads/1625000000_abc123.jpeg" })
  path: string;

  @ApiProperty({ example: "https://nexostorage.blob.core.windows.net/nexo-photos/uploads/1625000000_abc123.jpeg?sas=..." })
  url: string;

  @ApiProperty({ example: "image/jpeg" })
  mimeType: string;

  @ApiProperty({ example: 245000 })
  size: number;
}
```

### Phase 6: Module + DI Configuration

**D1 — `back/src/modules/media/media.module.ts`**

```typescript
import { Module, DynamicModule } from "@nestjs/common";
import { FILE_STORAGE } from "./application/tokens";
import { AzureBlobStorageAdapter } from "./infrastructure/adapters/azure-blob-storage.adapter";
import { LocalStorageAdapter } from "./infrastructure/adapters/local-storage.adapter";
import { MediaController } from "./interface/http/media.controller";
import { IdentityModule } from "../identity/identity.module";

@Module({})
export class MediaModule {
  static forRoot(): DynamicModule {
    const provider = process.env["STORAGE_PROVIDER"] === "local"
      ? new LocalStorageAdapter()
      : new AzureBlobStorageAdapter();

    return {
      module: MediaModule,
      imports: [IdentityModule],
      controllers: [MediaController],
      providers: [{ provide: FILE_STORAGE, useValue: provider }],
      exports: [FILE_STORAGE],
    };
  }
}
```

### Phase 7: Environment Configuration

**E2 — Variables a agregar en `.env`**

```bash
# Storage
STORAGE_PROVIDER=azure

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=YOUR_ACCOUNT_NAME;AccountKey=YOUR_ACCOUNT_KEY;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=nexo-photos
AZURE_SAS_EXPIRY_HOURS=168

# Local (fallback)
LOCAL_STORAGE_PATH=./storage/photos
```

⚠️ **NUNCA commitees las credenciales reales.** Usa placeholders. Las credenciales se configuran en el entorno de deployment.

### Phase 8: Register in AppModule

**E1 — `back/src/app.module.ts`**

Agregar `MediaModule.forRoot()` en el array `imports`.

### Phase 9: ADR

**F1 — `docs/adr/ADR-2026-07-07-media-storage-azure.md`**

Documentar la decisión de usar Azure Blob Storage con patrón Port-Adapter, SAS tokens, y estrategia de contenedores.

---

## Verification

### Unit
- `pnpm test:unit` — tests existentes pasan (18/18).

### Manual (con Azure)
```bash
# Subir una foto
curl -X POST http://localhost:3000/api/v1/media/upload \
  -H "Cookie: nexo_access_token=..." \
  -F "file=@/path/to/photo.jpeg"

# Debe devolver { path, url, mimeType, size }
# La url debe ser un SAS token válido por 7 días
```

### Manual (con local)
```bash
STORAGE_PROVIDER=local pnpm start:dev

# Subir foto → debe guardarse en ./storage/photos/uploads/
# URL debe ser /storage/photos/uploads/{filename}
```

### Edge cases a verificar
- Archivo > 5MB → 400 Bad Request
- Archivo .gif → 400 Bad Request
- Sin auth → 401
- Operator (no Admin) → 403
- Container no existe en Azure → error claro (no 500 genérico)

---

## Risks

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Azure connection string mal configurada | App no arranca | Validar en startup, error claro |
| Container no existe en Azure | Error en primer upload | Crear container en startup (si no existe) |
| SAS token genera URL muy larga | URLs ilegibles en frontend | Aceptable — el frontend nunca ve el path crudo |
| LocalStorage en producción | Fotos se pierden si no hay persistencia de volumen | Solo habilitar local con `STORAGE_PROVIDER=local` explícito |
| Fotos en fixture sin Azure | Import script necesita storage | El seed:inventory debe usar FileStoragePort, no Azure directo |

---

## Non-Goals (Explicit)

- No implementar thumbnail/resize (CDN/Azure Functions en el futuro).
- No CDN ni cache headers (v2).
- No gallery/browsing UI en frontend (handoff separado con nexo-design).
- No commit, push, o deploy sin confirmación del usuario.

## Acceptance Criteria

1. `POST /media/upload` acepta JPEG/PNG/WebP ≤ 5MB y retorna `{ path, url }`.
2. URL generada por Azure usa SAS token con expiración de 7 días.
3. `LocalStorageAdapter` funciona con `STORAGE_PROVIDER=local`.
4. `FileStoragePort` se puede inyectar en cualquier módulo vía `@Inject(FILE_STORAGE)`.
5. El `ItemService` (inventory) puede usar el storage para asociar fotos a items.
6. ADR documenta la decisión de arquitectura.

## Required Gates

- **QA review:** verificar upload con Azure + local.
- **Security review:** SAS tokens, permisos de container, connection string en env vars.
- **User confirmation:** requerido antes de commit, push, o deploy.

## Suggested Skills

- `tdd` — escribir test del adapter con Azure mockeado.
- `commit-work` — dividir en commits atómicos.
