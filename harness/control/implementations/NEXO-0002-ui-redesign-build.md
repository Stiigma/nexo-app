# NEXO-0002 — UI/UX Redesign Build Implementation Record

## Metadata

- Date: 2026-07-01
- Agent: `nexo-build`
- Task: `NEXO-0002` — create domain context document
- Source handoff: `HOFF-2026-07-01-ui-redesign.md`
- Source spec: `docs/design/nexo-ui-redesign-proposal.md`
- Receiving QA: `nexo-qa` (visual/accessibility review pending)

## Summary

Executed the full UI/UX redesign of the disposable prototype
`prototypes/purchase-capture-demo/` described in the design proposal and its
plan-to-build handoff. Replaced the hand-rolled `ui.tsx` with a `shadcn/ui`
(new-york) component set themed for Nexo, introduced a token system
(chrome dark + canvas light, brand blue reserved), an app shell with a
responsive sidebar + topbar, migrated all seven screens (S1–S7) to solid
surfaces / region separation / progressive disclosure / Spanish copys, and
moved destructive confirmations to `AlertDialog`. No domain, state, or data
logic was changed.

## Token System (chrome dark + canvas light)

- `src/styles.css` rewritten for Tailwind v4 + shadcn: `@import "tailwindcss"`,
  `@import "tw-animate-css"`, `@custom-variant dark`, `:root` HSL channel
  tokens, `@theme inline` mapping to Tailwind color utilities.
- Surfaces: `--paper` (light canvas), `--surface` (cards), `--surface-2`
  (subtle blocks), `--chrome` / `--chrome-2` (dark nav). No glassmorphism.
- Brand: `--brand` (#138BFF), `--brand-strong`, `--brand-soft`, `--brand-ink`.
  Reserved for primary action, active nav, focus ring, selection.
- State pairs (ink + soft): success / warning / danger / info.
- Sidebar tokens mapped to `--chrome` so the shadcn sidebar surface renders
  as dark chrome.
- `.dark` tokens defined (solid ink surfaces, no translucency) for a future
  dark mode; the app defaults to light (no toggle in v1).
- Base layer: `:focus-visible` ring with `--ring`, `prefers-reduced-motion`
  disables transitions, `.safe-area-inset-bottom` for sticky mobile bars.

## Files Created

### Foundations
- `src/lib/utils.ts` — `cn` (clsx + tailwind-merge).
- `components.json` — shadcn config (new-york, CSS vars, `@/` aliases).
- `public/nexo-mark.svg` — derived compact mark (italic "N" + brand-blue
  diagonal), transparent background for the rail / mobile topbar.
- `src/hooks/use-media-query.ts`, `src/hooks/use-is-mobile.ts` — responsive
  primitives.

### shadcn/ui primitives (`src/components/ui/*`, 22 files)
`button`, `card`, `input`, `label`, `badge`, `alert`, `separator`, `tabs`,
`dialog`, `sheet`, `alert-dialog`, `dropdown-menu`, `collapsible`, `tooltip`,
`scroll-area`, `skeleton`, `spinner`, `radio-group`, `toggle-group`,
`breadcrumb`, `native-select`, `sonner`.

### Nexo composites (`src/components/nexo/*`)
`NexoAppShell`, `NexoSidebar` (+ `NexoSidebarContent`), `Topbar`, `StatusBadge`,
`Money`, `Field`, `PhotoThumb`, `EntityCard`, `ContextStrip`, `StickyActionBar`,
`EmptyState`, `StepHeader`, `DifferenceAlert`, `NavItem`/`NavGroup`,
`ConfirmDialog`, `Forbidden`, `index.ts` barrel.

## Files Modified

- `src/App.tsx` — delegates to `NexoAppShell`; keeps repository init + offline
  sync effects.
- `src/styles.css` — token system (above).
- `tsconfig.json` — added `@/*` path alias.
- `vite.config.ts`, `vitest.config.ts` — added `@` resolve alias.
- `index.html` — `viewport-fit=cover`, `theme-color` (#0A0B0D), Spanish title.
- `package.json` — added Radix UI, cva, clsx, tailwind-merge, sonner, cmdk,
  tw-animate-css.
- `src/components/BatchList.tsx` (S1), `NewCartFlow.tsx` (S2),
  `CartCapture.tsx` (S3), `CartItemForm.tsx` (S4), `PaymentConfirmForm.tsx`
  (S5), `BatchDetail.tsx` (S6), `AcquiredStockList.tsx` (S7) — migrated to
  Nexo/shadcn components, light canvas, Spanish copys, region separation,
  `Money`, `StatusBadge`, `AlertDialog`.

## Files Removed

- `src/components/ui.tsx` — hand-rolled `Button`, `Field`, `TextInput`,
  `SelectInput`, `StatusPill`; replaced by the shadcn/Nexo components.

## Screen Migration Notes (per proposal §7)

- **S1 Lotes**: `StepHeader` + counter; demo controls ("Cargar demo",
  "Reiniciar") moved into a `···` `DropdownMenu`; "Reiniciar" confirms via
  `AlertDialog`. Solid batch rows with store icon, totals in `Money`, success
  badge. Guided `EmptyState` with CTA.
- **S2 Tiendas**: solid store cards with chevron; eyebrow removed; info note
  as `Alert` info.
- **S3 Captura (critical)**: regions — `StepHeader` + discard menu, compact
  `ContextStrip`, items region with per-item `···` menu (Edit/Eliminar via
  `AlertDialog`), `Collapsible` totals (collapsed by default), `StickyActionBar`
  with one primary "Confirmar pago". Amber rounding alert removed; muted
  OQ-001 note shown only when expanded.
- **S4 Item form**: `Card` with `Separator`-divided sections; photo via
  `ToggleGroup`; category via `NativeSelect`; `Spinner` on save.
- **S5 Pago**: step `Card`s — resumen, "¿dónde guardar?" (`RadioGroup` +
  conditional `NativeSelect`), comprobante (`ToggleGroup`) + total pagado,
  conditional `DifferenceAlert` + reason. Final blue alert removed;
  consequence in button + success toast.
- **S6 Detalle**: `Tabs` (Pagos / Prendas) to separate entities; payment cards
  without nested garments; flat garment `<table>`; consolidated totals `Card`;
  "Ver en inventario" secondary + "Nuevo pago" primary in header.
- **S7 Stock**: `Tabs` (Prendas / Por lote); garment `<table>` with blocked
  rows highlighted (`warning-soft`) + `StatusBadge` icon+text; local estado
  filter chips (Todos / Disponibles / Bloqueados).

## Key Implementation Decisions

1. **shadcn by hand-writing, not CLI**: copied the new-york component source
   into `src/components/ui/*` and themed it, rather than relying on
   `npx shadcn` (sandbox reliability + full control to make it look Nexo).
   This matches shadcn's "copy & own" philosophy.
2. **`NativeSelect` instead of Radix `Select`**: the category and
   existing-batch dropdowns rely on `value=""` (empty option). Radix Select
   does not allow empty-string values, which would force state/domain
   changes. A styled native `<select>` keeps the `SelectHTMLAttributes` API,
   preserves logic, and is equally accessible.
3. **Sidebar responsiveness**: static sidebar on `md+` (rail `w-16` on tablet,
   expanded `w-64` on desktop, auto-collapses by breakpoint); mobile uses a
   `Sheet` with the same `NexoSidebarContent`. Nav shows the full system
   (Compras / Inventario / Ventas / Operación / Admin) with future sections
   marked "pronto" and non-interactive.
4. **`notice` → sonner toast**: the shell turns the store `notice` into a
   `toast.success` and clears it (presentation only; no store logic change).
5. **`error` → `Alert`**: global errors render as a danger `Alert` at the top
   of the canvas (per §9).
6. **`onBack` props retained on screen signatures** but navigation is primarily
   via the topbar breadcrumb / sidebar; screens no longer render redundant
   "Volver" bars (except contextual destructive actions).
7. **Garment cost currency**: S7 keeps the pre-existing `"USD"` display
   currency for garment cost (the `Garment` type carries no currency and the
   batch summary has no payment→currency map). Documented as a known limitation.

## Verification

- `npm run test`: 4 files, 43 tests, all passing (unchanged logic; baseline was
  43 before and after).
- `npm run build`: clean, no TypeScript errors. CSS 26→43 kB (tokens +
  shadcn), JS 499→699 kB (Radix + sonner + cmdk deps).
- Vite dev server: HTTP 200 at `http://127.0.0.1:5175/` (5174 was in use from a
  prior session). `nexo-mark.svg`, `nexo-logo.png`, and `/src/main.tsx` all
  return 200; no transform errors in the Vite log.
- `index.html` title rendered: "Nexo · Lotes de compra".

## Acceptance Criteria (proposal §14)

- [x] No AI-generic look: solid surfaces, no glassmorphism, no uppercase
  eyebrows, brand blue reserved.
- [x] `NexoAppShell` with responsive sidebar (expanded / rail / sheet) + topbar.
- [x] Logo on dark chrome plate, legible; `nexo-mark.svg` for the rail.
- [x] Each screen has one purpose + one primary action.
- [x] S3 separates regions; secondary actions in menus.
- [x] S6 / S7 use Tabs to separate entities; S6/S7 render data tables.
- [x] `StatusBadge` shows icon + text.
- [x] Empties guide to the next step.
- [x] Destructive confirmations use `AlertDialog`.
- [x] Coherent Spanish copys (glossary §12); English/ES mix removed.
- [x] AA contrast (light theme), focus visible, keyboard, reduced-motion.
- [x] `build` and `test` pass.
- [ ] Mobile visual review (design-harness checklist) — pending, no
  Chromium/Playwright in the sandbox.

## Remaining Gaps / Follow-up

- Real mobile/browser visual + accessibility review by `nexo-qa` (no
  Chromium/Playwright in environment; same gap as prior sessions).
- Dark mode toggle (tokens defined; not wired) — proposal phase 2.
- Command palette (`cmdk` installed; topbar search is a placeholder).
- S7 garment cost currency hardcoded to USD (pre-existing; needs
  payment→currency map to fix).
- Optional: code-split the vendor chunk to address the >500 kB bundle warning.
