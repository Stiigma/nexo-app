# FR-INV-010: Editor seguro de prenda

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-INV-010 |
| **Título** | Editor seguro de prenda |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Inventory |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Implemented |
| **Fuente** | `NEXO_PROJECT.md` §4 — Prenda (campos editables) |
| **Dueño** | Nexo project |
| **Dependencias** | FR-AUTH-004 (restricciones por rol), FR-INV-003 (archivo mínimo) |
| **Stories vinculadas** | US-023 |

## Declaración

El sistema debe proveer un editor de prenda que permita a operadores y admins
actualizar nombre, marca, categoría, condición, talla, color, ubicación física,
precio público y notas, pero que **no** exponga ni modifique código interno,
vinculación de compra, estado físico, costo ni precio mínimo.

## Racional

El editor es la herramienta diaria del operador para preparar prendas para la
venta. Separar la edición comercial de los datos financieros y de trazabilidad
evita errores operativos y mantiene la integridad del inventario.

## Criterio de Aceptación

- Dado que soy operador o admin,
  cuando abro el editor de una prenda,
  entonces puedo editar: nombre comercial, marca, categoría, condición, talla,
  color, ubicación física, precio público y notas.

- Dado que soy operador,
  cuando uso el editor,
  entonces NO puedo modificar: código interno, lote de compra, estado físico,
  costo de compra, costo total, ni precio mínimo.

- Dado que soy admin,
  cuando uso el editor,
  entonces tengo las mismas capacidades que el operador (las correcciones
  financieras profundas están fuera de este editor).

## Método de Verificación

- [ ] Prueba de integración: endpoint de editor rechaza campos protegidos.
- [ ] Prueba de seguridad: operador no puede enviar campos financieros.
- [ ] Demo: UI del editor muestra solo campos permitidos según rol.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/inventory/`
  - `interface/http/items.controller.ts` — endpoint PATCH /items/:id/edit
  - `interface/http/dto/edit-item.dto.ts` — DTO con campos permitidos
  - `application/item.service.ts` — lógica de actualización segura
  - `application/__tests__/item.service-editor.spec.ts` — pruebas del editor

### Frontend
- Feature: `front/src/features/inventory/`
  - `components/ItemEditorDialog.tsx` — diálogo del editor
  - `hooks/use-item-editor-update.ts` — hook de actualización
  - `types/item.ts` — tipos del dominio

### Prisma
- Modelo `Item` (campos editables: `productName`, `brandId`, `categoryId`, etc.)

## Notas

- Ya implementado (US-023), con QA pendiente de verificación autenticada.
- Relacionado con FR-INV-011 (checklist de preparación).
- FR-AUTH-004 garantiza que el editor sea seguro por rol.
