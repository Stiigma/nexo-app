# FR-AUTH-003: Permisos de Operator

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-AUTH-003 |
| **Título** | Permisos de Operator |
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

El rol `Operator` debe poder: crear carritos de compra, capturar prendas,
registrar apartados, registrar ventas y consultar inventario operativo. No debe
poder acceder a funciones administrativas.

## Racional

El operador es el usuario del día a día que captura compras y ventas. No debe
poder modificar catálogos, usuarios ni datos financieros sensibles.

## Criterio de Aceptación

- Dado que soy un operator,
  cuando accedo a las rutas de captura e inventario,
  entonces el acceso es permitido.

- Dado que soy un operator,
  cuando intento acceder a `/admin/*`,
  entonces el acceso es denegado.

- Dado que soy un operator,
  cuando intento usar el editor de prenda para modificar costos,
  entonces el sistema lo rechaza (FR-INV-010).

## Método de Verificación

- [ ] Demo: Operator usa flujos core sin acceso a admin.
- [ ] Prueba de seguridad: API rechaza operaciones admin desde token operator.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/identity/`
  - `domain/role-policy.ts` — políticas de operator
  - `interface/http/guards/permission.guard.ts`
  - `interface/http/decorators/require-permissions.decorator.ts`

### Frontend
- `front/src/routes.tsx` — rutas `/capture`, `/inventory` sin role restriction
- `front/src/features/inventory/` — vistas operativas
- `front/src/components/ItemEditorDialog.tsx` — editor con restricciones

## Notas

- Implementado.
- El editor de prenda (FR-INV-010) es la misma UI para ambos roles pero con
  campos protegidos para operator (FR-AUTH-004).
