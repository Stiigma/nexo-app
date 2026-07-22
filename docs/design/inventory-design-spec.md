# Nexo Inventory — Design Spec v1

## Metadata

- **Feature:** Inventory (F5/F6 combinado)
- **Date:** 2026-07-07
- **Author:** nexo-plan
- **Status:** ready for build

## 1. Visual System

### 1.1 Color Palette

```
┌─ Brand ─────────────────────────────────────────────┐
│  Primary:     #1a5f4a  (forest green — header, CTAs) │
│  Primary-900: #0d3326  (dark green — hover states)   │
│  Gold:        #c9a84c  (prices, highlights, borders) │
│  Gold-light:  #e8d48b  (gold hover)                  │
└──────────────────────────────────────────────────────┘

┌─ Surface ───────────────────────────────────────────┐
│  Background:  #f6f4ef  (warm cream)                  │
│  Card:        #ffffff  (pure white)                  │
│  Glass:       rgba(255,255,255,0.75)  blur(12px)    │
│  Sidebar:     #101820  (ink black)                   │
│  Sidebar-hover: #1a2530                              │
│  Text:        #1a1a2e  (near black)                  │
│  Text-muted:  #6b7280  (gray-500)                    │
└──────────────────────────────────────────────────────┘

┌─ Status Badges ─────────────────────────────────────┐
│  Acquired:    #3b82f6  (blue-500)    🔵 Adquirido    │
│  Available:   #22c55e  (green-500)   🟢 Disponible   │
│  Reserved:    #8b5cf6  (purple-500)  🟣 Reservado    │
│  Sold:        #9ca3af  (gray-400)    ⚪ Vendido      │
│  Returned:    #ef4444  (red-500)     🔴 Devuelto     │
│  NeedsReview: #f59e0b  (amber-500)   🟡 Por revisar  │
└──────────────────────────────────────────────────────┘

┌─ Gradients ─────────────────────────────────────────┐
│  Hero:  linear-gradient(135deg, #1a5f4a 0%, #0d3326 100%)  │
│  Gold-accent: linear-gradient(135deg, #c9a84c, #e8d48b)  │
└──────────────────────────────────────────────────────┘
```

### 1.2 Typography

| Token | Stack | Usage |
|---|---|---|
| Display | `"Plus Jakarta Sans", sans-serif` | Hero title, large numbers |
| Body | `"Inter", system-ui, sans-serif` | Everything else |
| Mono | `"JetBrains Mono", monospace` | Codes, prices, IDs |

Sizes via Tailwind: `text-4xl` (hero), `text-2xl` (cards), `text-base` (body), `text-sm` (meta).

### 1.3 Glassmorphism Tokens

Applied to: hero dashboard cards, modal backdrop, action overlays.

```css
.glass-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}
```

## 2. Animation System (Framer Motion)

### 2.1 Stagger Grid Entrance

```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const card = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};
```

### 2.2 Card Hover

```typescript
const cardHover = {
  rest: { scale: 1, y: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
    borderColor: "#c9a84c",
    transition: { type: "spring", stiffness: 400, damping: 20 },
  },
};
```

### 2.3 Blur-Up Image Loading

```
1. Show 20×20px blurred thumbnail as placeholder (embedded as base64 or generated)
2. Azure URL loads in background
3. On load: fade opacity 0 → 1 over 500ms
```

### 2.4 Other Animations

| Element | Effect | Duration |
|---|---|---|
| Badge pulse | `opacity: [1, 0.7, 1]` loop | 3s |
| Price count-up | `useSpring(target, { stiffness: 100 })` from 0 to value | 1.5s |
| Filter slide | Slide down + fade on open | 300ms |
| Modal backdrop | Fade in + scale(0.95 → 1) | 200ms |
| Action overlay | Fade in on card hover | 150ms |
| Empty state | Float animation on illustration | continuous |

## 3. Layout

### 3.1 Screen Structure

```
┌──────────────────────────────────────────────────────┐
│  Header                                               │
│  [logo] Inventario          [🔔] [👤 Admin]          │
├────────┬─────────────────────────────────────────────┤
│ Sidebar│  ┌─────────────────────────────────────┐    │
│        │  │  Hero Dashboard                     │    │
│  📦    │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│    │
│  Catá- │  │  │$505  │ │$20K  │ │2.3x  │ │ 17   ││    │
│  logos │  │  │USD   │ │MXN   │ │margen│ │items ││    │
│        │  └─────────────────────────────────────┘    │
│  📋    │                                             │
│  Inven-│  🔍 Buscar  [Estado ▼] [Marca ▼] [Cat ▼]  │
│  tario │                                             │
│        │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│        │  │ Card │ │ Card │ │ Card │ │ Card │      │
│        │  └──────┘ └──────┘ └──────┘ └──────┘      │
│        │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│        │  │ Card │ │ Card │ │ Card │ │ Card │      │
│        │  └──────┘ └──────┘ └──────┘ └──────┘      │
│        │  ...                                       │
│        │  < 1 2 3 4 5 >   Mostrando 1-12 de 17     │
└────────┴─────────────────────────────────────────────┘
```

### 3.2 Responsive Breakpoints

| Width | Grid columns | Hero layout | Filters |
|---|---|---|---|
| < 640px | 1 | Stacked, stats in 2×2 grid | Bottom sheet drawer |
| 640-1024px | 2 | Horizontal, 4 stats | Inline below hero |
| > 1024px | 3 | Horizontal, glass cards | Inline with search |

## 4. Components

### 4.1 HeroDashboard

```
┌──────────────────────────────────────────────────────┐
│  background: gradient green-to-dark                   │
│  ┌──────────────────────────────────────────────────┐│
│  │  💎 Mi Inventario                                ││
│  │                                                  ││
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   ││
│  │  │$505    │ │$20,050 │ │  ~2.3x │ │   17   │   ││
│  │  │USD     │ │MXN val │ │margen  │ │items   │   ││
│  │  │invert. │ │esperado│ │promedio│ │total   │   ││
│  │  └────────┘ └────────┘ └────────┘ └────────┘   ││
│  │                                                  ││
│  │  ▓▓▓▓▓▓▓▓▓▓░░  Adquirido: 17                   ││
│  │  ░░░░░░░░░░░░  Disponible: 0                    ││
│  └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

Data sources:
- Total USD: SUM(costAmount) WHERE costCurrency='USD'
- Total MXN: SUM(targetPriceMxn)
- Avg margin: targetPriceMxn / (costAmount * rate) average
- Count: items total

### 4.2 FilterBar

```
┌──────────────────────────────────────────────────────┐
│  🔍 Buscar artículos...                              │
│                                                      │
│  [Todo ▼] [Todas ▼] [Todas ▼] [Todos ▼] [ × Clear] │
│  Estado     Marca      Categoría   Talla             │
└──────────────────────────────────────────────────────┘
```

Filters populate from API:
- Status: enum values from ItemStatus
- Brand: GET /catalogs/brands?active=true
- Category: GET /catalogs/categories?active=true
- Size: GET /catalogs/sizes?active=true

Search: debounce 300ms, calls API with ?search=term

### 4.3 InventoryCard

```
┌──────────────────────────────┐
│ ┌──────────────────────────┐ │
│ │  ┌────────────────────┐  │ │  ← Action overlay
│ │  │  👁 Ver detalle    │  │ │     (fades in on hover)
│ │  │  ✏️ Editar         │  │ │     bg: rgba(0,0,0,0.4)
│ │  │  ✅ Marcar vendido │  │ │
│ │  │  📋 Copiar código  │  │ │
│ │  └────────────────────┘  │ │
│ ┌──────────────────────────┐ │
│ │                          │ │
│ │         🖼️ FOTO          │ │  ← Azure Blob URL
│ │         blur-up          │ │     object-cover
│ │                          │ │     hover: scale(1.05)
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ #NX-0001                 │ │
│ │ Adidas / Pants           │ │  ← brand / category
│ │                          │ │
│ │ XL • Negro • Usado       │ │  ← size • color • condition
│ │                          │ │
│ │ ┌──────────────────────┐ │ │
│ │ │ $10 → $350   ▓▓▓▓░░ 35x│ │  ← cost → price + margin bar
│ │ └──────────────────────┘ │ │
│ │                          │ │
│ │ 🟢 Adquirido             │ │  ← status badge
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

Fields displayed:
- Photo (main, from Azure SAS URL)
- internalCode badge
- brand name + category name (or productName)
- Size • Color • Condition (chips)
- Cost → Price with margin indicator bar
- Status badge

### 4.4 InventoryGrid

```tsx
<AnimatePresence mode="wait">
  {isLoading && <InventoryLoadingState />}
  {isError && <InventoryErrorState onRetry={refetch} />}
  {isEmpty && <InventoryEmptyState />}
  {data && (
    <motion.div variants={container} initial="hidden" animate="show">
      {data.map(item => <InventoryCard key={item.id} item={item} />)}
    </motion.div>
  )}
</AnimatePresence>
```

### 4.5 ItemDetailModal

Full-screen modal with: photo (large, zoomable), metadata grid, financial summary, notes, status timeline.

### 4.6 Loading State

8 skeleton cards with pulse animation: gray rectangles matching card shape (photo area, text lines, chip placeholders).

### 4.7 Empty State

```
┌────────────────────────────────────────┐
│                                        │
│           📦  (floating animation)     │
│                                        │
│     Aún no tienes artículos            │
│   Comienza registrando tu inventario   │
│                                        │
│         [ + Agregar artículo ]         │
│                                        │
└────────────────────────────────────────┘
```

### 4.8 Error State

```
┌────────────────────────────────────────┐
│           ⚠️                           │
│     No pudimos cargar el inventario    │
│        Error de conexión               │
│                                        │
│         [ 🔄 Reintentar ]              │
└────────────────────────────────────────┘
```

## 5. Data Flow

```
InventoryPage
  │
  ├─ HeroDashboard ← useInventoryStats()
  │    └─ GET /api/v1/inventory/items/stats
  │
  ├─ FilterBar ← useInventoryFilters() (Zustand)
  │    └─ GET /api/v1/catalogs/brands?active=true
  │    └─ GET /api/v1/catalogs/categories?active=true
  │    └─ GET /api/v1/catalogs/sizes?active=true
  │
  ├─ InventoryGrid
  │    └─ useInventoryList(filters)
  │        └─ GET /api/v1/inventory/items?page=&limit=&search=&status=&brandId=&categoryId=&sizeId=
  │           └─ TanStack Query (placeholderData: keepPreviousData)
  │
  └─ ItemDetailModal
       └─ useInventoryItem(id)
            └─ GET /api/v1/inventory/items/:id
```

## 6. Zustand Store

```typescript
interface InventoryUIState {
  // Filters
  search: string;
  status: ItemStatus | null;
  brandId: string | null;
  categoryId: string | null;
  sizeId: string | null;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;

  // View
  selectedItemId: string | null;
  isDetailOpen: boolean;
  viewMode: "grid" | "list";

  // Actions
  openDetail: (id: string) => void;
  closeDetail: () => void;
}
```

## 7. Accessibility

- All interactive elements keyboard-navigable (Tab, Enter, Escape)
- Cards: role="article", aria-label with item description
- Modal: focus trap, Escape closes, aria-modal="true"
- Images: alt text = `${brand} ${category} - ${color}`
- Status badges: aria-label with status description
- Color contrast: ≥ 4.5:1 for all text (verified against Tailwind tokens)
- Screen reader announcements on filter changes

## 8. Performance

- Image optimization: Azure blob URLs already optimized. Use `loading="lazy"` on cards below fold.
- Blur-up: generate 20px blur placeholder via canvas or use a tiny base64 fallback
- Pagination: 12 items per page, TanStack Query with keepPreviousData
- Bundle: lazy load ItemDetailModal via React.lazy
- Framer Motion: `layout` animations only on cards visible in viewport

## 9. Garment Editor (NEXO-0037, first slice)

### 9.1 Access and entry points

- `/inventory` is the shared operational inventory route for `Operator` and
  `Admin`; `/admin/inventory` remains available to the admin as the same view.
- The detail modal exposes an `Editar prenda` action. The editor is available
  to both roles; `Admin` inherits this action rather than needing a separate
  editor.
- This slice edits existing garment data only. It does not upload or attach
  photos, change physical status, publish listings, sell garments, or expose
  cost/minimum-price controls.

### 9.2 Editor form

The editor opens as a modal on desktop and full-height, scrollable dialog on a
mobile viewport. It pre-fills the stored values and contains these sections:

| Section | Fields |
| --- | --- |
| Identidad | Nombre de la prenda (optional, falls back to brand + category) |
| Clasificación | Marca, categoría, condición, talla and color |
| Venta y ubicación | Precio público/lista en MXN and ubicación física |
| Notas | Notas operativas |

Above the fields, show `Faltantes para preparar` with only the incomplete
requirements: photo principal, marca, categoría, condición, talla, color,
ubicación física and precio público. A complete garment shows a concise
success state. The list is informative in this slice: saving does not publish
or alter the physical status.

### 9.3 Interaction states

- Save is disabled while catalog options load or a save is in progress.
- Field errors are shown next to the field and announced with `role="alert"`.
- A successful save closes the editor, refreshes inventory and stats, and
  shows `Prenda actualizada`.
- A failed save leaves the form open and shows the API error without losing the
  entered values.
- Closing with unsaved changes asks for confirmation before discarding them.

### 9.4 Accessibility and permissions

- The title identifies the garment code and the dialog receives initial focus.
- Labels are visible; selects and text inputs remain keyboard-operable; Escape
  closes only when there are no unsaved changes or after discard confirmation.
- The UI does not use client-side role checks as authorization. The API grants
  the shared editor to the operator workspace and blocks sensitive fields.
- Admin-only financial corrections are intentionally absent from this editor,
  so they cannot be exposed accidentally to an operator.
- When the shared inventory screen is viewed as `OPERATOR`, the API omits cost,
  exchange-rate, and minimum-price fields; the interface also hides investment,
  margin, and financial-breakdown panels as defense in depth.
