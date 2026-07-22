# NFR-SEC-002: Validación de roles server-side

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | NFR-SEC-002 |
| **Título** | Validación de roles server-side |
| **Tipo** | NFR (Non-Functional Requirement) |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Implemented |
| **Fuente** | `NEXO_PROJECT.md` §8 — Roles y permisos |
| **Dueño** | Nexo project |
| **Dependencias** | FR-AUTH-001 (roles) |

## Declaración

Toda verificación de permisos debe realizarse en el backend. El frontend puede
ocultar elementos por rol, pero el backend es la autoridad final.

## Racional

La seguridad no puede depender del frontend. Un atacante puede modificar el
código del cliente y acceder a endpoints restringidos.

## Criterio de Aceptación

- Dado que un usuario operator envía una petición a un endpoint admin,
  cuando el backend procesa la solicitud,
  entonces devuelve 403 Forbidden.

- Dado que un usuario admin envía la misma petición,
  cuando el backend procesa,
  entonces la operación se completa exitosamente.

## Método de Verificación

- [ ] Prueba de seguridad: operador recibe 403 en endpoints admin.
- [ ] Prueba de seguridad: admin recibe 200 en los mismos endpoints.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/identity/`
  - `interface/http/guards/permission.guard.ts` — guard de permisos
  - `interface/http/guards/session-auth.guard.ts` — guard de sesión
  - `interface/http/guards/refresh-auth.guard.ts` — guard de refresh token
  - `interface/http/decorators/require-permissions.decorator.ts`
  - `interface/http/decorators/current-user.decorator.ts`
- Módulo NestJS: `back/src/modules/inventory/`
  - `interface/http/__tests__/items.controller-security.spec.ts` — pruebas de seguridad

### Frontend
- `front/src/routes.tsx` — `AuthGuard` con roles
- `front/src/features/auth/store/auth-store.ts` — store de sesión

## Notas

- Implementado.
- Las guards de NestJS se aplican a nivel de controlador o ruta.
