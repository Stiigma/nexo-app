# ADR-2026-07-07: Frontend Feature Module Structure

## Status

Accepted

## Context

The frontend started with a flat structure where API calls, types, and state
management were mixed inside a single Zustand store (`auth-store.ts`). TanStack
Query was installed but unused. As new features (catalogs, purchases, inventory,
sales) are added, the lack of a consistent module pattern will cause:

- Duplicated API call patterns.
- Types scattered across files instead of co-located with features.
- Hard-to-test components with implicit API dependencies.
- Unclear boundaries between server state (TanStack Query) and client state
  (Zustand).

## Decision

Each feature module follows this structure:

```
features/{feature}/
  types/          ← TypeScript types: entities, DTOs, enums, filters
  services/       ← Pure functions: one per API endpoint, returns typed data
  hooks/          ← TanStack Query wrappers (useQuery / useMutation)
  store/          ← Zustand stores: ONLY client UI state (filters, modals, selections)
  helpers/        ← Pure transformation functions (never inline in hooks)
  views/          ← React components: pages, modals, sub-components
    components/   ← Presentational components scoped to this feature
```

### Layer responsibilities

1. **`types/`** — `interface`, `type`, `enum`, `const` assertions only. No logic.
2. **`services/`** — Functions that call the API client from `common/services/`.
   Returns types from `types/`. No business logic.
3. **`hooks/`** — Wraps `useQuery` / `useMutation` from TanStack Query. Calls
   `services/`. Any data transformation uses a `helpers/` function, not inline
   code.
4. **`store/`** — Zustand store for UI-only state: which modal is open, current
   filter selection, selected row ID. Never calls APIs directly.
5. **`views/`** — React components that combine hooks (for server data) and
   store (for UI state). Never calls `api.*` or `services.*` directly.

### Shared code (`common/`)

```
common/
  types/          ← Domain types (UserRole, AuthUser) + generic API types (PaginatedResponse, ApiError)
  services/       ← API client (Axios instance with JWT refresh)
  stores/         ← Cross-cutting stores (auth session state)
  hooks/          ← Generic hooks (useDebounce, useMediaQuery, useConfirmation)
  components/
    layout/       ← AppShell, Sidebar, Header, MobileNav
    guards/       ← AuthGuard
    ui/           ← Reusable primitives (Button, Modal, Table, Badge, SearchInput)
  utils/          ← Pure utilities (formatCurrency, formatDate, cn(), access control)
```

Rule: if 2+ features use it, it goes in `common/`. If only one feature uses it,
it stays in the feature module.

### Alias

All source imports use the `@/` alias pointing to `front/src/`:
- `@/common/services/api-client`
- `@/common/stores/auth-store`
- `@/features/auth/hooks/use-login`

This avoids deep relative paths (`../../../../../common/types`).

### Data flow

```
View → TanStack Query Hook → Service Function → API Client → Backend
  ↓                              ↓
  Zustand (client state)    Helpers (transformations)
```

## Consequences

- **Positive**: Clear testability — services are pure functions, hooks are thin
  wrappers, views are presentational.
- **Positive**: TanStack Query manages caching, refetching, and stale state
  instead of manual `async/await` in Zustand stores.
- **Positive**: Co-located types reduce cross-module coupling.
- **Positive**: Clear migration path for legacy code.
- **Negative**: More files per feature, but each file has a single
  responsibility.
- **Negative**: Requires discipline to keep Zustand stores free of API calls.

## Compliance

- New features (F2–F11) MUST follow this structure.
- Old code (`auth` feature) MUST be refactored to this structure before F2
  active work begins.
- Code review MUST verify: no API calls in Zustand stores, no inline logic in
  TanStack Query hooks (use helpers/ instead).
