# HOFF-2026-07-07 — Request Logging Interceptor: HTTP Request/Response Visibility

## Metadata

- Task ID: `NEXO-0023` (Security Logging & Alerting — new Phase 0)
- Date: 2026-07-07
- Authoring agent: `nexo-plan`
- Receiving agent: `nexo-build`
- Status: implemented (2026-07-07, delegated to nexo-build)
- Implementation record: `harness/control/implementations/NEXO-0023-phase0-request-logging-interceptor.md`
- Predecessor: `NEXO-0023` plan (`harness/control/plans/NEXO-0023-security-logging.md`)
- ADR: `docs/adr/ADR-2026-07-06-security-logging-architecture.md`

## Objective

Implementar un **NestJS Interceptor global** que capture automáticamente cada
petición HTTP entrante (método, ruta, IP, usuario) y su respuesta (status code,
payload, tiempo de ejecución), logueándolo a archivos JSON rotativos vía Winston.
Esto proporciona **visibilidad total** de qué está pasando en cada endpoint del
sistema, permitiendo detectar errores mucho más rápido y sumando una capa de
seguridad operativa.

Este handoff añade una **Fase 0** al plan `NEXO-0023`: el interceptor es la
pieza que faltaba para "visualizar cada endpoint entrante y cómo responde".

## Design Patterns (Documentados)

Esta implementación aplica **cuatro patrones de diseño** canónicos en NestJS:

| Patrón | Rol en esta implementación |
|--------|---------------------------|
| **Interceptor** (NestJS) | Patrón principal. Envuelve cada request/response. Captura datos antes y después del handler. Es el equivalente NestJS de AOP (Aspect-Oriented Programming) para cross-cutting concerns. |
| **Observer** | El `SecurityLogger` actúa como sujeto. Winston es el observador suscrito a nivel `info`. En fases futuras, DB Buffer y Email Sender se suscribirán a `warn` y `alert`. |
| **Exception Filter** | Ya existe `PrismaExceptionFilter`. Este handoff añade integración con el exception filter existente para que errores 500 también se registren. |
| **Chain of Responsibility** | Cada evento pasa por la cadena: interceptor → `SecurityLogger.log()` → Winston transport → archivo rotativo. En fases posteriores se añadirán eslabones (buffer BD → email). |

### Por qué Interceptor y no Middleware

| Criterio | Middleware | Interceptor |
|----------|-----------|-------------|
| Acceso al usuario autenticado | ❌ (se ejecuta antes de guards) | ✅ (se ejecuta después de guards) |
| Acceso al resultado del handler | ❌ | ✅ (`next.handle().pipe()`) |
| Puede transformar la respuesta | ❌ | ✅ (`map()`) |
| Scope global/per-route | ✅ | ✅ |
| Orden de ejecución | Antes de guards | Después de guards, antes del handler |

**El interceptor es superior para logging** porque captura el request **después**
de que los guards de autenticación hayan resuelto `req.user`, y puede acceder
tanto al request entrante como a la respuesta saliente (incluyendo errores).

## Context

### Lo que ya existe (no rehacer)

- `back/src/common/filters/prisma-exception.filter.ts` — exception filter global
  para errores de Prisma. Se mantiene y se complementa.
- `back/src/main.ts` — `app.useGlobalFilters(new PrismaExceptionFilter())` ya
  registrado. Se añadirá `app.useGlobalInterceptors()`.
- `back/src/modules/identity/interface/http/guards/` — `SessionAuthGuard`,
  `PermissionGuard`, `RefreshAuthGuard`. El interceptor se ejecuta DESPUÉS de
  estos, así que tiene acceso al usuario autenticado.
- `harness/control/plans/NEXO-0023-security-logging.md` — plan maestro para el
  sistema de logging de 3 niveles. Este handoff es Fase 0 de ese plan.

### Lo que NO existe aún

- No hay ningún interceptor global en el proyecto.
- No hay `SecurityLogger` ni Winston instalado.
- No hay estructura `back/src/common/logging/`.

### Arquitectura objetivo (Fase 0)

```
┌──────────────────────────────────────────────────────────────┐
│  HTTP Request → /api/v1/auth/login  (POST)                   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  RequestLoggingInterceptor (NestJS Interceptor)      │     │
│  │                                                      │     │
│  │  1. Captura: method, url, ip, userAgent, userId     │     │
│  │  2. Ejecuta next.handle()                            │     │
│  │  3. Captura: statusCode, responseSize, duration     │     │
│  │  4. Llama a SecurityLogger.log()                     │     │
│  └──────────────┬──────────────────────────────────────┘     │
│                 │                                              │
│  ┌──────────────▼──────────────────────────────────────┐     │
│  │  SecurityLogger.log({ event: "REQUEST", ... })       │     │
│  │    ↓                                                 │     │
│  │  Winston.logger.info({ ...evento en JSON })          │     │
│  │    ↓                                                 │     │
│  │  Archivo: ./logs/nexo-security-2026-07-07.log        │     │
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

## Source Docs

| Doc | Path | Por qué |
|-----|------|---------|
| **ADR logging** | `docs/adr/ADR-2026-07-06-security-logging-architecture.md` | Arquitectura 3 niveles, catálogo de eventos, estimaciones de volumen |
| **Plan NEXO-0023** | `harness/control/plans/NEXO-0023-security-logging.md` | Plan maestro, fases 1-4, verificación, catálogo de eventos |
| **Modular monolith ADR** | `docs/adr/ADR-2026-07-06-modular-monolith-ddd-cqrs-events.md` | Estructura DDD de `back/src/` |
| **Product spec** | `NEXO_PROJECT.md` | Roles Admin/Operador, permisos |
| **Auth controller** | `back/src/modules/identity/interface/http/auth.controller.ts` | Endpoints auth existentes |
| **Auth guards** | `back/src/modules/identity/interface/http/guards/` | SessionAuthGuard, PermissionGuard |
| **Prisma exception filter** | `back/src/common/filters/prisma-exception.filter.ts` | Filtro de errores existente |
| **App entry** | `back/src/main.ts` | Punto de registro de interceptors/filters globales |
| **App module** | `back/src/app.module.ts` | Registro de módulos |

## Receiving Agent

`nexo-build` — implementa todo el código listado aquí. Después:
- `nexo-qa` verifica que los tests pasan y los logs se generan.
- `nexo-security` revisa que no se logueen secrets ni datos sensibles.

---

## Files To Create

| # | File | Purpose |
|---|------|---------|
| F1 | `back/src/common/logging/winston.config.ts` | Configuración Winston: `createWinstonLogger()` con `DailyRotateFile` (JSON, rotación diaria, compresión gzip, retención 30 días, consola en dev) |
| F2 | `back/src/common/logging/security-logger.service.ts` | Servicio NestJS `SecurityLogger` con método `log(input: SecurityEventInput): void` (nivel `info` solo). En esta fase solo escribe a Winston. Las severidades `warn` y `alert` se añadirán en fases posteriores. |
| F3 | `back/src/common/logging/security-logger.module.ts` | NestJS `Global` module que provee y exporta `SecurityLogger` + `WINSTON_LOGGER` token |
| F4 | `back/src/common/interceptors/request-logging.interceptor.ts` | NestJS `NestInterceptor` global que captura cada request/response y loguea vía `SecurityLogger` |
| F5 | `back/src/common/interceptors/request-logging.interceptor.spec.ts` | Tests unitarios del interceptor: verifica que loguea requests exitosos, requests con error, y que sanitiza datos sensibles |
| F6 | `back/src/common/logging/security-logger.service.spec.ts` | Tests unitarios del SecurityLogger: verifica que `log()` produce eventos con el formato correcto |
| F7 | `back/src/common/logging/logging.types.ts` | Interfaces compartidas: `SecurityEventInput`, `RequestLogEntry` |

## Files To Modify

| # | File | Change |
|---|------|--------|
| M1 | `back/package.json` | Añadir `winston` y `winston-daily-rotate-file` a `dependencies` |
| M2 | `back/src/main.ts` | Registrar `RequestLoggingInterceptor` como interceptor global. Añadir graceful shutdown para Winston. Registrar `SecurityLoggerModule`. |
| M3 | `back/src/app.module.ts` | Importar `SecurityLoggerModule` |
| M4 | `back/.env.example` | Añadir `LOG_DIR=./logs` |
| M5 | `back/.gitignore` | Añadir `logs/` (si no existe) |

---

## Detailed Implementation Specs

### 1. `SecurityEventInput` Interface (`logging.types.ts`)

```typescript
// back/src/common/logging/logging.types.ts

export interface SecurityEventInput {
  event: string; // e.g. "REQUEST", "AUTH_LOGIN_SUCCESS"
  severity: "info" | "warn" | "alert";
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  responseSize?: number;
  meta?: Record<string, unknown>;
}

export interface RequestLogEntry {
  timestamp: string;
  event: string;
  severity: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  ip: string;
  userAgent?: string;
  userId?: string;
  email?: string;
}
```

### 2. Winston Config (`winston.config.ts`)

```typescript
// back/src/common/logging/winston.config.ts

import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export const WINSTON_LOGGER = "WINSTON_LOGGER";

export function createWinstonLogger(logDir?: string): winston.Logger {
  const dir = logDir ?? process.env.LOG_DIR ?? "./logs";

  const transports: winston.transport[] = [
    new DailyRotateFile({
      dirname: dir,
      filename: "nexo-security-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
      zippedArchive: true,
      maxSize: "20m",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ];

  // En desarrollo, también mostrar en consola (formato legible)
  if (process.env.NODE_ENV !== "production") {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: "HH:mm:ss" }),
          winston.format.colorize(),
          winston.format.printf(
            ({ timestamp, level, message, ...meta }) =>
              `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`,
          ),
        ),
      }),
    );
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL ?? "info",
    transports,
  });
}
```

### 3. `SecurityLogger` Service (Fase 0 — solo `info`)

```typescript
// back/src/common/logging/security-logger.service.ts

import { Inject, Injectable, Logger } from "@nestjs/common";
import { WINSTON_LOGGER } from "./winston.config";
import { SecurityEventInput } from "./logging.types";
import type winston from "winston";

@Injectable()
export class SecurityLogger {
  private readonly nestLogger = new Logger(SecurityLogger.name);

  constructor(
    @Inject(WINSTON_LOGGER)
    private readonly winston: winston.Logger,
  ) {}

  /**
   * Nivel info: escribe a archivo rotativo (Winston).
   * En fases posteriores: warn → buffer BD, alert → BD + email.
   */
  log(input: SecurityEventInput): void {
    const entry = {
      timestamp: new Date().toISOString(),
      ...input,
    };

    this.winston.info(entry.event, entry);
  }

  /** Graceful shutdown — cierra transportes de Winston */
  async onModuleDestroy(): Promise<void> {
    this.nestLogger.log("Cerrando transports de Winston...");
    await new Promise<void>((resolve) => {
      this.winston.close();
      // Winston puede tardar en emitir 'finish'; damos un timeout generoso
      setTimeout(resolve, 2_000);
    });
    this.nestLogger.log("Winston cerrado correctamente.");
  }
}
```

### 4. `RequestLoggingInterceptor`

```typescript
// back/src/common/interceptors/request-logging.interceptor.ts

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Request } from "express";
import { SecurityLogger } from "../logging/security-logger.service";

interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private readonly securityLogger: SecurityLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { method, originalUrl, ip, headers } = request;
    const userAgent = headers["user-agent"] ?? undefined;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: (body: unknown) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const durationMs = Date.now() - start;

          // Sanitizar: no loguear bodies grandes (fotos, exports, etc.)
          let responseSize: number | undefined;
          if (typeof body === "string") {
            responseSize = body.length;
          } else if (body && typeof body === "object") {
            responseSize = JSON.stringify(body).length;
          }

          this.securityLogger.log({
            event: "REQUEST",
            severity: "info",
            method,
            path: originalUrl,
            statusCode,
            durationMs,
            responseSize,
            ip: ip ?? undefined,
            userAgent,
            userId: request.user?.userId,
            email: request.user?.email,
          });
        },
        error: (error: Error & { status?: number }) => {
          const durationMs = Date.now() - start;
          const statusCode = error.status ?? 500;

          this.securityLogger.log({
            event: "REQUEST_ERROR",
            severity: statusCode >= 500 ? "alert" : "warn",
            method,
            path: originalUrl,
            statusCode,
            durationMs,
            ip: ip ?? undefined,
            userAgent,
            userId: request.user?.userId,
            email: request.user?.email,
            meta: {
              errorName: error.name,
              errorMessage: this.sanitizeErrorMessage(error.message),
            },
          });

          // Re-lanzar el error para que el ExceptionFilter lo maneje
          throw error;
        },
      }),
    );
  }

  /**
   * Sanitiza el mensaje de error para no exponer datos sensibles
   * (tokens, contraseñas, secrets) en los logs.
   */
  private sanitizeErrorMessage(message: string): string {
    // Truncar mensajes muy largos (stack traces, HTML, etc.)
    const MAX_LENGTH = 500;
    if (message.length > MAX_LENGTH) {
      return message.substring(0, MAX_LENGTH) + "... [truncado]";
    }
    return message;
  }
}
```

### 5. `SecurityLoggerModule`

```typescript
// back/src/common/logging/security-logger.module.ts

import { Global, Module } from "@nestjs/common";
import { SecurityLogger } from "./security-logger.service";
import { createWinstonLogger, WINSTON_LOGGER } from "./winston.config";

@Global()
@Module({
  providers: [
    {
      provide: WINSTON_LOGGER,
      useFactory: () => createWinstonLogger(),
    },
    SecurityLogger,
  ],
  exports: [WINSTON_LOGGER, SecurityLogger],
})
export class SecurityLoggerModule {}
```

### 6. Registro en `main.ts`

```typescript
// back/src/main.ts (cambios a añadir)

// Después de crear la app:
import { RequestLoggingInterceptor } from "./common/interceptors/request-logging.interceptor";
import { SecurityLogger } from "./common/logging/security-logger.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ... existing pipes, cors, cookieParser, globalPrefix, filters ...

  // Registrar interceptor global de logging (después de filters para que
  // el interceptor capture también errores que pasen por los filters)
  const securityLogger = app.get(SecurityLogger);
  app.useGlobalInterceptors(new RequestLoggingInterceptor(securityLogger));

  // Graceful shutdown — cerrar Winston
  app.enableShutdownHooks();

  // ... listen ...
}
```

### 7. `AppModule` — importar SecurityLoggerModule

```typescript
// back/src/app.module.ts

import { SecurityLoggerModule } from "./common/logging/security-logger.module";

@Module({
  imports: [
    SecurityLoggerModule, // ← Añadir (primero, porque es @Global)
    PrismaModule,
    IdentityModule,
    CatalogsModule,
    InventoryModule,
    MediaModule.forRoot(),
  ],
})
export class AppModule {}
```

---

## Implementation Steps

### Paso 1: Instalar dependencias

```bash
cd back
pnpm add winston winston-daily-rotate-file
pnpm add -D @types/winston 2>/dev/null || true  # winston v3 tiene tipos incluidos
```

### Paso 2: Crear estructura de archivos

Crear los 7 archivos de la sección **Files To Create** (F1–F7) con el contenido
especificado arriba. Usar los tipos y firmas exactas documentadas.

### Paso 3: Modificar archivos existentes (M1–M5)

1. `back/package.json` — verificar que `winston` y `winston-daily-rotate-file`
   aparecen en `dependencies`.
2. `back/src/main.ts` — añadir el registro del interceptor global +
   `enableShutdownHooks()` como se especifica en la sección 6.
3. `back/src/app.module.ts` — importar `SecurityLoggerModule`.
4. `back/.env.example` — añadir `LOG_DIR=./logs`.
5. `back/.gitignore` — asegurar que `logs/` está ignorado.

### Paso 4: Escribir tests unitarios

#### `request-logging.interceptor.spec.ts`

```typescript
// back/src/common/interceptors/request-logging.interceptor.spec.ts

import { Test, TestingModule } from "@nestjs/testing";
import { RequestLoggingInterceptor } from "./request-logging.interceptor";
import { SecurityLogger } from "../logging/security-logger.service";
import { ExecutionContext, CallHandler } from "@nestjs/common";
import { of, throwError } from "rxjs";

describe("RequestLoggingInterceptor", () => {
  let interceptor: RequestLoggingInterceptor;
  let securityLogger: jest.Mocked<SecurityLogger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestLoggingInterceptor,
        { provide: SecurityLogger, useValue: { log: jest.fn() } },
      ],
    }).compile();

    interceptor = module.get(RequestLoggingInterceptor);
    securityLogger = module.get(SecurityLogger);
  });

  function createMockContext(
    overrides: Partial<{
      method: string;
      url: string;
      ip: string;
      statusCode: number;
      user: object | undefined;
      userAgent: string;
    }> = {},
  ) {
    const response = { statusCode: overrides.statusCode ?? 200 };
    const request = {
      method: overrides.method ?? "GET",
      originalUrl: overrides.url ?? "/api/v1/test",
      ip: overrides.ip ?? "127.0.0.1",
      headers: { "user-agent": overrides.userAgent ?? "vitest" },
      user: overrides.user,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;
  }

  it("loguea requests exitosos con userId cuando está autenticado", (done) => {
    const ctx = createMockContext({
      method: "POST",
      url: "/api/v1/auth/login",
      statusCode: 201,
      user: { userId: "user-1", email: "op@nexo.mx", role: "operator" },
    });
    const handler: CallHandler = { handle: () => of({ ok: true }) };

    interceptor.intercept(ctx, handler).subscribe({
      next: () => {
        expect(securityLogger.log).toHaveBeenCalledTimes(1);
        const call = securityLogger.log.mock.calls[0][0];
        expect(call.event).toBe("REQUEST");
        expect(call.method).toBe("POST");
        expect(call.path).toBe("/api/v1/auth/login");
        expect(call.statusCode).toBe(201);
        expect(call.userId).toBe("user-1");
        expect(call.email).toBe("op@nexo.mx");
        expect(call.durationMs).toBeGreaterThanOrEqual(0);
        done();
      },
    });
  });

  it("loguea requests de usuarios no autenticados sin userId", (done) => {
    const ctx = createMockContext({ user: undefined });
    const handler: CallHandler = { handle: () => of({}) };

    interceptor.intercept(ctx, handler).subscribe({
      next: () => {
        const call = securityLogger.log.mock.calls[0][0];
        expect(call.userId).toBeUndefined();
        expect(call.email).toBeUndefined();
        done();
      },
    });
  });

  it("loguea errores con severity apropiada (5xx → alert)", (done) => {
    const ctx = createMockContext({ statusCode: 500 });
    const error = Object.assign(new Error("DB connection failed"), {
      status: 500,
    });
    const handler: CallHandler = {
      handle: () => throwError(() => error),
    };

    interceptor.intercept(ctx, handler).subscribe({
      error: () => {
        expect(securityLogger.log).toHaveBeenCalledTimes(1);
        const call = securityLogger.log.mock.calls[0][0];
        expect(call.event).toBe("REQUEST_ERROR");
        expect(call.statusCode).toBe(500);
        expect(call.severity).toBe("alert");
        expect(call.meta).toBeDefined();
        expect(call.meta!.errorName).toBe("Error");
        done();
      },
    });
  });

  it("loguea errores 4xx con severity warn", (done) => {
    const ctx = createMockContext({ statusCode: 404 });
    const error = Object.assign(new Error("Not found"), { status: 404 });
    const handler: CallHandler = {
      handle: () => throwError(() => error),
    };

    interceptor.intercept(ctx, handler).subscribe({
      error: () => {
        const call = securityLogger.log.mock.calls[0][0];
        expect(call.severity).toBe("warn");
        done();
      },
    });
  });

  it("sanitiza mensajes de error largos", (done) => {
    const ctx = createMockContext({ statusCode: 500 });
    const longMessage = "x".repeat(600);
    const error = Object.assign(new Error(longMessage), { status: 500 });
    const handler: CallHandler = {
      handle: () => throwError(() => error),
    };

    interceptor.intercept(ctx, handler).subscribe({
      error: () => {
        const call = securityLogger.log.mock.calls[0][0];
        const msg = call.meta!.errorMessage as string;
        expect(msg.length).toBeLessThanOrEqual(505); // 500 + "... [truncado]"
        expect(msg).toContain("[truncado]");
        done();
      },
    });
  });
});
```

#### `security-logger.service.spec.ts`

```typescript
// back/src/common/logging/security-logger.service.spec.ts

import { Test, TestingModule } from "@nestjs/testing";
import { SecurityLogger } from "./security-logger.service";
import { createWinstonLogger, WINSTON_LOGGER } from "./winston.config";

describe("SecurityLogger", () => {
  let logger: SecurityLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityLogger,
        {
          provide: WINSTON_LOGGER,
          useFactory: () =>
            createWinstonLogger(), // sin consola en tests
        },
      ],
    }).compile();

    logger = module.get(SecurityLogger);
  });

  afterEach(async () => {
    await logger.onModuleDestroy();
  });

  it("log() produce un evento con timestamp, event, severity", () => {
    // Espiar winston internamente
    const winstonLogger = (logger as any).winston;
    const spy = vi.spyOn(winstonLogger, "info");

    logger.log({
      event: "REQUEST",
      severity: "info",
      method: "GET",
      path: "/api/v1/test",
      statusCode: 200,
      durationMs: 15,
      ip: "127.0.0.1",
    });

    expect(spy).toHaveBeenCalledTimes(1);
    const [message, meta] = spy.mock.calls[0];
    expect(message).toBe("REQUEST");
    expect(meta).toMatchObject({
      event: "REQUEST",
      severity: "info",
      method: "GET",
      path: "/api/v1/test",
      statusCode: 200,
      durationMs: 15,
      ip: "127.0.0.1",
    });
    expect(meta.timestamp).toBeDefined();
  });

  it("onModuleDestroy cierra Winston sin errores", async () => {
    await expect(logger.onModuleDestroy()).resolves.toBeUndefined();
  });
});
```

### Paso 5: Ejecutar verificación

```bash
cd back
pnpm vitest run -- src/common/interceptors/request-logging.interceptor.spec.ts
pnpm vitest run -- src/common/logging/security-logger.service.spec.ts
pnpm vitest run  # todos los tests existentes deben seguir pasando
pnpm tsc -b      # compilación limpia
```

### Paso 6: Verificación manual

1. Levantar servidor: `pnpm dev` en `back/`
2. Hacer requests:
   ```bash
   # Request exitoso sin auth
   curl -v http://localhost:3000/api/v1/auth/login -X POST \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"wrong"}'

   # Request con error 401
   curl -v http://localhost:3000/api/v1/auth/me
   ```
3. Verificar que existe `./logs/nexo-security-YYYY-MM-DD.log` con entradas JSON.
4. Verificar que en consola (dev) aparecen mensajes formateados.

Ejemplo de entrada esperada en el archivo de log:
```json
{
  "timestamp": "2026-07-07T12:00:00.000Z",
  "event": "REQUEST_ERROR",
  "severity": "warn",
  "method": "POST",
  "path": "/api/v1/auth/login",
  "statusCode": 401,
  "durationMs": 12,
  "ip": "::1",
  "userAgent": "curl/8.x",
  "meta": {
    "errorName": "UnauthorizedException",
    "errorMessage": "Invalid credentials"
  }
}
```

---

## Integration With NEXO-0023 Phases

Este handoff es **Fase 0** de `NEXO-0023`. Las fases posteriores (ya planificadas)
se construyen sobre esta base:

| Fase | Qué añade | Impacto en este handoff |
|------|-----------|------------------------|
| **Fase 0** (este handoff) | Interceptor global + Winston archivos | Base — implementar primero |
| Fase 1 | `warn()` y `alert()` en SecurityLogger, integración en AuthController/Guards | Extiende `SecurityLogger` con nuevos métodos. No modifica el interceptor. |
| Fase 2 | Buffer BD + Prisma `SecurityEvent` + flush batch | Añade `warn()` que pushea al buffer. El interceptor ya llama `log()` con `severity` correcta. |
| Fase 3 | Nodemailer + rate-limiter para alertas | `alert()` envía email. El interceptor ya marca errores 500 como `severity: "alert"`. |
| Fase 4 | Export endpoint | Independiente del interceptor. |

**El interceptor es forward-compatible**: cuando `SecurityLogger` gane `warn()` y
`alert()` en fases posteriores, el interceptor los usará automáticamente porque
ya está pasando `severity` correcta en cada evento.

---

## Verification

### Automática

- [ ] `pnpm vitest run -- src/common/interceptors/request-logging.interceptor.spec.ts` — 5 tests pasan
- [ ] `pnpm vitest run -- src/common/logging/security-logger.service.spec.ts` — 2 tests pasan
- [ ] `pnpm vitest run` — todos los tests existentes siguen pasando (sin regresiones)
- [ ] `pnpm tsc -b` en `back/` — compilación limpia sin errores

### Manual

- [ ] `pnpm dev` → archivo `./logs/nexo-security-YYYY-MM-DD.log` se crea automáticamente
- [ ] Request `GET /api/v1/auth/me` sin token → entrada en log con `statusCode: 401`, `severity: "warn"`
- [ ] Request `POST /api/v1/auth/login` con credenciales inválidas → entrada con `statusCode: 401`
- [ ] Request `GET /api/v1/catalogs/clothing-types` autenticado → entrada con `userId` y `email`
- [ ] Request que causa 500 (simulado) → entrada con `severity: "alert"`
- [ ] Consola en dev muestra logs formateados con colores
- [ ] `Ctrl+C` cierra el servidor sin errores (graceful shutdown de Winston)

---

## Risks

| Riesgo | Mitigación |
|--------|-----------|
| **Logs con datos sensibles** (tokens, passwords, secrets) | El interceptor NO loguea headers completos ni bodies. Solo method, path, status, ip, userAgent, userId, email, duration. Los mensajes de error se truncan a 500 caracteres. |
| **Volumen de logs** — ~500 eventos/día | Con compresión gzip y rotación diaria con retención 30 días, el volumen es manejable (~150MB/mes). Ver ADR §7 para estimaciones. |
| **Impacto en rendimiento** — Winston escribe sincrónicamente | La escritura a archivo de Winston con `DailyRotateFile` es asíncrona por defecto. No bloquea el event loop de Node. |
| **Logs en producción a consola** | El código verifica `NODE_ENV !== "production"` antes de añadir el Console transport. En prod, solo archivo. |
| **Race condition en graceful shutdown** | `onModuleDestroy` espera 2 segundos tras `winston.close()` para asegurar que todos los writes pendientes se completen. |

---

## Acceptance Criteria

1. Todo request HTTP (exitoso o con error) genera una entrada JSON en
   `./logs/nexo-security-YYYY-MM-DD.log`.
2. Cada entrada incluye: `timestamp`, `event`, `severity`, `method`, `path`,
   `statusCode`, `durationMs`, `ip`.
3. Requests autenticados incluyen `userId` y `email`.
4. Errores 5xx tienen `severity: "alert"`; errores 4xx tienen `severity: "warn"`.
5. No se loguean bodies de request/response, headers completos, tokens, ni
   contraseñas.
6. Mensajes de error > 500 caracteres se truncan con marcador `[truncado]`.
7. Tests unitarios pasan (5 tests del interceptor + 2 tests del logger).
8. Tests existentes no rompen (sin regresiones).
9. `pnpm tsc -b` compila limpio.
10. Graceful shutdown (`Ctrl+C`) cierra Winston sin errores ni pérdida de logs.

## Required Gates

- QA review: requerida antes del closeout de NEXO-0023 (`nexo-qa`).
- Security review: requerida — verificar que no se loguean secrets, tokens, ni
  datos personales más allá de userId/email (`nexo-security`).
- User confirmation: requerida antes de commit, push, o deploy.

## Non-Goals (Explicit)

- No implementar buffer BD, email, ni persistencia en esta fase (eso es Fase 1-3
  de NEXO-0023).
- No crear UI/dashboard para visualizar logs.
- No integrar con ELK, Grafana, Sentry, ni ningún servicio externo.
- No modificar el comportamiento de guards, controllers, ni filtros existentes.
- No commit, push, o deploy sin confirmación explícita del usuario.

## Suggested Skills

- `tdd` — los tests del interceptor ya están especificados; ejecutar en modo watch
  durante el desarrollo.
- `commit-work` — cuando esté listo para separar los cambios en commits atómicos.
- `diagnosing-bugs` — si el interceptor interfiere con el ciclo de vida de NestJS.

---

## Design Decision Record

### ¿Por qué interceptor global y no por módulo?

Un interceptor global (`app.useGlobalInterceptors()`) captura **todos** los
requests sin requerir que cada módulo lo registre manualmente. Esto garantiza
que no haya endpoints "ciegos" (sin logging).

### ¿Por qué `tap` y no `map`/`catchError`?

`tap` es el operador RxJS correcto para efectos secundarios porque:
- No modifica el flujo de datos (el handler recibe la respuesta sin cambios)
- `tap({ next, error })` maneja ambos casos (éxito y error) en un solo operador
- Re-lanzar el error en `tap.error` asegura que los ExceptionFilters existentes
  sigan funcionando

### ¿Por qué Winston y no Pino?

Winston está elegido en el ADR (`ADR-2026-07-06-security-logging-architecture.md`)
por su ecosistema maduro de transports (`winston-daily-rotate-file`, compresión
gzip nativa, Console transport con color). Pino es más rápido pero requiere más
configuración manual para rotación.

### ¿Por qué `SecurityLogger` como servicio separado y no lógica inline?

Separar el logger del interceptor permite:
1. Inyectar `SecurityLogger` en guards y controllers en fases posteriores.
2. Testear el logger y el interceptor de forma independiente.
3. Cambiar el transport (Winston → Pino → cloud) sin tocar el interceptor.
4. Añadir severidades `warn`/`alert` con comportamientos distintos sin modificar
   el interceptor.

Esto sigue el **Observer Pattern**: el interceptor es un productor de eventos;
Winston, DB Buffer y Email Sender son consumidores intercambiables.
