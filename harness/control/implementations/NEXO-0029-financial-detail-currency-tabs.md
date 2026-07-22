# NEXO-0029 Implementation - Financial Detail Currency Tabs

## Metadata

- Task ID: NEXO-0029
- Date: 2026-07-07
- Agent: nexo-build
- Related plan: `../plans/NEXO-0029-financial-detail-currency-tabs.md`
- Related handoff: `../handoffs/HOFF-2026-07-07-financial-detail-currency-tabs.md`
- Related report: `../reports/2026-07-07/NEXO-0029-financial-detail-currency-tabs-session-001.md`

## Summary

Replaced the inventory detail modal's linear financial breakdown with
currency-specific tabs for MXN and USD.

## Files Changed

- `front/src/features/inventory/components/FinancialBreakdown.tsx`
- `harness/control/plans/NEXO-0029-financial-detail-currency-tabs.md`
- `harness/control/handoffs/HOFF-2026-07-07-financial-detail-currency-tabs.md`
- `harness/control/tasks.md`
- `harness/control/README.md`
- `harness/control/state/CURRENT.md`
- `harness/control/journal/2026-07-07.md`
- `harness/control/reports/2026-07-07/NEXO-0029-financial-detail-currency-tabs-session-001.md`

## Behavior Changed

- `Desglose financiero` now presents `MXN` and `USD` tabs.
- `MXN` is selected by default.
- `USD` is display-only and converted from existing MXN values using
  `exchangeRate`.
- The core rows are `Costo`, `Queremos darlo`, `% ganancia`, and
  `Ganancia neta`.
- `Precio mínimo` remains an optional muted row when `minPriceMxn` exists.
- Missing cost or target price values render as `Pendiente`.
- The USD tab is disabled and labeled `USD · Sin tipo de cambio` when no valid
  exchange rate exists.

## Verification

- `cd front && pnpm build` passed.
- Build output included the existing Vite chunk-size warning for a chunk larger
  than 500 kB.

## Operational Notes

- No backend, DTO, Prisma, API, or persistence changes were made.
- The USD target price is not persisted; it is derived for display only.

## Follow-Up

- Manual browser check on `/admin/inventory` detail modal, including mobile
  layout and missing target-price cases.
