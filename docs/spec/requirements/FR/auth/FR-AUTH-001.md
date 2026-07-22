# FR-AUTH-001: Roles Admin y Operator

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-AUTH-001 |
| **Título** | Roles Admin y Operator |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Auth |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Implemented |
| **Fuente** | `NEXO_PROJECT.md` §8 — Roles y permisos |
| **Dueño** | Nexo project |
| **Dependencias** | Ninguna |
| **Stories vinculadas** | US-011 |

## Declaración

El sistema debe soportar dos roles de usuario: `Admin` y `Operator`. Cada
usuario tiene uno de los dos roles.

## Racional

Separar roles es la base del control de acceso. Los admins necesitan acceso a
todo; los operadores solo a las funciones operativas diarias.

## Criterio de Aceptación

- Dado que creo un usuario,
  cuando lo registro,
  entonces debo asignarle un rol (`Admin` o `Operator`).

- Dado que un usuario tiene rol `Operator`,
  cuando intenta acceder a funciones de admin,
  entonces el sistema lo rechaza.

## Método de Verificación

- [ ] Prueba de integración: creación de usuario con rol.
- [ ] Prueba de seguridad: endpoint admin rechaza a operator.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/identity/`
  - `domain/user-role.ts` — enum de roles
  - `domain/user.ts` — entidad User con rol
  - `domain/permission.ts` — definición de permisos
  - `domain/role-policy.ts` — políticas por rol
  - `domain/role-policy.spec.ts` — pruebas de políticas
  - `interface/http/users.controller.ts` — CRUD de usuarios
  - `interface/http/dto/create-user.dto.ts` — DTO con rol
  - `interface/http/guards/permission.guard.ts` — guard de permisos
  - `interface/http/decorators/require-permissions.decorator.ts` — decorador

### Frontend
- Feature: `front/src/features/auth/`
  - `hooks/use-session.ts` — sesión actual con rol
  - `store/auth-store.ts` — store de autenticación
  - `services/auth-service.ts` — llamadas API
- Feature: `front/src/features/admin/`
  - `views/UsersPage.tsx` — gestión de usuarios
  - `components/UserFormDialog.tsx` — formulario con selector de rol

### Prisma
- Modelo `User` (campo `role`) en `back/prisma/schema.prisma`

## Notas

- Implementado (backend + frontend).
- FR-AUTH-002 y FR-AUTH-003 detallan permisos específicos.
