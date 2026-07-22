# HOFF-2026-07-07 - Financial Detail Currency Tabs

## Objective

Implement `NEXO-0029` by replacing the inventory detail financial breakdown
with MXN/USD currency tabs.

## Context

The current inventory detail modal has a linear `Desglose financiero` table
grouped by acquisition, sale, and profit. The requested UI should expose the
same financial concepts through currency tabs: MXN first, USD second.

## Source Docs

- `harness/control/plans/NEXO-0029-financial-detail-currency-tabs.md`
- User-provided plan: "Financial Detail Currency Tabs"

## Files To Create Or Modify

- Modify `front/src/features/inventory/components/FinancialBreakdown.tsx`.
- Create/update control-plane records for `NEXO-0029`.

## Implementation Steps

1. Use existing shared `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, and
   `Table` primitives.
2. Compute MXN cost from `costMxnEq`, falling back to `costAmount` only when
   the cost currency is MXN.
3. Compute target price, margin percentage, net profit, and optional minimum
   price in MXN.
4. Compute USD values by dividing MXN amounts by `exchangeRate`.
5. Disable the USD tab when `exchangeRate` is missing or invalid.
6. Preserve `Pendiente` states for missing cost or target price.

## Verification

- Run `cd front && pnpm build`.
- Manual follow-up on `/admin/inventory`: confirm MXN default tab, USD
  conversion, pending states, and mobile fit.

## Risks

- This is display logic only; future `NEXO-0014` still owns durable MXN/USD
  sales behavior.

## Acceptance Criteria

- MXN tab is first and default selected.
- USD tab shows converted values only when `exchangeRate` exists.
- `% ganancia` matches MXN math and remains unchanged by conversion.
- `Precio mínimo` appears as an optional muted row.
- No backend or DTO changes are made.

## Receiving Agent

`nexo-build`
