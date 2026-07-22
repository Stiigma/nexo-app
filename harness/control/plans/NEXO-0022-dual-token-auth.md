# NEXO-0022 - Dual Token Auth (Access 15min + Refresh 7d)

## Metadata

- Task ID: NEXO-0022
- Status: active
- Priority: P0
- Parent: NEXO-0020 (bcrypt + Passport JWT Cookie Auth)
- Created: 2026-07-06
- Agent: nexo-security

## Objective

Reemplazar el sistema de token único JWT por un esquema de doble token:

- **Access token** (`nexo_access_token`): JWT con `type: "access"`, TTL 15 minutos.
  Se usa en todas las peticiones protegidas.
- **Refresh token** (`nexo_refresh_token`): JWT con `type: "refresh"`, TTL 7 días.
  Solo se usa en `POST /auth/refresh` para obtener un nuevo access token.

Flujo: Login → dos cookies → access expira → refresh en `/auth/refresh` →
nuevo access → refresh expira a los 7 días → reautenticar.

## Diseño de Tokens

### Access Token Payload
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "Admin",
  "type": "access",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### Refresh Token Payload
```json
{
  "sub": "user-id",
  "type": "refresh",
  "jti": "unique-token-id",
  "iat": 1234567890,
  "exp": 1235172690
}
```

- El refresh token **no** incluye `email` ni `role`: se consultan en BD al
  momento de emitir un nuevo access token, garantizando datos frescos.
- `jti` permite futura revocación de tokens (blacklist en BD).
- `type` distingue tokens: si un refresh token se usa como access, es rechazado
  por la estrategia access (valida `type === "access"`).

## Estrategias Passport

| Estrategia | Nombre | Cookie | Valida | Uso |
|---|---|---|---|---|
| `JwtAccessStrategy` | `"jwt"` | `nexo_access_token` | `type === "access"` | Todos los endpoints protegidos |
| `JwtRefreshStrategy` | `"jwt-refresh"` | `nexo_refresh_token` | `type === "refresh"` | Solo `POST /auth/refresh` |

## Archivos a Crear

| Archivo | Propósito |
|---------|-----------|
| `back/src/modules/identity/interface/http/guards/jwt-refresh.strategy.ts` | Passport refresh token strategy |
| `back/src/modules/identity/interface/http/guards/refresh-auth.guard.ts` | Guard para refresh endpoint |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `back/src/modules/identity/application/ports/session-token-signer.ts` | Añadir `signRefreshToken`, `verifyRefreshToken` |
| `back/src/modules/identity/application/ports/identity-provider.ts` | `AuthSession` incluye `refreshToken`, `refreshAccessToken` |
| `back/src/modules/identity/application/local-identity.provider.ts` | Emitir ambos tokens, implementar `refreshAccessToken` |
| `back/src/modules/identity/infrastructure/security/jwt-session-token-signer.ts` | Dos `JwtService`: access (15min) + refresh (7d), payload con `type` |
| `back/src/modules/identity/interface/http/guards/jwt-cookie.strategy.ts` | Renombrar a access strategy, validar `type === "access"` |
| `back/src/modules/identity/interface/http/auth.controller.ts` | Dos cookies en login, endpoint refresh, limpiar ambas en logout |
| `back/src/modules/identity/identity.module.ts` | Wire ambas estrategias, dos JwtServices |
| `back/.env` + `.env.example` | `ACCESS_TOKEN_TTL_SECONDS=900`, `REFRESH_TOKEN_TTL_SECONDS=604800` |
| `back/src/modules/identity/interface/http/auth.e2e-spec.ts` | Tests de refresh flow |

## Verificación

- `npx vitest run` todos los tests pasan
- `npx tsc --noEmit` compila limpio
- Login emite dos cookies
- Refresh genera nuevo access token
- Refresh token rechazado en endpoints protegidos
- Access token rechazado en refresh endpoint
- Logout limpia ambas cookies
