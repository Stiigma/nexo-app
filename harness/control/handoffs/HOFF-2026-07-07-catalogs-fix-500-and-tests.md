# HOFF-2026-07-07 — Catalogs: Fix Error 500 + Add Tests + Seeds

## Metadata

- **Task ID:** NEXO-0008
- **Date:** 2026-07-07
- **Authoring agent:** nexo-plan
- **Receiving agent:** nexo-build
- **Status:** ready
- **Predecessors:** `HOFF-2026-07-07-catalogs-pagination-seed.md` (tracer bullet),
  `HOFF-2026-07-07-catalogs-complete-implementation.md` (full CRUD — parcialmente implementado)

## Objective

Resolver los problemas de calidad encontrados durante la validación del módulo
de catálogos:

1. **Error 500** en endpoints CRUD por falta de `ExceptionFilter` para Prisma.
2. **Cero tests** para el módulo de catálogos.
3. **Seeds faltantes** para 8 entidades de catálogo.
4. **Tests e2e de auth rotos** (pre-existente, pero bloquea validación).

Este handoff NO cubre la migración frontend a shadcn/ui + Tailwind (queda para
un handoff posterior).

## Context

### Diagnóstico completo

El investigation `INV-2026-07-07-catalogs-500-error.md` documenta las causas raíz:

- `PrismaClientKnownRequestError` no tiene ExceptionFilter → cualquier unique
  constraint violation (P2002), foreign key error (P2003), o registro no
  encontrado (P2025) produce HTTP 500.
- No existe ningún archivo de test para catálogos en `back/src/modules/catalogs/`.
- Las 8 entidades simples (Store, Brand, Category, Size, Condition, Color,
  PaymentMethod, ExpenseType, DifferenceReason) ya tienen modelos Prisma y
  controladores CRUD, pero **no tienen datos semilla**.
- Los tests e2e de auth (`auth.e2e-spec.ts`) esperan `admin@nexo.test` /
  `operator@nexo.test`, pero la BD seedada tiene `nexoense@gmail.com` /
  `eduardo.castro220302@gmail.com`.

### Estado actual del backend

```text
back/src/
├── common/
│   └── pagination/          ✅ (3 archivos: helper, DTO query, DTO response)
├── modules/
│   └── catalogs/
│       ├── catalogs.module.ts              ✅ (9 controladores registrados)
│       ├── domain/                         ✅ (4 entidades)
│       ├── application/
│       │   ├── tokens.ts                   ✅
│       │   ├── ports/catalog-repository.ts ✅
│       │   └── simple-catalog.service.ts   ✅ (CRUD genérico)
│       ├── infrastructure/repositories/
│       │   └── prisma-catalog.repository.ts ✅
│       └── interface/http/
│           ├── clothing-types.controller.ts   ✅ (CRUD completo)
│           ├── controllers/
│           │   ├── stores.controller.ts       ✅ (CRUD completo)
│           │   ├── colors.controller.ts       ✅ (CRUD completo)
│           │   └── simple-catalog-controllers.ts ✅ (factory para 7 entidades)
│           └── dto/                          ✅ (12 DTOs)
└── ...identity/...
    └── interface/http/
        └── auth.e2e-spec.ts  ❌ (9/9 fallan — fixtures desactualizados)
```

## Source Docs

| Doc | Path | Why |
|---|---|---|
| Investigation | `harness/control/investigations/INV-2026-07-07-catalogs-500-error.md` | Root cause analysis |
| F2 plan | `harness/control/plans/NEXO-0008-operational-catalogs.md` | Updated steps 12-19 |
| Prisma errors | `https://www.prisma.io/docs/orm/reference/error-reference` | Error codes P2002, P2003, P2025 |
| Existing e2e test | `back/src/modules/identity/interface/http/auth.e2e-spec.ts` | Reference pattern for e2e |
| Seed reference | `back/prisma/seed-catalogs.ts` | Pattern for idempotent seed |
| Catalogs module | `back/src/modules/catalogs/catalogs.module.ts` | Registration point |

## Files To Create Or Modify

### A. PrismaExceptionFilter (nuevo)

| # | File | Action | Purpose |
|---|---|---|---|
| A1 | `back/src/common/filters/prisma-exception.filter.ts` | **create** | Captura `PrismaClientKnownRequestError` y traduce a HTTP codes |
| A2 | `back/src/main.ts` | modify | Registrar `PrismaExceptionFilter` como filter global (o via `app.useGlobalFilters`) |

### B. Tests para catálogos (nuevos)

| # | File | Action | Purpose |
|---|---|---|---|
| B1 | `back/src/modules/catalogs/application/__tests__/simple-catalog-service.spec.ts` | create | Unit tests para `SimpleCatalogService.create`, `.update`, `.toggleActive`, `.remove`, `.findAll` (mock PrismaService) |
| B2 | `back/src/common/pagination/__tests__/pagination.helper.spec.ts` | create | Unit tests para `paginate()` (mock delegate) |
| B3 | `back/src/modules/catalogs/interface/http/__tests__/clothing-types.e2e-spec.ts` | create | E2E tests: GET paginado, POST (admin permite, operator deniega), PUT, PATCH toggle, DELETE soft |

Opcional: agregar `"test:unit": "vitest run --exclude '**/*.e2e*'"` y `"test:e2e": "vitest run '**/*.e2e*'"` en `back/package.json` para separar unit de e2e.

### C. Seeds para 8 entidades restantes

| # | File | Action | Purpose |
|---|---|---|---|
| C1 | `back/prisma/seed-catalogs.ts` | modify | Agregar seed para stores, brands, categories, sizes, conditions, colors, payment-methods, expense-types, difference-reasons |

### D. Arreglar tests e2e de auth (opcional pero recomendado)

| # | File | Action | Purpose |
|---|---|---|---|
| D1 | `back/src/modules/identity/interface/http/auth.e2e-spec.ts` | modify | Actualizar emails/passwords para coincidir con los usuarios reales en la BD local, O modificar `back/prisma/seed.ts` para crear los usuarios de test al seedear |

## Implementation Steps

### Phase 1: PrismaExceptionFilter

1. Create `back/src/common/filters/prisma-exception.filter.ts`:
   ```typescript
   import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from "@nestjs/common";
   import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
   import { Response } from "express";

   @Catch(PrismaClientKnownRequestError)
   export class PrismaExceptionFilter implements ExceptionFilter {
     catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
       const ctx = host.switchToHttp();
       const response = ctx.getResponse<Response>();

       let status = HttpStatus.INTERNAL_SERVER_ERROR;
       let message = "Database error";

       switch (exception.code) {
         case "P2002": // Unique constraint violation
           status = HttpStatus.CONFLICT;
           message = `Unique constraint violation: ${(exception.meta?.target as string[])?.join(", ")}`;
           break;
         case "P2025": // Record not found
           status = HttpStatus.NOT_FOUND;
           message = "Record not found";
           break;
         case "P2003": // Foreign key constraint failed
           status = HttpStatus.BAD_REQUEST;
           message = "Foreign key constraint failed";
           break;
         case "P1001": // Can't reach database
         case "P1008": // Connection timed out
           status = HttpStatus.SERVICE_UNAVAILABLE;
           message = "Database connection failed";
           break;
       }

       response.status(status).json({
         statusCode: status,
         message,
         error: HttpStatus[status],
         code: exception.code,
         timestamp: new Date().toISOString(),
       });
     }
   }
   ```

2. Register in `back/src/main.ts`:
   ```typescript
   import { PrismaExceptionFilter } from "./common/filters/prisma-exception.filter";
   // after app.setGlobalPrefix, before await app.listen:
   app.useGlobalFilters(new PrismaExceptionFilter());
   ```

3. Verify: `pnpm tsc -b` passes.

### Phase 2: Unit tests for SimpleCatalogService

4. Create `back/src/modules/catalogs/application/__tests__/simple-catalog-service.spec.ts`:
   - Mock `PrismaService` con delegates falsos
   - Test `create()`: verifica que llama a `prisma[delegateKey].create` con los datos correctos
   - Test `update()`: verifica update con where + data
   - Test `toggleActive()`: verifica que setea active al valor dado
   - Test `remove()`: verifica que setea active=false (soft delete)
   - Test `findAll()`: verifica paginate + where + orderBy
   - Test `findAll()` con search: verifica OR con ILIKE mode

5. Create `back/src/common/pagination/__tests__/pagination.helper.spec.ts`:
   - Test paginate con delegate mock
   - Test page/limit coercion (string → number)
   - Test hard limit (max 100)
   - Test hasNext/hasPrevious flags

6. Run: `pnpm test` — debe pasar 4 unit tests existentes + nuevos.

### Phase 3: E2E tests for catalogs

7. Create `back/src/modules/catalogs/interface/http/__tests__/clothing-types.e2e-spec.ts`:
   - Usar `@nestjs/testing` + `supertest` (mismo patrón que `auth.e2e-spec.ts`)
   - Configurar variables de entorno para test (JWT_SECRET, etc.)
   - **NO usar BD real** — idealmente mockear Prisma o usar BD de test separada
   - Tests a incluir:
     - `GET /catalogs/clothing-types` sin auth → 401
     - `GET /catalogs/clothing-types` como Admin → 200 + paginated response
     - `POST /catalogs/clothing-types` como Operator → 403
     - `POST /catalogs/clothing-types` como Admin → 201 (crear)
     - `POST /catalogs/clothing-types` con nameEn duplicado → 409 (después del filter)
     - `PUT /catalogs/clothing-types/:id` como Admin → 200
     - `PATCH /catalogs/clothing-types/:id/active` como Admin → 200
     - `DELETE /catalogs/clothing-types/:id` como Admin → 200 (soft delete)

8. (Opcional) Agregar scripts separados en `package.json`:
   ```json
   "test:unit": "vitest run --exclude '**/*.e2e*'",
   "test:e2e": "vitest run '**/*.e2e*'"
   ```

### Phase 4: Seeds faltantes

9. Extender `back/prisma/seed-catalogs.ts`:

   ```typescript
   // ── Stores ──────────────────────────────────────
   const stores = [
     { name: "Walmart", address: "Blvd. Independencia", city: "Mexicali", state: "BC" },
     { name: "Target", address: "123 Main St", city: "San Diego", state: "CA" },
     // ... más
   ];
   for (const s of stores) {
     await prisma.store.upsert({
       where: { name: s.name },
       update: {},
       create: { ...s, defaultTaxRate: 0.0875, displayOrder: stores.indexOf(s) },
     });
   }

   // ── Brands ───────────────────────────────────────
   const brands = ["Nike", "Levi's", "Gap", "H&M", "Zara", "Adidas", "Puma", "American Eagle"];
   for (const name of brands) { /* upsert by name */ }

   // ── Categories ───────────────────────────────────
   const categories = ["Camisa", "Pantalón", "Vestido", "Chamarra", "Sudadera",
     "Falda", "Short", "Blusa", "Abrigo", "Conjunto", "Traje de Baño", "Ropa Interior",
     "Accesorios", "Calzado", "Suéter"];
   for (const name of categories) { /* upsert by name */ }

   // ── Sizes ────────────────────────────────────────
   const sizes = ["XS", "S", "M", "L", "XL", "XXL", "26", "27", "28", "29", "30",
     "31", "32", "33", "34", "35", "36", "37", "38", "39", "40"];
   for (const name of sizes) { /* upsert by name */ }

   // ── Conditions ───────────────────────────────────
   const conditions = ["Nuevo con etiqueta", "Nuevo sin etiqueta", "Como nuevo",
     "Usado - Bueno", "Usado - Regular", "Con defecto"];
   for (const name of conditions) { /* upsert by name */ }

   // ── Colors ───────────────────────────────────────
   const colors = [
     { name: "Negro", hex: "#000000" },
     { name: "Blanco", hex: "#FFFFFF" },
     { name: "Gris", hex: "#808080" },
     { name: "Azul", hex: "#0000FF" },
     { name: "Rojo", hex: "#FF0000" },
     { name: "Verde", hex: "#00AA00" },
     { name: "Rosa", hex: "#FF69B4" },
     { name: "Café", hex: "#8B4513" },
     { name: "Amarillo", hex: "#FFD700" },
     { name: "Naranja", hex: "#FFA500" },
     { name: "Morado", hex: "#800080" },
     { name: "Beige", hex: "#F5F5DC" },
   ];
   for (const c of colors) { /* upsert by name */ }

   // ── Payment Methods ──────────────────────────────
   const paymentMethods = ["Efectivo", "Tarjeta de crédito", "Tarjeta de débito",
     "Transferencia", "PayPal", "Depósito"];
   for (const name of paymentMethods) { /* upsert by name */ }

   // ── Expense Types ────────────────────────────────
   const expenseTypes = ["Gasolina", "Caseta", "Comida", "Hospedaje", "Mantenimiento",
     "Papelería", "Servicios", "Renta", "Otro"];
   for (const name of expenseTypes) { /* upsert by name */ }

   // ── Difference Reasons ───────────────────────────
   const diffReasons = ["Daño", "Precio incorrecto", "Talla incorrecta",
     "Color incorrecto", "Artículo equivocado", "Cliente canceló", "Otro"];
   for (const name of diffReasons) { /* upsert by name */ }
   ```

10. Ejecutar y verificar:
    ```bash
    cd back && pnpm db:seed:catalogs
    ```
    Debe mostrar los counts de cada entidad.

### Phase 5: Arreglar tests e2e de auth (opcional)

11. Decidir estrategia:
    - **Opción A**: Modificar `auth.e2e-spec.ts` para usar los emails reales
      (`nexoense@gmail.com` / `eduardo.castro220302@gmail.com`) y las passwords
      reales (las del seed).
    - **Opción B**: Modificar `back/prisma/seed.ts` para que SIEMPRE cree
      `admin@nexo.test` y `operator@nexo.test` además de los usuarios reales.
      Así los tests funcionan con cualquier BD seedada.
    - **Recomendación**: Opción B — separa datos de test de datos reales.

## Verification

### Phase 1 (ExceptionFilter)
- `pnpm tsc -b` compila limpio.
- Simular P2002: POST a `/catalogs/clothing-types` con mismo `sectionId`+`nameEn`
  dos veces → 409 Conflict (antes daba 500).
- Simular P2025: PUT a `/catalogs/clothing-types/no-existe` → 404.
- Simular P2003: POST a `/catalogs/clothing-types` con `sectionId` inexistente
  (UUID válido pero no en BD) → 400.

### Phase 2 (Unit tests)
- `pnpm test` pasa: 4 tests existentes + 2 nuevos spec files.
- Coverage mínimo: `SimpleCatalogService` (5 tests), `paginate()` (4 tests).

### Phase 3 (E2E tests)
- `pnpm test` pasa incluyendo los nuevos e2e de clothing-types.
- **Nota:** Si no se puede configurar BD de test, los e2e pueden fallar. En ese
  caso, posponer e2e y dejar solo unit tests en este handoff.

### Phase 4 (Seeds)
- `pnpm db:seed:catalogs` ejecuta sin error.
- Consultar cada entidad GET paginada → devuelve datos con los nombres seedeados.

### Phase 5 (Auth e2e fix)
- Opción B: `pnpm test` → auth e2e 9/9 pasan.

## Risks

| Riesgo | Impacto | Mitigación |
|---|---|---|
| E2E tests de catálogos requieren BD real | No se pueden ejecutar en CI sin BD | Usar BD de test separada o mock Prisma. Si es muy complejo, posponer e2e y solo hacer unit tests ahora. |
| Opción B (auth e2e) puede causar duplicación de usuarios en seed | Usuarios fantasma en BD | Asegurar que los usuarios de test tienen email único y no interfieren con datos reales. |
| Seed de 8 entidades puede ser tedioso | Tiempo de implementación | Usar arreglos con nombres sensibles. No sobrepensar — valores por defecto aceptables para v1. |
| El ExceptionFilter genérico puede ocultar errores reales | Depuración difícil | Incluir `exception.stack` en logs (no en response). Usar logger. |

## Acceptance Criteria

1. `PrismaExceptionFilter` traduce P2002 → 409, P2025 → 404, P2003 → 400,
   P1001/P1008 → 503.
2. `SimpleCatalogService` tiene cobertura de tests unitarios (create, update,
   toggleActive, remove, findAll).
3. `paginate()` tiene tests unitarios (coerción, hard limit, meta flags).
4. Las 8 entidades de catálogo tienen datos semilla al ejecutar
   `pnpm db:seed:catalogs`.
5. (Opcional) Tests e2e de auth pasan después de arreglar fixtures.

## Non-Goals (Explicit)

- **No migrar frontend** a shadcn/ui + Tailwind (handoff separado).
- **No implementar frontend** para las 8 entidades restantes.
- **No implementar** CSV/JSON export, inventory filtering, catalog-driven reports.
- **No commit, push, o deploy** sin confirmación explícita del usuario.

## Required Gates

- **QA review:** requerido antes del closeout de NEXO-0008.
- **Security review:** no aplica (solo manejo de errores + tests).
- **User confirmation:** requerido antes de commit, push, o deploy.

## Suggested Skills

- `tdd` — para escribir los tests primero (red-green-refactor).
- `commit-work` — para dividir los cambios en commits atómicos.
- `diagnosing-bugs` — si el ExceptionFilter revela errores adicionales.
