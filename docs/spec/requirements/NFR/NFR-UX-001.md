# NFR-UX-001: Mobile-first para flujos core

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | NFR-UX-001 |
| **Título** | Mobile-first para flujos core |
| **Tipo** | NFR (Non-Functional Requirement) |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §9 — Mobile-first |
| **Dueño** | Nexo project |
| **Dependencias** | BR-005 (captura mobile-first) |

## Declaración

Los flujos de captura de compra, confirmación de pago, revisión de prendas,
reserva, venta y búsqueda por QR deben funcionar en un viewport mobile
(320px–428px de ancho).

## Racional

El negocio compra en tiendas físicas y la captura ocurre desde el celular.

## Criterio de Aceptación

- Dado que accedo desde un dispositivo móvil,
  cuando ejecuto los flujos core,
  entonces todos son funcionales sin scroll horizontal ni elementos rotos.

## Método de Verificación

- [ ] Revisión visual: emulador mobile para cada flujo core.
- [ ] Lighthouse audit: "navigation" mode en mobile.

## Artefactos de implementación

### Frontend
- Estilos globales: `front/src/index.css`
- Componentes responsive en `front/src/features/`
- Feature: `front/src/features/inventory/`
  - `components/InventoryCard.tsx` — tarjeta responsive
  - `views/InventoryPage.tsx` — vista adaptable
  - `components/ItemDetailModal.tsx` — modal responsive

## Notas

- P0: requerido para el MVP usable.
- Los flujos core son: purchase cart, capture items, confirm batch, review
  garments, reserve, sell, QR lookup.
