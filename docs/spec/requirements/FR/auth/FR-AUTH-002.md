# FR-AUTH-002: Permisos de Admin

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-AUTH-002 |
| **Título** | Permisos de Admin |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Auth |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Implemented |
| **Fuente** | `NEXO_PROJECT.md` §8 — Roles y permisos |
| **Dueño** | Nexo project |
| **Dependencias** | FR-AUTH-001 (roles) |
| **Stories vinculadas** | US-011 |

## Declaración

El rol `Admin` debe tener acceso a: gestión de catálogos, gestión de usuarios,
reportes, correcciones administrativas y todo el inventario.

## Racional

El admin es el dueño del negocio o la persona de confianza que necesita control
total del sistema.

## Criterio de Aceptación

- Dado que soy un admin,
  cuando accedo a la sección de catálogos,
  entonces puedo crear, editar y desactivar cualquier catálogo.

- Dado que soy un admin,
  cuando accedo a la sección de usuarios,
  entonces puedo crear, editar y desactivar usuarios.

- Dado que soy un admin,
  cuando accedo a reportes,
  entonces puedo ver todos los reportes.

- Dado que soy un admin,
  cuando accedo a correcciones,
  entonces puedo corregir datos operativos.

## Método de Verificación

- [ ] Demo: Admin accede a todas las secciones.
- [ ] Prueba de integración: endpoints admin permitidos para rol Admin.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/identity/`
  - `domain/role-policy.ts` — políticas de admin
  - `interface/http/guards/permission.guard.ts` — guard
  - `interface/http/decorators/require-permissions.decorator.ts`
  - `interface/http/guards/session-auth.guard.ts` — guard de sesión

### Frontend
- Feature: `front/src/features/admin/`
  - `views/UsersPage.tsx` — gestión de usuarios
  - Rutas protegidas con `AuthGuard roles={["Admin"]}`
- `front/src/routes.tsx` — `AdminLayout` envuelve rutas admin

## Notas

- Implementado: rutas `/admin/*` protegidas con guard de admin.
- FR-AUTH-003 define los permisos restringidos para Operator.
