# Brief de Diseño UX/UI: Purchase Capture Demo

## 1. Información general

- Producto: Nexo.
- Proyecto: disposable purchase-capture prototype.
- Plataforma: mobile-first web/PWA-style prototype.
- Tipo de interfaz: internal operations workflow.
- Nombre del flujo: purchase cart to acquired stock.
- Versión del brief: 0.1.
- Fecha: 2026-07-01.

## 2. Contexto del producto

Nexo is an internal operations system for a clothing resale business. This demo
focuses on capturing garments during a USA store purchase, confirming payment,
and seeing which garments entered inventory as `Acquired Stock`.

The flow starts before payment with a `Purchase Cart` and ends after payment
with a `Purchase Batch` and garment records.

## 3. Usuario principal

- Tipo de usuario: internal operator.
- Nivel de experiencia: familiar with buying clothing, not necessarily with the
  software.
- Necesidad principal: capture garments quickly on a phone while in-store.
- Dolor o problema actual: manual capture can lose traceability, cost details,
  or which garments actually entered inventory.
- Restricciones del usuario: mobile use, partial attention, fast decisions,
  possible interruptions, and need for quick visual confirmation.

## 4. Objetivo del usuario

The operator needs to capture purchase items before payment and confirm which
ones became acquired stock so Nexo knows exactly what entered inventory.

## 5. Objetivo del producto

- Demonstrate the inventory-first model.
- Show clear separation between pre-payment cart items and post-payment
  garments.
- Reduce ambiguity around expected total, paid total, and category review.
- Validate whether the first operational flow feels practical on a phone.

## 6. Problema UX a resolver

The interface must let the operator move fast without hiding critical business
state:

- A cart item is not inventory yet.
- A confirmed garment has an internal code.
- A paid garment starts as `Acquired Stock`.
- Category review or missing minimum garment file blocks availability.
- A total mismatch requires a difference reason.

## 7. Acción principal esperada

- Acción principal: confirm purchase payment.
- Resultado esperado: cart items become garments in acquired stock.
- Condición para permitirla: cart has at least one item, purchase evidence is
  present, and any paid-total mismatch has a difference reason.
- Qué debe pasar después: show purchase batch summary and acquired-stock list.

## 8. Acciones secundarias

| Acción secundaria | Propósito | Debe estar visible siempre |
|---|---|---|
| Add cart item | Capture another garment before payment. | Yes, while cart is active. |
| Remove cart item | Exclude a garment before payment. | No. |
| Edit item cost/category | Correct capture mistakes. | No. |
| Reset demo data | Restart prototype during meeting. | No. |
| View acquired stock | Review post-confirmation inventory. | Yes, after confirmation. |

## 9. Información que debe mostrarse

| Información | Prioridad | Obligatoria | Comentario |
|---|---:|---|---|
| Current flow step | 1 | Yes | User must know if they are before or after payment. |
| Store, date, currency | 1 | Yes | Purchase context. |
| Exchange rate and tax rate | 1 | Yes | Needed for displayed totals. |
| Cart item count | 1 | Yes | Quick progress indicator. |
| Expected cart total | 1 | Yes | Key pre-payment value. |
| Paid total | 1 | Yes | Key confirmation value. |
| Difference reason | 1 | Conditional | Required when totals differ. |
| Capture ID | 2 | Yes | Pre-payment item identity. |
| Internal code | 1 | After confirmation | Post-payment garment identity. |
| Inventory state | 1 | After confirmation | Shows `Acquired Stock`. |
| Category review status | 2 | Yes | Explains why item is blocked. |

## 10. Datos de entrada

| Dato | Tipo | Obligatorio | Validación esperada |
|---|---|---|---|
| Store | Selección única | Yes | Must select a seeded store. |
| Date | Fecha | Yes | Defaults to today. |
| Currency | Selección única | Yes | USD or MXN; demo defaults to USD. |
| Tax rate | Número | Yes | Non-negative percentage. |
| Exchange rate | Número | Conditional | Required for USD. |
| Main photo placeholder | Imagen/selección | Yes | Demo can use placeholder swatches/cards. |
| Purchase cost | Número | Yes | Greater than zero. |
| Category | Selección única | No | Missing value sets category review. |
| Paid total | Número | Yes | Greater than zero. |
| Purchase evidence | Archivo/texto placeholder | Yes | Demo placeholder is acceptable. |
| Difference reason | Selección única | Conditional | Required when paid total differs. |

## 11. Estados necesarios

- [x] Estado cargando.
- [x] Estado vacío.
- [x] Estado con datos.
- [x] Estado de error.
- [x] Estado de éxito.
- [x] Estado sin conexión.
- [ ] Estado sin permisos.
- [x] Estado de validación.
- [x] Estado bloqueado.
- [x] Estado de confirmación.

## 12. Reglas o restricciones

- Prototype is disposable and local.
- Use React, SQLite WASM, and Zustand.
- Use Nexo logo from `docs/brand/nexo-logo.png`.
- Keep SQLite behind a data-access boundary.
- Use Zustand for workflow state, form drafts, selected IDs, and demo controls.
- Do not implement production auth, backend, object storage, deployment, real
  exchange-rate calls, QR, reservations, sales, or reports.
- Do not silently resolve the final rounding policy.

## 13. Contenido o textos conocidos

- Header brand: Nexo.
- Primary action before payment: `Confirm payment`.
- Add item action: `Add garment`.
- Success message: `Purchase batch confirmed. Garments are now acquired stock.`
- Blocked message: `Complete the minimum garment file before making this
  garment available.`
- Difference reason prompt: `Select why the paid total differs from expected.`

## 14. Estilo visual deseado

- Tono visual: operational, fast, confident, mobile-first.
- Personalidad: precise, modern, focused, not playful.
- Marca: black base, white logo, electric-blue accent.
- Densidad: compact but not crowded.
- Evitar: marketing landing page, oversized hero, decorative gradients, nested
  cards, low-contrast text, and icon-only critical actions.

## 15. Criterios de aceptación de diseño

- The user can understand the current step without explanation.
- The primary action is clear and reachable on mobile.
- Pre-payment `Purchase Cart Item` and post-payment `Garment` are visually
  distinct.
- Validation explains what is missing and how to recover.
- Acquired-stock blocking is visible without relying only on color.
- The logo is legible and does not dominate the workflow.
- The UI can be evaluated with the external mobile checklist before build
  closeout.
