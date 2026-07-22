# HOFF-2026-07-07 — Frontend: Tailwind + shadcn/ui + Inventory View

## Metadata

- **Task ID:** NEXO-0008 / NEXO-0026
- **Date:** 2026-07-07
- **Authoring agent:** nexo-plan
- **Receiving agent:** nexo-build
- **Status:** ready
- **Design spec:** `docs/design/inventory-design-spec.md`

## Objective

Migrar el frontend de CSS vanilla a **Tailwind CSS v4 + shadcn/ui + Framer Motion**
y construir la vista completa de inventario con: hero dashboard, card grid animado,
filtros, detalle modal, y los 17 artículos con fotos de Azure.

## Context

### Lo que existe (NO rehacer)

| Recurso | Estado |
|---|---|
| API inventory | ✅ `GET /inventory/items`, `GET /inventory/items/:id` con paginación y filtros |
| Fotos en Azure | ✅ 17 fotos con SAS tokens 7 días |
| Auth | ✅ JWT dual-token, httpOnly cookies, auto-refresh |
| API client | ✅ Axios wrapper con `get/post/put/patch/delete` |
| React Router | ✅ `routes.tsx` con lazy loading |
| TanStack Query | ✅ `QueryClientProvider` |
| Zustand | ✅ `auth-store.ts` |
| Backend | ✅ NestJS corriendo en :3000 |

### Lo que NO existe y hay que construir

| Recurso | Prioridad |
|---|---|
| Tailwind v4 + shadcn/ui + Framer Motion | 🔴 Bloquea todo |
| Componentes inventory (cards, grid, filters, hero, modal) | 🔴 Core de esta tarea |
| API endpoint `/inventory/items/stats` para el hero dashboard | 🟡 Necesario |
| InventoryPage + ruta `/admin/inventory` | 🔴 Core |

## Source Docs

| Doc | Path |
|---|---|
| Design spec | `docs/design/inventory-design-spec.md` |
| Frontend structure ADR | `docs/adr/ADR-2026-07-07-frontend-feature-module-structure.md` |
| Catalogs complete handoff | `harness/control/handoffs/HOFF-2026-07-07-catalogs-complete-implementation.md` |
| Prisma schema | `back/prisma/schema.prisma` (Item, ItemPhoto, Purchase) |
| API client | `front/src/common/services/api-client.ts` |
| Routes | `front/src/routes.tsx` |
| Auth store | `front/src/common/stores/auth-store.ts` |

## Files To Create Or Modify

### Phase 1: Tailwind + shadcn/ui + Framer Motion Setup

| # | File | Action | Purpose |
|---|---|---|---|
| P1.1 | `front/package.json` | modify | Add tailwindcss @tailwindcss/vite framer-motion class-variance-authority clsx tailwind-merge lucide-react |
| P1.2 | `front/vite.config.ts` | modify | Add `@tailwindcss/vite` plugin |
| P1.3 | `front/src/index.css` | create | Tailwind imports + CSS variables for Nexo palette per design spec §1.1 |
| P1.4 | `front/src/styles.css` | delete | Replaced by index.css |
| P1.5 | `front/src/main.tsx` | modify | Import index.css instead of styles.css |
| P1.6 | `front/src/common/lib/utils.ts` | create | `cn()` helper (clsx + tailwind-merge) |
| P1.7 | `front/components.json` | create | shadcn config |
| P1.8 | `front/src/common/components/ui/*` | create | shadcn components: button, input, badge, card, dialog, select, skeleton, tooltip, separator |

### Phase 2: Backend — Inventory Stats Endpoint

| # | File | Action | Purpose |
|---|---|---|---|
| P2.1 | `back/src/modules/inventory/interface/http/items.controller.ts` | modify | Add `GET /inventory/items/stats` endpoint returning { totalItems, totalCostUSD, totalValueMXN, avgMargin } |

### Phase 3: Frontend — Inventory Types & API

| # | File | Action | Purpose |
|---|---|---|---|
| P3.1 | `front/src/features/inventory/types/item.ts` | create | `ItemDto`, `ItemStatus`, `InventoryStats`, `InventoryFilters` |
| P3.2 | `front/src/features/inventory/types/index.ts` | create | Barrel |
| P3.3 | `front/src/common/types/api.ts` | modify | Add `InventoryStats` to API response types |

### Phase 4: Frontend — Zustand Store

| # | File | Action | Purpose |
|---|---|---|---|
| P4.1 | `front/src/features/inventory/store/inventory-ui.store.ts` | create | Zustand: search, status, brandId, categoryId, sizeId, selectedItemId, isDetailOpen, viewMode |

### Phase 5: Frontend — TanStack Query Hooks

| # | File | Action | Purpose |
|---|---|---|---|
| P5.1 | `front/src/features/inventory/hooks/use-inventory-list.ts` | create | `useQuery` paginated with keepPreviousData |
| P5.2 | `front/src/features/inventory/hooks/use-inventory-stats.ts` | create | `useQuery` for dashboard stats |
| P5.3 | `front/src/features/inventory/hooks/use-catalog-options.ts` | create | Fetch brand/category/size lists for filter dropdowns |

### Phase 6: Frontend — Components

| # | File | Action | Purpose |
|---|---|---|---|
| P6.1 | `front/src/features/inventory/components/HeroDashboard.tsx` | create | Glass cards with animated count-up: total USD, total MXN, avg margin, item count |
| P6.2 | `front/src/features/inventory/components/FilterBar.tsx` | create | Search input (debounced 300ms) + dropdown selects for status, brand, category, size |
| P6.3 | `front/src/features/inventory/components/InventoryCard.tsx` | create | Framer Motion card: photo (Azure URL + blur-up), brand/category, size•color•condition chips, cost→price bar, status badge, hover overlay with actions |
| P6.4 | `front/src/features/inventory/components/InventoryGrid.tsx` | create | AnimatePresence wrapper: loading → error → empty → card grid (motion.div stagger) |
| P6.5 | `front/src/features/inventory/components/ItemDetailModal.tsx` | create | Full-screen dialog: large photo, metadata grid, financial summary, notes. Focus trap, Escape to close |
| P6.6 | `front/src/features/inventory/components/InventoryLoadingState.tsx` | create | 8 skeleton cards with pulse animation |
| P6.7 | `front/src/features/inventory/components/InventoryEmptyState.tsx` | create | Illustration + "Aún no tienes artículos" + CTA button |
| P6.8 | `front/src/features/inventory/components/InventoryErrorState.tsx` | create | Error message + "Reintentar" button |
| P6.9 | `front/src/features/inventory/components/StatusBadge.tsx` | create | Colored badge with subtle pulse for "Por revisar" status |
| P6.10 | `front/src/features/inventory/components/index.ts` | create | Barrel |

### Phase 7: Frontend — View + Route

| # | File | Action | Purpose |
|---|---|---|---|
| P7.1 | `front/src/features/inventory/views/InventoryPage.tsx` | create | Orchestrates Hero + Filters + Grid. Uses Zustand + TanStack Query |
| P7.2 | `front/src/routes.tsx` | modify | Add route `/admin/inventory` → `<InventoryPage />` |
| P7.3 | `front/src/common/components/layout/Sidebar.tsx` | modify | Add "Inventario" nav link with icon |

### Phase 8: Layout Migration (Tailwind)

| # | File | Action | Purpose |
|---|---|---|---|
| P8.1 | `front/src/common/components/layout/AppShell.tsx` | modify | Restyle with Tailwind classes |
| P8.2 | `front/src/common/components/layout/Sidebar.tsx` | modify | Restyle with Tailwind (keep structure, replace CSS) |
| P8.3 | `front/src/common/components/layout/Header.tsx` | modify | Restyle with Tailwind |
| P8.4 | `front/src/common/components/layout/MobileNav.tsx` | modify | Restyle with Tailwind |

## Implementation Steps

### Fase 1: Infraestructura
1. Instalar dependencias: `pnpm add tailwindcss @tailwindcss/vite framer-motion class-variance-authority clsx tailwind-merge lucide-react`
2. Configurar vite.config.ts con plugin `@tailwindcss/vite`
3. Crear `index.css` con `@import "tailwindcss"` + variables CSS de la paleta Nexo
4. Crear `utils.ts` con `cn()` helper
5. Crear `components.json` con shadcn config (baseColor: "neutral", cssVariables: true)
6. Importar index.css en main.tsx, borrar styles.css
7. Verificar `pnpm tsc -b` + `pnpm build` compilan

### Fase 2: Backend stats
8. Agregar endpoint `GET /inventory/items/stats` en items.controller.ts:
   - totalItems: count all
   - totalCostUSD: sum costAmount where currency=USD
   - totalValueMXN: sum targetPriceMxn
   - avgMargin: avg(targetPriceMxn / costAmount)
9. Proteger con SessionAuthGuard + OperatorWorkspace

### Fase 3-5: Types, Store, Hooks
10. Crear tipos ItemDto, InventoryStats, InventoryFilters
11. Crear Zustand store con filtros + vista
12. Crear hooks TanStack Query

### Fase 6: Componentes
13. HeroDashboard: 4 glass cards con Framer Motion count-up animation
14. FilterBar: search + selects poblados desde API de catálogos
15. InventoryCard: Framer Motion card con blur-up image + hover overlay + status badge
16. InventoryGrid: orchestrator con loading/empty/error states
17. ItemDetailModal: full-screen dialog
18. Estados: LoadingState (8 skeletons), EmptyState, ErrorState

### Fase 7-8: Integración
19. InventoryPage: compone Hero + Filters + Grid
20. Ruta en routes.tsx: `/admin/inventory`
21. Sidebar: link "Inventario" con icono
22. Migrar AppShell/Sidebar/Header/MobileNav a Tailwind

## Verification

- `pnpm tsc -b` compila sin errores en `front/`
- `pnpm build` produce bundle < 400KB JS gzipped
- Login como Admin → navegar a `/admin/inventory`
- Ver 17 cards con fotos de Azure, animación de entrada stagger
- Filtrar por marca (Adidas → 4 cards, North Face → 5 cards)
- Buscar "Dame" → aparece el Bucks jersey
- Abrir detalle del item → modal con foto grande + metadata
- Verificar responsive: 375px → 1 col, 768px → 2 col, 1280px → 3 col
- Estados: si la API falla → error state con botón reintentar

## Risks

| Riesgo | Mitigación |
|---|---|
| Tailwind v4 + shadcn compatibility | Usar shadcn 2.x que soporta Tailwind v4 |
| Framer Motion layout shifts | Usar `layout` prop solo en cards, no en el grid |
| Blur-up placeholder generation | Fallback: mostrar spinner mientras carga la foto |
| Azure SAS URLs expiran en 7 días | El backend debe regenerar URL al servir la respuesta |
| Layout existente se rompe | Migrar un componente a la vez, verificar visualmente |

## Acceptance Criteria

1. Vista `/admin/inventory` muestra hero dashboard con stats reales
2. Card grid con 17 items, animación stagger, fotos de Azure visibles
3. Filtros funcionales: búsqueda, estado, marca, categoría, talla
4. Modal de detalle con foto grande, metadata, y datos financieros
5. Estados cubiertos: loading (skeleton), empty, error
6. Responsive en 375px, 768px, 1280px
7. `pnpm tsc -b` + `pnpm build` pasan en front/

## Non-Goals

- No CRUD de items desde frontend (solo vista en v1)
- No edición inline de items
- No bulk actions (seleccionar múltiples)
- No gráficos avanzados (solo las 4 métricas del hero)
- No commit/push/deploy sin confirmación

## Suggested Skills

- `tdd` — tests del API endpoint stats
- `commit-work` — commits atómicos por fase
