# INV-2026-07-07 — Error 500 en Catálogos y Ausencia de Pruebas

## Metadata

- **Task ID:** NEXO-0008
- **Date:** 2026-07-07
- **Agent:** nexo-plan
- **Status:** completed

## Question Or Symptom

Durante la validación del módulo de catálogos (F2), se reportaron dos problemas:

1. **Error HTTP 500** al interactuar con los endpoints CRUD de catálogos (presumiblemente POST/PUT).
2. **No se encuentra la ejecución de pruebas** — no está claro cómo/dónde correr los tests ni qué pruebas existen para el módulo de catálogos.

## Context

El módulo `CatalogsModule` fue implementado en dos fases:

- **Tracer bullet** (HOFF-2026-07-07-catalogs-pagination-seed.md): seed de clothing-types, API paginada read-only, frontend básico.
- **Complete implementation** (HOFF-2026-07-07-catalogs-complete-implementation.md): CRUD completo para 9 entidades, factory de controladores genéricos, DTOs específicos para stores/colors.

El backend tiene:
- 9 controladores registrados en `CatalogsModule`
- `SimpleCatalogService` genérico para CRUD
- `ValidationPipe` global con `forbidNonWhitelisted: true`, `whitelist: true`, `transform: true`
- Sin `ExceptionFilter` para errores de Prisma

Las pruebas existentes:
- 2 unit tests (arquitectura + role-policy) ✅
- 1 e2e test de auth (9/9 fallan por mismatch de fixtures) ❌
- **CERO tests para catálogos**

## Evidence Gathered

### 1. Código fuente revisado

| Archivo | Hallazgo |
|---|---|
| `simple-catalog.service.ts` | `create/update` pasan `dto as unknown as Record<string, unknown>` directo a Prisma. Sin validación adicional ni manejo de errores. |
| `clothing-types.controller.ts` | Usa `SimpleCatalogService` para create/update/toggleActive/remove. El DTO `CreateClothingTypeDto` incluye `sectionId`, `nameEn`, `nameEs`, `displayOrder`, `active`. |
| `stores.controller.ts` | Usa `SimpleCatalogService` con DTO `CreateStoreDto` (name, address, city, state, defaultTaxRate, active). |
| `colors.controller.ts` | Usa `SimpleCatalogService` con DTO `CreateColorDto` (name, hex, active). |
| `simple-catalog-controllers.ts` | Factory para 7 entidades con `CreateSimpleCatalogDto` (name, displayOrder, active, metadata). |
| `catalogs.module.ts` | `SimpleCatalogService` registrado como provider. PrismaService inyectado vía constructor. |
| `app.module.ts` | `ValidationPipe` global registrado en `main.ts`. No hay `ExceptionFilter` global para Prisma. |

### 2. Prisma Schema

- `ClothingType` tiene unique constraint compuesto: `@@unique([sectionId, nameEn])`
- `Store`, `Brand`, `Category`, `Size`, `Condition`, `Color`, `PaymentMethod`, `ExpenseType`, `DifferenceReason` tienen `name @unique`
- `ClothingType.section` usa `@relation(fields: [sectionId], references: [id], onDelete: Restrict)`

### 3. Comandos de prueba

| Comando | Efecto |
|---|---|
| `cd back && pnpm test` | `vitest run` — ejecuta todos los `*.spec.ts` y `*.e2e-spec.ts` |
| `cd back && pnpm test:watch` | Modo watch |
| `cd back && pnpm build` | Compilación TypeScript (`tsc -p tsconfig.build.json`) |

### 4. Estado actual de compilación

- `back/`: compila limpio (solo errores de tipo pre-existentes en spec files)
- `front/`: compila y buildea (331KB JS). Frontend aún con CSS vanilla (NO migrado a shadcn/ui + Tailwind)

### 5. Verificación de API realizada (tracer bullet)

```bash
# GET paginado — funciona correctamente
curl http://localhost:3000/api/v1/catalogs/clothing-types?page=1&limit=3
# → 200 OK, 3 items, meta.total: 128, meta.totalPages: 43
```

## Findings

### Hallazgo 1: Causa Raíz del Error 500 — Falta de ExceptionFilter para Prisma

**El error 500 ocurre porque Prisma lanza `PrismaClientKnownRequestError` cuando hay violaciones de restricciones (unique, foreign key, etc.) y NestJS no tiene un filtro global que lo capture.**

Escenarios que producen 500:

| Escenario | Código Prisma | HTTP actual | HTTP deseado |
|---|---|---|---|
| Crear clothing-type con `nameEn` duplicado para misma `sectionId` | P2002 | **500** | 409 Conflict |
| Crear store con `name` duplicado | P2002 | **500** | 409 Conflict |
| Crear color con `name` o `hex` duplicado | P2002 | **500** | 409 Conflict |
| Crear clothing-type con `sectionId` inexistente | P2003 | **500** | 400 Bad Request |
| Actualizar registro inexistente | P2025 | **500** | 404 Not Found |
| BD caída / timeout de conexión | P1001/P1008 | **500** | 503 Service Unavailable |

**Evidencia directa:** No existe ningún archivo `*.filter.ts` o `*.exception-filter.ts` en `back/src/common/` ni en `back/src/modules/catalogs/`. El único filtro mencionado en el plan NEXO-0023 (security logging) aún no está implementado.

### Hallazgo 2: Ausencia Total de Tests para el Módulo de Catálogos

No existe ni un solo archivo de prueba para:
- `SimpleCatalogService` — lógica CRUD genérica
- `PrismaCatalogRepository` — consultas con ILIKE y paginación
- `paginate()` helper — lógica de paginación
- `ClothingTypesController` — validación de rutas y permisos
- `StoresController`, `ColorsController`, etc.
- Ningún DTO de catálogos

Esto significa que cualquier cambio en el módulo no tiene red de seguridad.

### Hallazgo 3: Frontend Incompleto

El handoff `HOFF-2026-07-07-catalogs-complete-implementation.md` especifica una migración completa a shadcn/ui + Tailwind con componentes genéricos y 9 páginas de catálogo. Actualmente:
- El frontend sigue con CSS vanilla
- Solo existe `ClothingTypesPage.tsx` para la visualización de clothing-types
- Las 8 entidades restantes no tienen interfaz de usuario
- Falta la infraestructura genérica de componentes (CatalogTabs, CatalogDataTable, CatalogFormDialog, etc)

### Hallazgo 4: Seeds de Entidades Restantes No Implementados

Solo existe seed para clothing-types (13 secciones, 128 tipos). Las 8 entidades restantes (stores, brands, categories, sizes, conditions, colors, payment methods, expense types, difference reasons) no tienen datos semilla.

## Ruled-Out Causes

| Causa descartada | Motivo |
|---|---|
| Error de compilación TypeScript | `pnpm build` compila limpio en back/ |
| Error de DI / provider no encontrado | `CatalogsModule` registra `SimpleCatalogService` y los controladores arrancan correctamente |
| Error de autenticación | Los guards `SessionAuthGuard` + `PermissionGuard` devuelven 401/403, no 500 |
| ValidationPipe mal configurado | Produce 400 Bad Request (no 500) por `forbidNonWhitelisted` |
| `sectionId` como campo de relación | En Prisma, `sectionId` es columna directa (no virtual), por lo que `prisma.clothingType.create({ data: { sectionId: "..." } })` funciona correctamente |

## Recommended Next Step

1. **Implementar `PrismaExceptionFilter`** global que capture `PrismaClientKnownRequestError` y devuelva HTTP status codes adecuados (P2002 → 409, P2025 → 404, P2003 → 400, P1001/P1008 → 503).
2. **Agregar tests para catálogos** — al menos unit tests para `SimpleCatalogService` y `paginate()`, y e2e para `ClothingTypesController`.
3. **Crear seeds** para las 8 entidades restantes.
4. **Completar frontend** con shadcn/ui + Tailwind y las 9 páginas de catálogo.

## Follow-Up Handoff

`HOFF-2026-07-07-catalogs-fix-500-and-tests.md` — implementar ExceptionFilter + tests + seeds pendientes.
