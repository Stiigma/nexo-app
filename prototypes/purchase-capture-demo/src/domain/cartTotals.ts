import type { Currency, PaymentDetail, PurchaseCartTotals } from "./types";

type TotalsCartInput = {
  currency: Currency;
  taxRate: number;
  exchangeRate: number | null;
};

type TotalsItemInput = {
  purchaseCost: number;
};

export function calculatePurchaseCartTotals(
  cart: TotalsCartInput,
  items: TotalsItemInput[],
): PurchaseCartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.purchaseCost, 0);
  const tax = subtotal * (cart.taxRate / 100);
  const expectedTotal = subtotal + tax;
  const mxnEquivalent =
    cart.currency === "USD"
      ? expectedTotal * (cart.exchangeRate ?? 0)
      : expectedTotal;

  return {
    itemCount: items.length,
    subtotal,
    tax,
    expectedTotal,
    mxnEquivalent,
  };
}

export type BatchConsolidatedTotals = {
  paymentCount: number;
  garmentCount: number;
  expectedTotal: number;
  paidTotal: number;
};

export function calculateBatchConsolidatedTotals(
  payments: PaymentDetail[],
): BatchConsolidatedTotals {
  let garmentCount = 0;
  let expectedTotal = 0;
  let paidTotal = 0;

  for (const payment of payments) {
    garmentCount += payment.garmentCount;
    expectedTotal += payment.expectedTotal;
    paidTotal += payment.paidTotal;
  }

  return {
    paymentCount: payments.length,
    garmentCount,
    expectedTotal,
    paidTotal,
  };
}
