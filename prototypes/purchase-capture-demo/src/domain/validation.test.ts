import { describe, expect, it } from "vitest";
import {
  validatePurchaseCartInput,
  validatePurchaseCartItemInput,
  validatePaymentConfirmationInput,
} from "./validation";
import type {
  PaymentConfirmationInput,
  PurchaseCartInput,
  PurchaseCartItemInput,
} from "./types";

const paymentReasonCatalog = [
  { id: "diff-discount", name: "Descuento", requiresNote: false },
  { id: "diff-other", name: "Otro", requiresNote: true },
];

describe("validatePurchaseCartInput", () => {
  it("rejects an empty store", () => {
    const result = validatePurchaseCartInput({
      storeId: "  ",
      date: "2026-07-01",
      currency: "USD",
      taxRate: "8.25",
      exchangeRate: "18.25",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.storeId).toBeDefined();
    }
  });

  it("rejects an empty date", () => {
    const result = validatePurchaseCartInput({
      storeId: "store-goodwill",
      date: "",
      currency: "USD",
      taxRate: "8.25",
      exchangeRate: "18.25",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.date).toBeDefined();
    }
  });

  it("rejects an invalid date", () => {
    const result = validatePurchaseCartInput({
      storeId: "store-goodwill",
      date: "not-a-date",
      currency: "USD",
      taxRate: "8.25",
      exchangeRate: "18.25",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.date).toBeDefined();
    }
  });

  it("rejects an invalid currency", () => {
    const result = validatePurchaseCartInput({
      storeId: "store-goodwill",
      date: "2026-07-01",
      currency: "",
      taxRate: "8.25",
      exchangeRate: "18.25",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.currency).toBeDefined();
    }
  });

  it("rejects a negative tax rate", () => {
    const result = validatePurchaseCartInput({
      storeId: "store-goodwill",
      date: "2026-07-01",
      currency: "USD",
      taxRate: "-1",
      exchangeRate: "18.25",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.taxRate).toBeDefined();
    }
  });

  it("requires exchange rate for USD", () => {
    const result = validatePurchaseCartInput({
      storeId: "store-goodwill",
      date: "2026-07-01",
      currency: "USD",
      taxRate: "8.25",
      exchangeRate: "",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.exchangeRate).toBeDefined();
    }
  });

  it("normalizes a valid input", () => {
    const result = validatePurchaseCartInput({
      storeId: "store-goodwill",
      date: "2026-07-01",
      currency: "USD",
      taxRate: "8.25",
      exchangeRate: "18.25",
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value.storeId).toBe("store-goodwill");
      expect(result.value.taxRate).toBe(8.25);
      expect(result.value.exchangeRate).toBe(18.25);
    }
  });
});

describe("validatePurchaseCartItemInput", () => {
  it("rejects missing photo placeholder", () => {
    const result = validatePurchaseCartItemInput({
      mainPhotoPlaceholder: "",
      purchaseCost: "10",
      categoryId: null,
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.mainPhotoPlaceholder).toBeDefined();
    }
  });

  it("rejects zero purchase cost", () => {
    const result = validatePurchaseCartItemInput({
      mainPhotoPlaceholder: "photo-front",
      purchaseCost: "0",
      categoryId: null,
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.purchaseCost).toBeDefined();
    }
  });

  it("accepts a valid item without category", () => {
    const result = validatePurchaseCartItemInput({
      mainPhotoPlaceholder: "photo-front",
      purchaseCost: "10",
      categoryId: null,
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value.mainPhotoPlaceholder).toBe("photo-front");
      expect(result.value.purchaseCost).toBe(10);
    }
  });
});

describe("validatePaymentConfirmationInput", () => {
  it("accepts valid confirmation with matching totals", () => {
    const input: PaymentConfirmationInput = {
      evidence: "evidence-ticket",
      paidTotal: "25.00",
      differenceReasonId: "",
      differenceNote: "",
      batchMode: "new",
      existingBatchId: null,
    };

    const result = validatePaymentConfirmationInput(input, 25.0, paymentReasonCatalog);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value.evidence).toBe("evidence-ticket");
      expect(result.value.paidTotal).toBe(25.0);
      expect(result.value.differenceReasonId).toBeNull();
      expect(result.value.differenceNote).toBeNull();
      expect(result.value.batchMode).toBe("new");
      expect(result.value.existingBatchId).toBeNull();
    }
  });

  it("rejects missing evidence", () => {
    const input: PaymentConfirmationInput = {
      evidence: "",
      paidTotal: "20",
      differenceReasonId: "",
      differenceNote: "",
      batchMode: "new",
      existingBatchId: null,
    };

    const result = validatePaymentConfirmationInput(input, 20, paymentReasonCatalog);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.evidence).toBeDefined();
    }
  });

  it("rejects non-positive paid total", () => {
    const input: PaymentConfirmationInput = {
      evidence: "evidence-ticket",
      paidTotal: "0",
      differenceReasonId: "",
      differenceNote: "",
      batchMode: "new",
      existingBatchId: null,
    };

    const result = validatePaymentConfirmationInput(input, 20, paymentReasonCatalog);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.paidTotal).toBeDefined();
    }
  });

  it("requires difference reason when totals differ", () => {
    const input: PaymentConfirmationInput = {
      evidence: "evidence-ticket",
      paidTotal: "30",
      differenceReasonId: "",
      differenceNote: "",
      batchMode: "new",
      existingBatchId: null,
    };

    const result = validatePaymentConfirmationInput(input, 20, paymentReasonCatalog);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.differenceReasonId).toBeDefined();
    }
  });

  it("requires note when reason is Otro", () => {
    const input: PaymentConfirmationInput = {
      evidence: "evidence-ticket",
      paidTotal: "30",
      differenceReasonId: "diff-other",
      differenceNote: "",
      batchMode: "new",
      existingBatchId: null,
    };

    const result = validatePaymentConfirmationInput(input, 20, paymentReasonCatalog);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.differenceNote).toBeDefined();
    }
  });

  it("accepts valid difference reason without note for non-Otro", () => {
    const input: PaymentConfirmationInput = {
      evidence: "evidence-ticket",
      paidTotal: "30",
      differenceReasonId: "diff-discount",
      differenceNote: "",
      batchMode: "new",
      existingBatchId: null,
    };

    const result = validatePaymentConfirmationInput(input, 20, paymentReasonCatalog);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value.differenceReasonId).toBe("diff-discount");
    }
  });

  it("accepts matching totals within epsilon", () => {
    const input: PaymentConfirmationInput = {
      evidence: "evidence-ticket",
      paidTotal: "20.0001",
      differenceReasonId: "",
      differenceNote: "",
      batchMode: "new",
      existingBatchId: null,
    };

    const result = validatePaymentConfirmationInput(input, 20.0005, paymentReasonCatalog);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value.differenceReasonId).toBeNull();
    }
  });

  it("matches user input rounded to 2 decimals even when expectedTotal has extra precision from tax", () => {
    // Simulates tax calculation: 12.99 * 1.0825 = 14.061675
    // User sees "14.06" and enters "14.06"
    const input: PaymentConfirmationInput = {
      evidence: "evidence-ticket",
      paidTotal: "14.06",
      differenceReasonId: "",
      differenceNote: "",
      batchMode: "new",
      existingBatchId: null,
    };

    const result = validatePaymentConfirmationInput(input, 14.061675, paymentReasonCatalog);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value.differenceReasonId).toBeNull();
      expect(result.value.differenceNote).toBeNull();
    }
  });

  it("matches toFixed(2) display when expectedTotal rounds down (10.825 -> 10.82)", () => {
    const input: PaymentConfirmationInput = {
      evidence: "evidence-ticket",
      paidTotal: "10.82",
      differenceReasonId: "",
      differenceNote: "",
      batchMode: "new",
      existingBatchId: null,
    };

    // 10.00 + 10.00 * 8.25% = 10.825
    const result = validatePaymentConfirmationInput(input, 10.825, paymentReasonCatalog);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value.differenceReasonId).toBeNull();
      expect(result.value.differenceNote).toBeNull();
    }
  });

  it("rejects invalid batchMode value", () => {
    const input: PaymentConfirmationInput = {
      evidence: "evidence-ticket",
      paidTotal: "20",
      differenceReasonId: "",
      differenceNote: "",
      batchMode: "invalid",
      existingBatchId: null,
    };

    const result = validatePaymentConfirmationInput(input, 20, paymentReasonCatalog);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.batchMode).toBeDefined();
    }
  });

  it("requires existingBatchId when batchMode is existing", () => {
    const input: PaymentConfirmationInput = {
      evidence: "evidence-ticket",
      paidTotal: "20",
      differenceReasonId: "",
      differenceNote: "",
      batchMode: "existing",
      existingBatchId: null,
    };

    const result = validatePaymentConfirmationInput(input, 20, paymentReasonCatalog);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.existingBatchId).toBeDefined();
    }
  });

  it("accepts existing batch mode with a valid batch id", () => {
    const input: PaymentConfirmationInput = {
      evidence: "evidence-ticket",
      paidTotal: "20",
      differenceReasonId: "",
      differenceNote: "",
      batchMode: "existing",
      existingBatchId: "batch-123",
    };

    const result = validatePaymentConfirmationInput(input, 20, paymentReasonCatalog);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value.batchMode).toBe("existing");
      expect(result.value.existingBatchId).toBe("batch-123");
    }
  });
});
