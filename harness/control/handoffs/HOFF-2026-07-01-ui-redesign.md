# HOFF-2026-07-01-ui-redesign

## Metadata

- Task ID: NEXO-0002
- Date: 2026-07-01
- Authoring agent: nexo-design
- Receiving agent: nexo-build
- Status: ready for build

## Objective

Implementar el rediseño UX/UI de `prototypes/purchase-capture-demo/` descrito en
`docs/design/nexo-ui-redesign-proposal.md`: un sistema de UI sólido, no
genérico, con identidad de marca Nexo, navegación por sidebar, separación de
entidades por pantalla, revelación progresiva y componentes accesibles
editables basados en `shadcn/ui`. No cambia el modelo de dominio ni la lógica de
negocio existente.

## Context

El prototipo v4 (Batch+Multi-Payment) funciona pero visualmente se percibe
"AI-genérico": glassmorphism sobre negro, todo aparece a la vez en una sola
columna, sin navegación real, azul saturado por todas partes, logo exprimido,
mezcla inglés/español. El usuario pidió: que no se vea genérica, que vaya acorde
al tema (ropa reventa), que ayude a la experiencia (colores, sidebar, logo),
una librería de componentes bonitos/editables con Tailwind, componentes más
"rellenos"/sólidos, separación de entidades, objetividad de pantallas y menos
sobrecarga visual.

La propuesta detalla diagnóstico (10 causas D1–D10), principios, librería
(`shadcn/ui`), tokens de color (chrome oscuro + canvas claro), tipografía,
tratamiento de logo, layout (sidebar+topbar+canvas responsive), rediseño
pantalla por pantalla (S1–S7), inventario de componentes, estados, accesibilidad
y un plan de implementación en 3 fases.

## Source Docs

- `docs/design/nexo-ui-redesign-proposal.md` (especificación principal, canonical)
- `NEXO_PROJECT.md`
- `CONTEXT.md` (lenguaje de dominio; no cambiar)
- `docs/brand/README.md`, `docs/brand/nexo-logo.png`
- `docs/design/purchase-capture-demo-brief.md`
- `docs/adr/ADR-2026-07-01-disposable-prototype-stack.md`
- `docs/adr/ADR-2026-07-01-purchase-batch-multi-payment.md`

## Files To Create Or Modify

- `prototypes/purchase-capture-demo/src/styles.css` (MOD: token system shadcn)
- `prototypes/purchase-capture-demo/src/lib/utils.ts` (NEW: `cn`)
- `prototypes/purchase-capture-demo/components.json` (NEW: shadcn config)
- `prototypes/purchase-capture-demo/public/nexo-mark.svg` (NEW: mark derivado)
- `prototypes/purchase-capture-demo/src/components/ui/*` (NEW: shadcn components)
- `prototypes/purchase-capture-demo/src/components/nexo/*` (NEW: compuestos Nexo)
- `prototypes/purchase-capture-demo/src/components/ui.tsx` (DEL al final de Fase 2)
- `prototypes/purchase-capture-demo/src/App.tsx` (MOD: NexoAppShell)
- `prototypes/purchase-capture-demo/src/components/BatchList.tsx` (MOD: S1)
- `prototypes/purchase-capture-demo/src/components/NewCartFlow.tsx` (MOD: S2)
- `prototypes/purchase-capture-demo/src/components/CartCapture.tsx` (MOD: S3)
- `prototypes/purchase-capture-demo/src/components/CartItemForm.tsx` (MOD: S4)
- `prototypes/purchase-capture-demo/src/components/PaymentConfirmForm.tsx` (MOD: S5)
- `prototypes/purchase-capture-demo/src/components/BatchDetail.tsx` (MOD: S6)
- `prototypes/purchase-capture-demo/src/components/AcquiredStockList.tsx` (MOD: S7)
- `prototypes/purchase-capture-demo/src/components/format.ts` (MOD: mantener, envolver en `<Money>`)
- `prototypes/purchase-capture-demo/package.json` (MOD: deps)

## Implementation Steps

Seguir las 3 fases de `docs/design/nexo-ui-redesign-proposal.md` §13.1:

1. **Fase 0 — Fundaciones:** `shadcn init` (estilo new-york, primary=azul Nexo,
   CSS vars); token system (§4.2) en `styles.css`; añadir componentes shadcn
   (§3.3); `src/lib/utils.ts` (`cn`); `src/components/nexo/*` (§8.2); derivar
   `nexo-mark.svg`. Verificar `build` + `test`.
2. **Fase 1 — App shell:** `NexoAppShell` + `NexoSidebar` (nav completa, secciones
   futuras con Badge "próximamente") + `Topbar` (breadcrumb + command placeholder
   + offline badge) + `Toaster`. Responsive Sheet/rail/expandido. Migrar
   `App.tsx` manteniendo rutas.
3. **Fase 2 — Migrar pantallas S1–S7** (una a una, sin tocar `state/`, `data/`,
   `domain/`). Reemplazar `StatusPill`→`StatusBadge`, `formatMoney`→`<Money>`,
   `window.confirm`→`AlertDialog`. Eliminar `ui.tsx`.
4. **Fase 3 — Estados/accesibilidad:** `EmptyState` con guía, `Skeleton`,
   `Spinner` en botones, `Forbidden`, auditoría accesibilidad (§10).

## Verification

- `npm run test` pasa (41 tests actuales; no se cambia lógica).
- `npm run build` limpio.
- Vite dev server retorna HTTP 200.
- Revisión visual móvil con el checklist del design harness
  (`/home/otomi/Downloads/Backup/Harness/diseno-harness/core/rubrics/mobile-ui-checklist.md`).
- Criterios de aceptación de diseño (propuesta §14) cumplidos.
- Verificar que el logo se ve sobre placa oscura a tamaño legible en móvil y
  escritorio; que el mark funciona en el rail colapsado.

## Risks

- El prototype disposable gana complejidad de UI. Mitigación: secciones futuras
  del sidebar sólo se marcan, no se implementan.
- Migrar pantallas puede romper tests. Mitigación: sólo presentación; no tocar
  `state/`, `data/`, `domain/`.
- Compatibilidad shadcn + Tailwind v4. Mitigación: seguir guía oficial shadcn
  para Tailwind v4 (`@theme`/CSS vars).
- Logo sobre claro se ve mal. Mitigación: logo siempre sobre placa `--chrome`.

## Acceptance Criteria

- La app no se ve AI-genérica (superficies sólidas, sin glassmorphism, sin
  eyebrows mayúsculas, azul reservado).
- `NexoAppShell` con sidebar responsive (expandido/rail/sheet) + topbar.
- Logo Nexo sobre placa oscura, legible; existe `nexo-mark.svg`.
- Cada pantalla tiene un propósito y una acción primaria.
- S3 Cart separa regiones y usa menús para acciones secundarias.
- S6/S7 separan entidades con Tabs/Data-Table.
- `StatusBadge` con icono+texto (no sólo color).
- Vacíos orientan al siguiente paso.
- Confirmaciones destructivas con `AlertDialog`.
- Copys en español coherentes (propuesta §12).
- Contraste AA, focus visible, teclado, `prefers-reduced-motion`.
- `build` y `test` pasan.

## Required Gates

- QA review: sí (verificación visual/accesibilidad por `nexo-qa`).
- Security review: no aplica (sólo presentación del prototype disposable local).
- User confirmation: no requiere commit/push/deploy (es trabajo local); confirmar
  con el usuario antes de cualquier commit o cambio de entorno.
