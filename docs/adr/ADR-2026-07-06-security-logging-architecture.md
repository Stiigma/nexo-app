# NEXO-0023 — Análisis: Logging de Seguridad en Nexo v1

## Metadata

- Task: NEXO-0023 (propuesta de análisis)
- Fecha: 2026-07-06
- Agente: nexo-security
- Tipo: análisis de factibilidad / ADR preliminar
- Pregunta del usuario: ¿Conviene implementar un logger/bitácora de seguridad con
  alertas por email? ¿Agotará los límites de BD cloud gratuita?

---

## 1. Contexto del Negocio

Nexo es un negocio de reventa de ropa en Ensenada, Baja California. En v1:

- **Usuarios**: ~2-5 (Admin + Operators) — es una app interna, no pública
- **Volumen diario estimado**:
  - 10-50 compras (lotes)
  - 10-50 ventas
  - 100-500 requests API/día durante uso activo
  - 5-20 logins/día
  - ~160 token refreshes/día (5 usuarios × 32 refreshes c/8h = cada 15 min)
- **BD local**: PostgreSQL en Docker (desarrollo)
- **BD producción**: aún no definida (probable cloud gratuita para empezar)

---

## 2. Límites de BD Cloud Gratuitas (2026)

| Proveedor | Conexiones | Storage | Escrituras/mes | Row reads/mes |
|-----------|-----------|---------|----------------|---------------|
| **Neon** | 20 concurrentes | 3 GB | Ilimitadas (cómputo: 100h/mes) | Ilimitadas |
| **Supabase** | 5-10 directas (PgBouncer) | 500 MB | Ilimitadas | Ilimitadas |
| **PlanetScale** | 5-10 | 5 GB | 10M | 1B |
| **Railway** | Sin límite fijo | 1 GB | Ilimitadas ($5 crédito) | Ilimitadas |

**El verdadero bottleneck**: no son las escrituras/mes, sino el **pool de
conexiones**. Cada insert via Prisma consume 1 conexión durante la transacción.
Con 5-10 conexiones y 100-500 requests/día, loguear cada request a BD competiría
con las operaciones de negocio.

---

## 3. ¿Qué Eventos de Seguridad Hay Que Registrar?

Los clasifico en 3 niveles por criticidad y frecuencia:

### Nivel 1 — Alta frecuencia, baja criticidad (NO van a BD)

| Evento | Frecuencia estimada/día |
|--------|------------------------|
| Request HTTP exitoso | ~300-500 |
| Token refresh exitoso | ~160 |
| Acceso a endpoint protegido | ~300 |
| Consulta GET de catálogos | ~200 |

→ **Van a archivos rotativos (Winston/Pino). Cero impacto en BD.**

### Nivel 2 — Media frecuencia, media criticidad (Buffer → BD batch)

| Evento | Frecuencia/día | ¿Va a BD? |
|--------|---------------|-----------|
| Login exitoso | ~10-20 | ✅ (1 row c/u) |
| Logout | ~10-20 | ✅ |
| Token refresh (solo metadata) | ~160 | ❌ (solo archivo) |
| Creación/edición de entidad | ~30-100 | ✅ (con userId) |

→ **~50-140 inserts/día en BD. Totalmente manejable.**

### Nivel 3 — Baja frecuencia, alta criticidad (BD + email inmediato)

| Evento | Frecuencia estimada |
|--------|---------------------|
| 3+ login fallidos en 10 min (misma IP) | ~0-1/día |
| Intento de acceso a ruta admin sin permisos | ~0-2/día |
| Token refresh con token inválido/expirado | ~0-3/día |
| Intento de usar refresh token como access | ~0-1/día |
| Error 500 inesperado | ~0-2/día |
| Cambio de rol o permisos de usuario | ~0-1/semana |
| Acceso a endpoint crítico (delete, export) | ~1-5/día |

→ **~1-10 inserts/día en BD + alerta por email.**

---

## 4. Impacto Estimado en BD Cloud Gratuita

### Escenario pesimista (logueando TODO a BD)

- 500 eventos/día × 30 días = **15,000 inserts/mes**
- Con Prisma: cada insert = 1-2 queries (insert + posible relación)
- Total: **~30,000 queries/mes**
- Esto está MUY por debajo de los 10M de PlanetScale, pero...
- **Cada insert consume 1 conexión del pool durante ~5-20ms**
- Con 500 requests/día distribuidos en 8 horas: ~1 request/minuto
- No hay contención real — el problema no es volumen, es **complejidad innecesaria**

### Escenario recomendado (solo Nivel 2 y 3 a BD)

- ~60-150 eventos/día que van a BD = **~1,800-4,500 inserts/mes**
- El resto (~400/día) van a archivo → **costo $0, sin impacto en BD**
- Conexiones: ~1 cada 2-5 minutos → el pool nunca se satura

### Conclusión

**NO hay riesgo de agotar los límites gratuitos** si seguimos la arquitectura
por niveles. El riesgo real sería loguear todo a BD sin criterio — no por
volumen de escrituras, sino por mala práctica arquitectónica (mezclar datos de
negocio con logs de seguridad en la misma BD).

---

## 5. Arquitectura Propuesta: Logging por Niveles

```
┌─────────────────────────────────────────────────────────────┐
│                    APLICACIÓN NESTJS                         │
│                                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐                │
│  │ Guards   │   │ Intercept│   │ Exception│                │
│  │ (auth)   │   │ (logging)│   │ Filter   │                │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘                │
│       │               │               │                      │
│       └───────────────┼───────────────┘                      │
│                       │                                      │
│              ┌────────▼────────┐                             │
│              │  SecurityLogger │  (servicio NestJS)          │
│              │  - log()        │                             │
│              │  - alert()      │                             │
│              │  - dailyExport()│                             │
│              └───┬──────┬──────┘                             │
│                  │      │                                     │
│         ┌────────▼──┐ ┌─▼──────────┐                        │
│         │  Winston   │ │ In-Memory  │                        │
│         │  (archivos)│ │  Buffer    │                        │
│         │  Nivel 1   │ │  Nivel 2+3 │                        │
│         │  TODO      │ │  solo BD   │                        │
│         └────────────┘ └─────┬──────┘                        │
│                              │                                │
│                    ┌─────────▼─────────┐                     │
│                    │  Batch cada 5 min  │                    │
│                    │  o 50 eventos      │                    │
│                    └─────────┬─────────┘                     │
│                              │                                │
└──────────────────────────────┼────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   PostgreSQL         │
                    │   SecurityEvent      │
                    │   (tabla ligera)     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Email Alert         │
                    │  (solo Nivel 3)      │
                    │  vía Nodemailer      │
                    │  o SendGrid free     │
                    └─────────────────────┘
```

### Componentes

| Componente | Tecnología | Propósito |
|---|---|---|
| **Winston** | `winston` + `winston-daily-rotate-file` | Todos los eventos a archivos JSON rotativos |
| **Buffer en memoria** | Array con flush cada 5 min o 50 eventos | Agrupa escrituras Nivel 2+3 a BD |
| **SecurityEvent (DB)** | Prisma model con índices ligeros | ~4,500 rows/mes, consultable para forense |
| **Email** | `nodemailer` + Gmail SMTP o SendGrid (gratis 100/día) | Solo Nivel 3 — estimado ~1-5 emails/día |
| **Daily Export** | Cron job o endpoint manual | Exporta logs del día a JSON/CSV, limpia archivos viejos |

### Por qué Winston para archivos (no BD)

- **Cero costo**: los archivos no consumen conexiones ni rows de BD
- **Rotación automática**: `winston-daily-rotate-file` comprime y borra archivos viejos
- **Estructurado**: logs en JSON para búsqueda futura (`jq`, `grep`, ELK)
- **Separación de concerns**: los logs de seguridad no pertenecen a la BD de negocio

### Por qué buffer para BD

- **Reduce conexiones**: 50 eventos en 1 transacción vs 50 transacciones separadas
- **No bloquea requests**: el request no espera el insert a BD
- **Resiliencia**: si la BD falla, los eventos quedan en archivo (Winston) y se
  pueden re-procesar

---

## 6. Eventos de Seguridad — Catálogo Completo

| Evento | Nivel | A Archivo | A BD | A Email |
|--------|-------|-----------|------|---------|
| `REQUEST` — toda petición HTTP (método, ruta, status, IP) | 1 | ✅ | ❌ | ❌ |
| `AUTH_LOGIN_SUCCESS` — login exitoso | 2 | ✅ | ✅ | ❌ |
| `AUTH_LOGIN_FAILURE` — credenciales inválidas | 2 | ✅ | ✅ | ❌ |
| `AUTH_LOGIN_BRUTE_FORCE` — 3+ fallos en 10 min | 3 | ✅ | ✅ | ✅ |
| `AUTH_LOGOUT` — cierre de sesión | 2 | ✅ | ✅ | ❌ |
| `AUTH_REFRESH` — renovación de access token | 1 | ✅ | ❌ | ❌ |
| `AUTH_REFRESH_INVALID` — refresh token inválido/expirado | 3 | ✅ | ✅ | ✅ |
| `AUTHORIZATION_DENIED` — 403 por permisos insuficientes | 2 | ✅ | ✅ | ❌ |
| `AUTHORIZATION_ADMIN_DENIED` — intento de acceso admin sin rol | 3 | ✅ | ✅ | ✅ |
| `TOKEN_TYPE_MISMATCH` — refresh usado como access o viceversa | 3 | ✅ | ✅ | ✅ |
| `ENTITY_CREATE/UPDATE/DELETE` — mutación de datos por usuario | 2 | ✅ | ✅ | ❌ |
| `ERROR_500` — error interno no manejado | 3 | ✅ | ✅ | ✅ |
| `ADMIN_ACTION` — cambio de roles, permisos, usuarios | 3 | ✅ | ✅ | ✅ |

---

## 7. Costos Mensuales Estimados

| Recurso | Free tier | Uso estimado Nexo | ¿Excede? |
|---------|-----------|-------------------|----------|
| Winston archivos | ∞ | ~150MB/mes (comprimido) | No |
| PostgreSQL rows | ∞ (escribe lo que quepa en disco) | ~4,500/mes | No |
| PostgreSQL storage | 500MB-5GB | ~5MB/mes | No |
| Conexiones BD pool | 5-20 | 1 batch c/5min | No |
| Emails (SendGrid) | 100/día | ~1-5/día | No |
| Emails (Gmail SMTP) | 500/día | ~1-5/día | No |

**Costo total mensual estimado: $0 USD** (todo dentro de free tiers).

---

## 8. Recomendación

**SÍ implementar**, con la arquitectura de 3 niveles descrita arriba. Argumentos:

1. **No agota los límites gratuitos**: solo ~4,500 eventos/mes van a BD. El
   95% del volumen va a archivos (gratis e ilimitados).
2. **Valor de seguridad inmediato**:
   - Detectar brute force en tiempo real (email)
   - Auditoría de quién hizo qué (BD consultable)
   - Trazabilidad para debugging (archivos JSON)
3. **Costo de implementación bajo**: ~3-5 archivos nuevos, ~2 dependencias npm.
4. **Preparado para crecer**: los archivos JSON rotativos se pueden ingestar en
   ELK/Grafana/Loki si el negocio escala.
5. **Independiente del proveedor cloud**: como los logs no dependen de la BD,
   migrar de Neon a Supabase o a un VPS no afecta la trazabilidad.

### Lo que NO recomiendo

- ❌ Loguear todo a BD (mezcla datos de negocio con logs, sobrecarga el pool)
- ❌ Servicio externo tipo Sentry/DataDog para esta etapa (overkill, $$)
- ❌ Email por cada evento de seguridad (ruido — solo patrones y críticos)

---

## 9. Plan de Implementación Propuesto (NEXO-0023)

### Fase 1 — Base (archivos)
1. Instalar `winston` + `winston-daily-rotate-file`
2. Crear `SecurityLogger` service con niveles `info|warn|alert`
3. Configurar rotación diaria con compresión gzip
4. Integrar en auth controller y guards

### Fase 2 — Persistencia (BD)
5. Crear modelo Prisma `SecurityEvent` (mínimo: id, event, severity, userId, ip, meta JSON, createdAt)
6. Implementar buffer en memoria (flush cada 5 min o 50 eventos)
7. Crear endpoint `GET /api/v1/admin/security-events` (Admin only)

### Fase 3 — Alertas (email)
8. Instalar `nodemailer` + `@types/nodemailer`
9. Configurar SMTP (Gmail app password o SendGrid API key)
10. Implementar `alert()` en `SecurityLogger` que envía email para Nivel 3
11. Añadir rate-limiting de emails (máx 1 email por tipo de alerta cada 30 min)

### Fase 4 — Exportación diaria
12. Endpoint `POST /api/v1/admin/security-events/export` (Admin only)
13. Cron job (opcional) para exportar y limpiar logs viejos
