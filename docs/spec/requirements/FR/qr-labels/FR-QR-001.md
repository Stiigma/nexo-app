# FR-QR-001: Generar etiquetas QR imprimibles

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-QR-001 |
| **Título** | Generar etiquetas QR imprimibles |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | QR Labels |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §6 — Flujo: imprimir QR |
| **Dueño** | Nexo project |
| **Dependencias** | FR-INV-001 (código interno) |
| **Stories vinculadas** | US-012 |

## Declaración

El sistema debe generar una hoja imprimible (desde navegador) con códigos QR y
códigos internos para las prendas seleccionadas.

## Racional

Las etiquetas QR permiten vincular la prenda física con su registro en el
sistema para búsqueda rápida y control de inventario.

## Criterio de Aceptación

- Dado que selecciono una o más prendas,
  cuando genero las etiquetas,
  entonces la página imprimible muestra el código interno y el QR de cada prenda.

## Método de Verificación

- [ ] Demo: Página imprimible con QR visible.
- [ ] Prueba de integración: endpoint genera datos de QR.

## Artefactos de implementación

### Backend
- Módulo de QR (pendiente de implementar)
  - API que genera datos para QR (código interno o URL firmada)

### Frontend
- Página imprimible (pendiente)

### Prisma
- Modelo `Item` (campo `internalCode`)

## Open Questions

- OQ-006: ¿Qué payload debe tener el QR? ¿URL, código interno o token firmado?

## Notas

- P1: valioso para la operación física pero no bloqueante para el MVP.
- FR-QR-002 define cómo se resuelve el QR.
