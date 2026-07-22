# NEXO-0029 - Financial Detail Currency Tabs

## Objective

Improve the inventory detail financial breakdown by replacing the current
linear financial rows with MXN/USD currency tabs.

## Done When

- The inventory detail modal shows `MXN` first and selected by default.
- The `USD` tab is display-only and converts existing MXN financial values
  using `exchangeRate`.
- The financial table shows `Costo`, `Queremos darlo`, `% ganancia`, and
  `Ganancia neta` in both currencies.
- `Precio mínimo` remains visible as a muted optional row when `minPriceMxn`
  exists.
- Missing cost, target price, or exchange-rate values render clear pending or
  disabled states.
- `cd front && pnpm build` passes.

## Scope

- Frontend-only inventory detail UI.
- `FinancialBreakdown.tsx`.
- Control-plane task, handoff, implementation, journal, and report records.

## Out Of Scope

- API, Prisma, DTO, backend, or schema changes.
- Persisting an independent USD target/listing price.
- Sold-item profit accounting.

## Steps

1. Register `NEXO-0029` in the task index.
2. Create a build handoff for the focused UI change.
3. Replace the financial breakdown rows with currency tabs using existing
   shared UI primitives.
4. Preserve partial states for missing financial values.
5. Verify the frontend build.
6. Record the implementation and session report.

## Progress

- 2026-07-07: Created from the previous agent's implementation plan and
  executed as a focused frontend UI improvement.

## Decision Log

- 2026-07-07: Treat `% ganancia` as gain over cost:
  `(targetPriceMxn - costMxn) / costMxn * 100`.
- 2026-07-07: Keep USD display-only; it is an informational conversion from
  MXN values, not a persisted sales field.
- 2026-07-07: Disable the USD tab when no usable exchange rate exists and label
  it `USD · Sin tipo de cambio`.

## Risks

- Existing frontend worktree has broad uncommitted changes from prior tasks;
  this task only changes the financial breakdown component.
- Manual responsive validation depends on running the app with seeded data.

## Verification

- `cd front && pnpm build`
