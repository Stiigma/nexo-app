# ADR-2026-07-07-media-storage-azure

## Status

Accepted.

## Context

Nexo v1 requires photo storage for inventory items. Photos must be private
(not publicly accessible) and served via signed URLs with time-limited
expiration. The system needs to support both cloud production and local
development environments without code changes.

## Decision

Use **Azure Blob Storage** as the primary storage backend with a **Port-Adapter
(Hexagonal)** pattern to keep the media module decoupled from any specific
storage implementation.

### Architecture

```
application/ports/FileStoragePort   ← PORT (pure interface)
         ▲
         │ implements
   ┌─────┴──────┐
   │            │
AzureBlob      LocalStorage         ← ADAPTERS
Storage        (dev fallback)
```

### Key choices

| Choice | Value | Rationale |
|---|---|---|
| Storage backend | Azure Blob Storage | Matches existing Azure infrastructure plan |
| Access control | SAS tokens, 7-day expiry | Private storage; no public access; time-limited URLs |
| Container naming | `nexo-photos` (dev) / `nexo-photos-prod` (prod) | Environment separation |
| Blob organization | `uploads/{timestamp}_{random}.{ext}` | Predictable, collision-free paths |
| Dev fallback | Local filesystem (`LocalStorageAdapter`) | Enables offline/local development without Azure credentials |
| DI token | `FILE_STORAGE` (Symbol-based) | Decouples consumers from concrete adapter |
| Module strategy | `MediaModule.forRoot()` DynamicModule | Factory selects adapter based on `STORAGE_PROVIDER` env var |
| File validation | 5 MB max, JPEG/PNG/WebP only | Sufficient for high-quality photos; WebP for bandwidth efficiency |
| Auth | SessionAuthGuard + PermissionGuard (AdminWorkspace) | Only admin users can upload photos |

## Consequences

- **Positive:** The port-adapter pattern allows swapping Azure for any
  S3-compatible storage (AWS S3, MinIO, Cloudflare R2) by implementing a new
  adapter without touching domain or application code.
- **Positive:** Symbol-based DI means any module can inject `FILE_STORAGE`
  without importing the media module implementation.
- **Positive:** `LocalStorageAdapter` enables full offline development with
  `STORAGE_PROVIDER=local`.
- **Risk:** SAS token URLs can be long (acceptable; frontend never sees raw paths).
- **Risk:** Container must exist in Azure before first upload (mitigation:
  container creation on startup in future iteration).
- **Risk:** Connection string is sensitive; must never be committed to source
  control. Managed via environment variables.
