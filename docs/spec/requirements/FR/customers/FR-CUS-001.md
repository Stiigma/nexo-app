# FR-CUS-001: Crear cliente con nombre requerido

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-CUS-001 |
| **Título** | Crear cliente con nombre requerido |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Customers |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §4 — Cliente |
| **Dueño** | Nexo project |
| **Dependencias** | Ninguna |
| **Stories vinculadas** | US-004 |

## Declaración

El sistema debe permitir crear registros de cliente con nombre como único campo
requerido, y campos opcionales de contacto.

## Racional

Se necesita asociar ventas y reservas a clientes. El nombre es suficiente para
iniciar; los datos de contacto se pueden agregar después.

## Criterio de Aceptación

- Dado que creo un cliente,
  cuando ingreso al menos un nombre,
  entonces el cliente se guarda exitosamente.

- Dado que intento crear un cliente sin nombre,
  cuando envío el formulario,
  entonces el sistema rechaza la creación.

## Método de Verificación

- [ ] Prueba de integración: POST /api/v1/customers con solo nombre.
- [ ] Prueba de integración: POST /api/v1/customers sin nombre es rechazado.

## Artefactos de implementación

### Backend
- Módulo de Customers (pendiente de implementar)
  - API `/api/v1/customers`

### Frontend
- UI de clientes (pendiente)

### Prisma
- Modelo `Customer` (pendiente de crear)

## Notas

- Módulo de clientes no implementado en backend ni frontend.
- Feature chain (plan maestro): parte de F7 — `NEXO-0013`.
