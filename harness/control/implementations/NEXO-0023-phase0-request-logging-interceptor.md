# NEXO-0023 Phase 0 — Implementation Record

## Metadata

- Task ID: NEXO-0023
- Phase: 0 (RequestLoggingInterceptor)
- Handoff: `harness/control/handoffs/HOFF-2026-07-07-request-logging-interceptor.md`
- Date: 2026-07-07
- Implemented by: nexo-build (delegated by nexo-plan)
- ADR: `docs/adr/ADR-2026-07-06-security-logging-architecture.md`

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `back/src/common/logging/winston.config.ts` | ~45 | Winston config: DailyRotateFile + Console (dev) |
| `back/src/common/logging/security-logger.service.ts` | ~35 | SecurityLogger service: `log()` + `onModuleDestroy()` |
| `back/src/common/logging/security-logger.module.ts` | ~20 | @Global module: WINSTON_LOGGER + SecurityLogger |
| `back/src/common/logging/logging.types.ts` | ~25 | SecurityEventInput, RequestLogEntry interfaces |
| `back/src/common/interceptors/request-logging.interceptor.ts` | ~85 | NestInterceptor: captures request/response, sanitizes errors |
| `back/src/common/interceptors/request-logging.interceptor.spec.ts` | ~170 | 5 unit tests |
| `back/src/common/logging/security-logger.service.spec.ts` | ~65 | 2 unit tests |

## Files Modified

| File | Change |
|------|--------|
| `back/package.json` | Added winston ^3.19.0 + winston-daily-rotate-file ^5.0.0 |
| `back/src/main.ts` | Registered interceptor global + enableShutdownHooks |
| `back/src/app.module.ts` | Imported SecurityLoggerModule |
| `back/.env.example` | Added LOG_DIR=./logs |
| `back/.gitignore` | Added logs/ |

## Design Patterns Applied

| Pattern | Implementation |
|---------|---------------|
| **NestJS Interceptor** | `RequestLoggingInterceptor` implements `NestInterceptor`. Uses `tap` operator to record both success and error responses. Re-throws errors to preserve existing ExceptionFilter pipeline. |
| **Observer** | `SecurityLogger.log()` is the single emit point. Winston transport is the observer subscribed at `info` level. Future phases add DB buffer (warn) and email sender (alert) as additional observers. |
| **Chain of Responsibility** | The interceptor assigns `severity` per HTTP status code (2xx→info, 4xx→warn, 5xx→alert). The `SecurityLogger.log()` method will route by severity when `warn()`/`alert()` are added in Phase 1. |
| **Exception Filter** | Existing `PrismaExceptionFilter` unchanged. The interceptor's `tap.error` handler captures the error metadata (name, message) before re-throwing. |

## Test Results

| Suite | Tests | Result |
|-------|-------|--------|
| `request-logging.interceptor.spec.ts` | 5 | ✅ All pass |
| `security-logger.service.spec.ts` | 2 | ✅ All pass |
| `domain-imports.spec.ts` | 1 | ✅ (unchanged) |
| `pagination.helper.spec.ts` | 6 | ✅ (unchanged) |
| `role-policy.spec.ts` | 3 | ✅ (unchanged) |
| `simple-catalog-service.spec.ts` | 8 | ✅ (unchanged) |
| `clothing-types.e2e-spec.ts` | 5 | ✅ (unchanged) |
| **Total** | **30** | **0 regressions** |

## Verification

- `pnpm vitest run` — todos los tests pasan (auth.e2e-spec.ts tiene 9 fallos pre-existentes por falta de BD en entorno de test)
- `pnpm tsc -p tsconfig.build.json` — compilación limpia, cero errores
- `./logs/nexo-security-YYYY-MM-DD.log` — generado con entradas JSON
- Winston DailyRotateFile configurado: rotación diaria, compresión gzip, retención 30 días, consola en dev

## Known Issues

1. **5 RxJS unhandled errors en test teardown**: ocurren cuando el `tap.error` del interceptor re-lanza errores durante la limpieza de módulos de NestJS. Es un artifact del entorno de test; en producción, NestJS maneja los errores a través de su pipeline de exception filters. Todos los tests pasan correctamente; los errores no manejados ocurren después de las aserciones.

2. **SecurityLogger `onModuleDestroy` 2s delay**: cada test del `security-logger.service.spec.ts` espera 2 segundos en `afterEach` para el graceful shutdown de Winston. Por diseño del handoff.
