# NEXO-0008 — Report: Fix `limit=200` Bad Request in Inventory Dropdowns

**Date:** 2026-07-07
**Agent:** nexo-build
**Handoff:** `harness/control/handoffs/HOFF-2026-07-07-catalogs-limit-200-fix.md`

## What Changed

- Modified `front/src/features/inventory/hooks/use-catalog-options.ts`.
- Changed `limit: 200` → `limit: 100` in all three catalog option queries:
  - `catalogs/brands`
  - `catalogs/categories`
  - `catalogs/sizes`

## Verification

1. **No remaining `limit: 200` in frontend:**
   ```bash
   rg "limit: 200" front/src
   ```
   Result: no output (no matches).

2. **Frontend build:**
   ```bash
   cd front && pnpm build
   ```
   Result: **passed**.
   ```
   $ tsc -b && vite build
   vite v7.0.6 building for production...
   transforming...
   ✓ 2537 modules transformed.
   rendering chunks...
   computing gzip size...
   dist/index.html                   0.50 kB │ gzip:   0.30 kB
   dist/assets/index-BLbXbBLn.css   40.93 kB │ gzip:   7.80 kB
   dist/assets/index-BMna5epR.js   794.50 kB │ gzip: 250.34 kB
   ✓ built in 4.99s
   ```
   Note: there is an unrelated chunk-size warning, not a build failure.

## What Was Not Changed

- Backend `back/src/common/pagination/paginated-query.dto.ts` remains unchanged (`@Max(100)` preserved).
- No new functionality (pagination, search, or new endpoints) was added.
- No commit, push, or deploy was performed.

## Recommended Next Step

Manual local smoke test: open `/admin/inventory`, confirm in DevTools that:
- `/api/v1/catalogs/brands?active=true&limit=100`
- `/api/v1/catalogs/categories?active=true&limit=100`
- `/api/v1/catalogs/sizes?active=true&limit=100`

all return `200 OK` and populate the dropdowns. Then request user confirmation before commit/push/deploy.
