# FR-QR-002: QR resuelve a la prenda en el sistema

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-QR-002 |
| **Título** | QR resuelve a la prenda en el sistema |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | QR Labels |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §6 — Flujo: imprimir QR |
| **Dueño** | Nexo project |
| **Dependencias** | FR-QR-001 (generar QR) |
| **Stories vinculadas** | US-012 |

## Declaración

El código QR impreso, al ser escaneado, debe resolver a la prenda
correspondiente dentro del sistema (detalle de prenda o resultado de búsqueda).

## Racional

El QR permite a los operadores encontrar rápidamente una prenda en el sistema
escanéandola con el celular.

## Criterio de Aceptación

- Dado que escaneo un QR de una prenda,
  cuando el sistema lo resuelve,
  entonces me lleva al detalle de esa prenda o a un resultado de búsqueda
  que la muestra.

## Método de Verificación

- [ ] Demo: Escanear QR con cámara y ver detalle de prenda.

## Artefactos de implementación

### Backend
- Ruta pública o semipública que resuelve el QR (pendiente)

### Frontend
- Feature: `front/src/features/inventory/`
  - Ruta de búsqueda por QR (pendiente)
  - `views/InventoryPage.tsx` — posible landing del QR

## Open Questions

- OQ-006: ¿Usar URL directa al detalle, código interno como query param, o
  token firmado por seguridad?

## Notas

- P1: importante para la operación diaria pero no bloqueante.
- La resolución puede ser vía URL en el QR o vía búsqueda por código interno.
