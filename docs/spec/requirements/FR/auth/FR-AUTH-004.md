# FR-AUTH-004: Editor seguro no expone datos financieros

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-AUTH-004 |
| **Título** | Editor seguro no expone datos financieros |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Auth |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Implemented |
| **Fuente** | `NEXO_PROJECT.md` §8 — Roles y permisos |
| **Dueño** | Nexo project |
| **Dependencias** | FR-INV-010 (editor de prenda), FR-AUTH-001 (roles) |
| **Stories vinculadas** | US-023 |

## Declaración

El editor de prenda debe ser seguro por diseño: un admin puede usar el mismo
editor que un operator, y el editor no debe exponer ni permitir modificar
código interno, vinculación de compra, estado físico, costo ni precio mínimo
para ningún rol.

## Racional

El editor es la herramienta de preparación comercial. Separar la edición
comercial de los datos financieros previene errores operativos accidentales y
asegura que las correcciones financieras profundas pasen por un flujo
administrativo separado.

## Criterio de Aceptación

- Dado que soy admin u operator,
  cuando abro el editor de prenda,
  entonces NO veo campos para modificar: código interno, lote de compra, estado
  físico, costo de compra, costo total, ni precio mínimo.

- Dado que intento enviar datos financieros a través del endpoint del editor,
  cuando el backend procesa la solicitud,
  entonces los campos protegidos son ignorados o rechazados.

## Método de Verificación

- [ ] Prueba de integración: PATCH /items/:id/edit ignora campos protegidos.
- [ ] Prueba de seguridad: intento de modificar costo desde el editor es rechazado.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `interface/http/dto/edit-item.dto.ts` — DTO solo con campos editables
  - `interface/http/items.controller.ts` — endpoint PATCH con validación
  - `application/__tests__/item.service-editor.spec.ts` — pruebas del editor

### Frontend
- Feature: `front/src/features/inventory/`
  - `components/ItemEditorDialog.tsx` — editor sin campos financieros
  - `types/item.ts` — tipo EditItemDto sin campos protegidos

## Notas

- Implementado (US-023 con QA pendiente).
- FR-INV-010 define los campos que el editor SÍ permite.
