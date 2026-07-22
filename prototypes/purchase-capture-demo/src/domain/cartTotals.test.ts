import { describe, expect, it } from "vitest";
import { calculatePurchaseCartTotals, calculateBatchConsolidatedTotals } from "./cartTotals";
import type { PaymentDetail } from "./types";

describe("calculatePurchaseCartTotals", () => {
  it("calculates USD subtotal, tax, expected total, and MXN equivalent", () => {
    const totals = calculatePurchaseCartTotals(
      {
        currency: "USD",
        taxRate: 8.25,
        exchangeRate: 18.25,
      },
      [{ purchaseCost: 10 }, { purchaseCost: 20 }],
    );

    expect(totals.itemCount).toBe(2);
    expect(totals.subtotal).toBe(30);
    expect(totals.tax).toBeCloseTo(2.475);
    expect(totals.expectedTotal).toBeCloseTo(32.475);
    expect(totals.mxnEquivalent).toBeCloseTo(592.66875);
    expect(totals).not.toHaveProperty("roundingPolicy");
  });

  it("uses the same amount as MXN equivalent when cart currency is MXN", () => {
    const totals = calculatePurchaseCartTotals(
      {
        currency: "MXN",
        taxRate: 16,
        exchangeRate: null,
      },
      [{ purchaseCost: 100 }],
    );

    expect(totals.subtotal).toBe(100);
    expect(totals.tax).toBe(16);
    expect(totals.expectedTotal).toBe(116);
    expect(totals.mxnEquivalent).toBe(116);
  });
});

describe("calculateBatchConsolidatedTotals", () => {
  function makePayment(
    overrides: Partial<PaymentDetail> = {},
  ): PaymentDetail {
    return {
      id: "pay-1",
      batchId: "batch-1",
      evidence: "evidence-ticket",
      taxRate: 8.25,
      exchangeRate: 18.25,
      expectedTotal: 100,
      paidTotal: 100,
      differenceReasonId: null,
      differenceNote: null,
      garmentCount: 3,
      createdAt: "2026-07-01T12:00:00.000Z",
      garments: [],
      ...overrides,
    };
  }

  it("sums a single payment correctly", () => {
    const result = calculateBatchConsolidatedTotals([
      makePayment(),
    ]);

    expect(result).toEqual({
      paymentCount: 1,
      garmentCount: 3,
      expectedTotal: 100,
      paidTotal: 100,
    });
  });

  it("consolidates multiple payments", () => {
    const result = calculateBatchConsolidatedTotals([
      makePayment({ expectedTotal: 100, paidTotal: 95, garmentCount: 3 }),
      makePayment({ id: "pay-2", expectedTotal: 50, paidTotal: 50, garmentCount: 1 }),
    ]);

    expect(result).toEqual({
      paymentCount: 2,
      garmentCount: 4,
      expectedTotal: 150,
      paidTotal: 145,
    });
  });

  it("returns zeros for empty payments array", () => {
    const result = calculateBatchConsolidatedTotals([]);

    expect(result).toEqual({
      paymentCount: 0,
      garmentCount: 0,
      expectedTotal: 0,
      paidTotal: 0,
    });
  });
});
