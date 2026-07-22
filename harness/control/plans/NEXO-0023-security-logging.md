# NEXO-0023 - Security Logging & Alerting System

## Metadata

- Task ID: NEXO-0023
- Status: planned
- Priority: P1
- Parent: NEXO-0022 (dual token auth)
- Created: 2026-07-06
- Updated: 2026-07-07 (added Phase 0 — RequestLoggingInterceptor)
- Agent: nexo-security (original), nexo-plan (Phase 0 planning)
- ADR: `docs/adr/ADR-2026-07-06-security-logging-architecture.md`
- Phase 0 Handoff: `harness/control/handoffs/HOFF-2026-07-07-request-logging-interceptor.md`

## Objective

Implementar un sistema de logging de seguridad en 3 niveles:
- **Nivel 1**: Archivos JSON rotativos (Winston) — todos los eventos
- **Nivel 2**: Buffer → PostgreSQL batch — eventos de negocio y seguridad media
- **Nivel 3**: BD + email inmediato — alertas críticas (brute force, 500,
  accesos no autorizados)

Además, un **Interceptor global NestJS** (Fase 0) que capture automáticamente
cada request HTTP entrante y su respuesta (método, ruta, status, IP, usuario,
duración), proporcionando visibilidad total sobre qué sucede en cada endpoint.

### Design Patterns aplicados

| Patrón | Rol |
|--------|-----|
| **NestJS Interceptor** | Envuelve cada request/response. AOP para cross-cutting concerns. |
| **Observer** | SecurityLogger es el sujeto; Winston, DB Buffer, Email Sender son observadores. |
| **Chain of Responsibility** | Pipeline de severidad: info→archivo, warn→+buffer, alert→+email. |
| **Exception Filter** | Captura errores 500 y los loguea como alertas. |

## Scope

### In Scope
- ✅ **Fase 0**: `RequestLoggingInterceptor` global — captura automática de cada HTTP request/response (ver handoff)
- `SecurityLogger` service con niveles `info|warn|alert`
- Winston con rotación diaria comprimida (gzip)
- Buffer en memoria para writes batch a BD
- Modelo Prisma `SecurityEvent`
- `Nodemailer` para alertas por email
- Rate-limiting de alertas (máx 1 por tipo cada 30 min)
- Integración en guards, controller auth, y exception filter
- Endpoint Admin para consultar eventos
- Daily export endpoint

### Out of Scope
- ELK/Grafana/Prometheus (overkill para v1)
- Dashboard UI de logs (solo API por ahora)

---

## Architecture Decision

Ver `docs/adr/ADR-2026-07-06-security-logging-architecture.md` para el análisis
completo de límites cloud, estimaciones de volumen, y justificación.

---

## Files To Create

| # | File | Purpose |
|---|------|---------|
| 1 | `back/src/common/logging/security-logger.service.ts` | Servicio central: log(), alert(), flush() |
| 2 | `back/src/common/logging/security-event-buffer.ts` | Buffer en memoria, flush batch a BD |
| 3 | `back/src/common/logging/winston.config.ts` | Configuración Winston + rotación diaria |
| 4 | `back/src/common/filters/security-exception.filter.ts` | ExceptionFilter global — captura errores 500 |
| 5 | `back/src/common/logging/security-logger.module.ts` | NestJS module exportando SecurityLogger |

## Files To Modify

| # | File | Change |
|---|------|--------|
| 6 | `back/package.json` | `winston`, `winston-daily-rotate-file`, `nodemailer` |
| 7 | `back/prisma/schema.prisma` | Añadir modelo `SecurityEvent` |
| 8 | `back/.env` / `.env.example` | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ALERT_EMAIL`, `LOG_DIR` |
| 9 | `back/src/app.module.ts` | Importar `SecurityLoggerModule`, registrar `APP_FILTER` |
| 10 | `back/src/modules/identity/interface/http/auth.controller.ts` | Inyectar `SecurityLogger`, loguear login/logout/refresh |
| 11 | `back/src/modules/identity/interface/http/guards/session-auth.guard.ts` | Loguear 401 |
| 12 | `back/src/modules/identity/interface/http/guards/permission.guard.ts` | Loguear 403 |
| 13 | `back/src/modules/identity/interface/http/guards/jwt-cookie.strategy.ts` | Loguear token type mismatch |
| 14 | `back/src/modules/identity/interface/http/auth.e2e-spec.ts` | Test de eventos de seguridad |

---

## Detailed Implementation Specs

### 1. SecurityLogger Service

```typescript
// back/src/common/logging/security-logger.service.ts

export interface SecurityEventInput {
  event: string;          // e.g. "AUTH_LOGIN_FAILURE"
  severity: "info" | "warn" | "alert";
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  meta?: Record<string, unknown>;
}

@Injectable()
export class SecurityLogger {
  // info  → archivo (siempre)
  // warn  → archivo + buffer BD (flush batch)
  // alert → archivo + BD inmediato + email

  log(input: SecurityEventInput): void { /* winston.info */ }
  warn(input: SecurityEventInput): void { /* winston.warn + buffer.add */ }
  alert(input: SecurityEventInput): void { /* winston.error + db.insert + email.send */ }

  async flush(): Promise<void> { /* flush buffer to DB */ }
  async exportDailyEvents(): Promise<SecurityEventRecord[]> { /* BD query */ }
}
```

### 2. Winston Config

```typescript
// back/src/common/logging/winston.config.ts

import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export function createWinstonLogger(logDir?: string) {
  const dir = logDir ?? process.env.LOG_DIR ?? "./logs";

  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new DailyRotateFile({
        dirname: dir,
        filename: "nexo-security-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxFiles: "30d",
        zippedArchive: true,
        maxSize: "20m"
      }),
      // En desarrollo también a consola
      ...(process.env.NODE_ENV !== "production"
        ? [new winston.transports.Console({ format: winston.format.simple() })]
        : [])
    ]
  });
}
```

### 3. SecurityEvent Prisma Model

```prisma
// back/prisma/schema.prisma (añadir al final)

model SecurityEvent {
  id        String   @id @default(uuid())
  event     String                     // "AUTH_LOGIN_FAILURE"
  severity  String   @default("info")  // "info" | "warn" | "alert"
  userId    String?                    // null si no hay sesión
  email     String?
  ip        String?
  userAgent String?
  meta      Json?                      // payload flexible
  createdAt DateTime @default(now())

  @@index([event])
  @@index([severity])
  @@index([createdAt])
  @@index([userId])
}
```

### 4. Email Config (env vars)

```env
# .env (añadir)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=nexo-alerts@gmail.com
SMTP_PASS=your-app-password
ALERT_EMAIL=tu-correo@gmail.com
LOG_DIR=./logs
```

### 5. Alert Rate Limiter

```typescript
// Dentro de SecurityLogger

private alertCooldowns = new Map<string, number>();

private canSendAlert(eventType: string): boolean {
  const cooldownMs = 30 * 60 * 1000; // 30 min
  const lastSent = this.alertCooldowns.get(eventType) ?? 0;
  if (Date.now() - lastSent < cooldownMs) return false;
  this.alertCooldowns.set(eventType, Date.now());
  return true;
}
```

---

## Integration Points

| Integration | Dónde | Qué se loguea |
|---|---|---|
| `AuthController.login` | `catch (AuthenticationError)` → `warn` | `AUTH_LOGIN_FAILURE` (email + IP + intento #) |
| `AuthController.login` | éxito → `info` | `AUTH_LOGIN_SUCCESS` (userId + IP) |
| `AuthController.refresh` | `catch` → `alert` | `AUTH_REFRESH_INVALID` |
| `AuthController.logout` | → `info` | `AUTH_LOGOUT` |
| `SessionAuthGuard` | 401 → `warn` | `AUTH_MISSING_TOKEN` o `AUTH_INVALID_TOKEN` |
| `PermissionGuard` | 403 → `warn` | `AUTHORIZATION_DENIED` (rol + permiso requerido) |
| `PermissionGuard` | 403 admin → `alert` | `AUTHORIZATION_ADMIN_DENIED` |
| `JwtAccessStrategy.validate` | type ≠ access → `alert` | `TOKEN_TYPE_MISMATCH` |
| `SecurityExceptionFilter` | 500 → `alert` | `ERROR_500` (stack trace en meta) |
| Brute force detector | 3+ fallos en 10 min → `alert` | `AUTH_BRUTE_FORCE` (IP + intentos) |

---

## Implementation Phases

### Fase 0: HTTP Request/Response Interceptor — ~5 archivos, 2 deps

**Handoff**: `harness/control/handoffs/HOFF-2026-07-07-request-logging-interceptor.md`

0.1 Instalar `winston` + `winston-daily-rotate-file` (`pnpm add`)
0.2 Crear `back/src/common/logging/winston.config.ts` (configuración base Winston + DailyRotateFile)
0.3 Crear `back/src/common/logging/logging.types.ts` (interfaces `SecurityEventInput`, `RequestLogEntry`)
0.4 Crear `back/src/common/logging/security-logger.service.ts` (solo `log()` nivel info, sin buffer ni email)
0.5 Crear `back/src/common/logging/security-logger.module.ts` (`@Global()` module)
0.6 Crear `back/src/common/interceptors/request-logging.interceptor.ts` (NestInterceptor global)
0.7 Crear tests unitarios: `request-logging.interceptor.spec.ts` (5 tests) + `security-logger.service.spec.ts` (2 tests)
0.8 Modificar `back/src/main.ts`: registrar interceptor global + `enableShutdownHooks()`
0.9 Modificar `back/src/app.module.ts`: importar `SecurityLoggerModule`
0.10 Modificar `back/.env.example`: añadir `LOG_DIR=./logs`
0.11 Modificar `back/.gitignore`: añadir `logs/`

**Verificación Fase 0**: archivo `./logs/nexo-security-YYYY-MM-DD.log` creado.
7 tests unitarios pasan. `pnpm tsc -b` limpio. `curl` → entradas JSON en log.
Graceful shutdown sin errores.

### Fase 1: Auth Integration — integración en guards y controllers

1. Añadir `warn()` y `alert()` al `SecurityLogger` (extiende el `log()` de Fase 0)
2. Inyectar `SecurityLogger` en `AuthController` y loguear login/logout/refresh
3. Inyectar en `SessionAuthGuard` (401 → `warn`)
4. Inyectar en `PermissionGuard` (403 → `warn`; admin denial → `alert`)
5. Inyectar en `JwtAccessStrategy.validate` (token type mismatch → `alert`)

**Verificación Fase 1**: `pnpm vitest run` — guards loguean sin romper nada.
Auth e2e tests (`auth.e2e-spec.ts`) siguen pasando.

### Fase 2: Persistencia (BD) — modelo Prisma + buffer batch

6. Añadir modelo `SecurityEvent` a `schema.prisma`
7. `pnpm prisma migrate dev --name add_security_event`
8. Crear `back/src/common/logging/security-event-buffer.ts`
9. Añadir lógica de buffer: `warn()` pushea al buffer, flush cada 5 min o 50 eventos
10. Añadir `flush()` en `onModuleDestroy` del `SecurityLogger`
11. Crear controller `GET /api/v1/admin/security-events` (admin only, paginado)

**Verificación Fase 2**: `pnpm vitest run` — login fallido produce fila en BD.
`GET /admin/security-events` devuelve eventos paginados. Buffer flushea correctamente.

### Fase 3: Alertas (email) — nodemailer + rate-limiter

12. `pnpm add nodemailer @types/nodemailer`
13. Añadir env vars SMTP a `.env` / `.env.example`
14. Implementar `alert()`: archivo + DB inmediato + email con rate-limit (30 min)
15. Implementar brute force detector (map IP → contador de fallos en 10 min)
16. Integrar alertas en: brute force, 500, token mismatch, admin denial

**Verificación Fase 3**: 3 logins fallidos seguidos → email recibido (máx 1
cada 30 min para mismo tipo). Error 500 simulado → email.

### Fase 4: Exportación — endpoint de export

17. Endpoint `POST /api/v1/admin/security-events/export` (CSV/JSON)
18. Query: eventos del día actual. Admin only.

---

## Dependencies

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `winston` | `^3` | Logger estructurado |
| `winston-daily-rotate-file` | `^5` | Rotación diaria con compresión |
| `nodemailer` | `^6` | Envío de emails |
| `@types/nodemailer` | `^6` | Tipos TypeScript |

---

## Env Vars (añadir a .env)

```env
# Security Logging
LOG_DIR=./logs

# Email Alerts (solo para Nivel 3)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=nexo-alerts@gmail.com
SMTP_PASS=replace-with-gmail-app-password
ALERT_EMAIL=tu-correo@gmail.com
```

---

## Event Catalog

| Evento | Nivel | A Archivo | A BD | A Email | Origen |
|--------|-------|-----------|------|---------|--------|
| `REQUEST` | info | ✅ | ❌ | ❌ | Interceptor (Fase 0) |
| `REQUEST_ERROR` | warn/alert | ✅ | ❌ | ❌ | Interceptor (Fase 0) — severity según status code |
| `AUTH_LOGIN_SUCCESS` | info | ✅ | ✅ | ❌ | AuthController (Fase 1) |
| `AUTH_LOGIN_FAILURE` | warn | ✅ | ✅ | ❌ | AuthController (Fase 1) |
| `AUTH_BRUTE_FORCE` | alert | ✅ | ✅ | ✅ | Brute force detector (Fase 3) |
| `AUTH_LOGOUT` | info | ✅ | ✅ | ❌ | AuthController (Fase 1) |
| `AUTH_REFRESH` | info | ✅ | ❌ | ❌ | AuthController (Fase 1) |
| `AUTH_REFRESH_INVALID` | alert | ✅ | ✅ | ✅ | AuthController (Fase 1) |
| `AUTH_MISSING_TOKEN` | warn | ✅ | ✅ | ❌ | SessionAuthGuard (Fase 1) |
| `AUTH_INVALID_TOKEN` | warn | ✅ | ✅ | ❌ | SessionAuthGuard (Fase 1) |
| `AUTHORIZATION_DENIED` | warn | ✅ | ✅ | ❌ | PermissionGuard (Fase 1) |
| `AUTHORIZATION_ADMIN_DENIED` | alert | ✅ | ✅ | ✅ | PermissionGuard (Fase 1) |
| `TOKEN_TYPE_MISMATCH` | alert | ✅ | ✅ | ✅ | JwtAccessStrategy (Fase 1) |
| `ERROR_500` | alert | ✅ | ✅ | ✅ | ExceptionFilter (Fase 1) |

---

## Verification

- [ ] Fase 0: 7 unit tests pasan (interceptor 5 + logger 2)
- [ ] Fase 0: `pnpm tsc -b` compila limpio
- [ ] Fase 0: `./logs/nexo-security-YYYY-MM-DD.log` creado con entradas `REQUEST` y `REQUEST_ERROR`
- [ ] Fase 0: Graceful shutdown cierra Winston sin errores
- [ ] Unit tests: `SecurityLogger.log/warn/alert` produce eventos con el nivel correcto
- [ ] Unit tests: buffer flush cada 50 eventos o 5 min
- [ ] Unit tests: alert rate-limiter (no duplica email en 30 min)
- [ ] E2E: login fallido 3 veces → evento `AUTH_BRUTE_FORCE` en BD con IP
- [ ] E2E: 403 admin denial → evento `AUTHORIZATION_ADMIN_DENIED` en BD
- [ ] E2E: refresh con token expirado → evento `AUTH_REFRESH_INVALID`
- [ ] E2E: `GET /admin/security-events` paginado, solo Admin
- [ ] E2E: `POST /admin/security-events/export` devuelve CSV del día
- [ ] Manual: archivo `./logs/nexo-security-YYYY-MM-DD.log` existe tras correr tests
- [ ] Manual: archivo comprimido `.gz` tras rotación

---

## Time Estimate

| Fase | Tiempo estimado |
|------|-----------------|
| Fase 0 (interceptor + Winston base) | 1-2 horas |
| Fase 1 (auth integration) | 1-2 horas |
| Fase 2 (BD) | 1-2 horas |
| Fase 3 (email) | 1-2 horas |
| Fase 4 (export) | 0.5 horas |
| **Total** | **5-9 horas** |
