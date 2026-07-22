# NEXO-0029 Report - Financial Detail Currency Tabs Session 001

## Metadata

- Date: 2026-07-07
- Agent: nexo-build
- Task: NEXO-0029 - Financial Detail Currency Tabs
- Status: implemented

## What Was Done

- Registered `NEXO-0029` with a focused plan and build handoff.
- Updated `FinancialBreakdown.tsx` to replace the previous linear financial
  rows with `MXN` and `USD` tabs.
- Added a shared currency table shape with rows for `Costo`, `Queremos darlo`,
  `% ganancia`, and `Ganancia neta`.
- Preserved `Precio mínimo` as a muted optional row.
- Added explicit pending handling for missing cost and target price.
- Disabled USD when no valid `exchangeRate` exists.

## Files Changed

- `front/src/features/inventory/components/FinancialBreakdown.tsx`
- `harness/control/plans/NEXO-0029-financial-detail-currency-tabs.md`
- `harness/control/handoffs/HOFF-2026-07-07-financial-detail-currency-tabs.md`
- `harness/control/implementations/NEXO-0029-financial-detail-currency-tabs.md`
- `harness/control/tasks.md`
- `harness/control/README.md`
- `harness/control/state/CURRENT.md`
- `harness/control/journal/2026-07-07.md`

## Verification Performed

- `cd front && pnpm build` passed.
- Vite reported a chunk-size warning over 500 kB; build still completed
  successfully.

## Open Items

- Manual UI verification was not run in a browser during this session.
- Check `/admin/inventory` detail modal for MXN default tab, USD conversion,
  missing target price state, and mobile fit.

## Recommended Next Step

Run the frontend locally with seeded inventory and perform the manual detail
modal checks listed above.
