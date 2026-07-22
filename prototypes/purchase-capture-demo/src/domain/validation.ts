import {
  currencies,
  mainPhotoPlaceholders,
  purchaseEvidenceOptions,
  type DifferenceReason,
  type MainPhotoPlaceholder,
  type NormalizedPaymentConfirmationInput,
  type NormalizedPurchaseCartInput,
  type NormalizedPurchaseCartItemInput,
  type PaymentConfirmationInput,
  type PurchaseCartInput,
  type PurchaseCartItemInput,
  type PurchaseEvidence,
} from "./types";

export type PurchaseCartValidationErrors = Partial<
  Record<keyof PurchaseCartInput, string>
>;

export type PurchaseCartValidationResult =
  | {
      valid: true;
      value: NormalizedPurchaseCartInput;
      errors: PurchaseCartValidationErrors;
    }
  | {
      valid: false;
      errors: PurchaseCartValidationErrors;
    };

export type PurchaseCartItemValidationErrors = Partial<
  Record<keyof PurchaseCartItemInput, string>
>;

export type PurchaseCartItemValidationResult =
  | {
      valid: true;
      value: NormalizedPurchaseCartItemInput;
      errors: PurchaseCartItemValidationErrors;
    }
  | {
      valid: false;
      errors: PurchaseCartItemValidationErrors;
    };

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export class PurchaseCartValidationError extends Error {
  readonly errors: PurchaseCartValidationErrors;

  constructor(errors: PurchaseCartValidationErrors) {
    super("Purchase cart input is invalid.");
    this.name = "PurchaseCartValidationError";
    this.errors = errors;
  }
}

export class PurchaseCartItemValidationError extends Error {
  readonly errors: PurchaseCartItemValidationErrors;

  constructor(errors: PurchaseCartItemValidationErrors) {
    super("Purchase cart item input is invalid.");
    this.name = "PurchaseCartItemValidationError";
    this.errors = errors;
  }
}

export function validatePurchaseCartInput(
  input: PurchaseCartInput,
): PurchaseCartValidationResult {
  const errors: PurchaseCartValidationErrors = {};
  const storeId = input.storeId.trim();
  const date = input.date.trim();
  const currency = input.currency;
  const normalizedCurrency = currencies.find((item) => item === currency);
  const taxRate = parseNumericField(input.taxRate);
  const exchangeRate = parseNullableNumericField(input.exchangeRate);

  if (!storeId) {
    errors.storeId = "Selecciona una tienda.";
  }

  if (!date) {
    errors.date = "Selecciona la fecha de compra.";
  } else if (!datePattern.test(date)) {
    errors.date = "Usa una fecha válida.";
  }

  if (!normalizedCurrency) {
    errors.currency = "Selecciona una moneda.";
  }

  if (taxRate === null) {
    errors.taxRate = "Captura el impuesto.";
  } else if (taxRate < 0) {
    errors.taxRate = "El impuesto no puede ser negativo.";
  }

  if (exchangeRate !== null && exchangeRate <= 0) {
    errors.exchangeRate = "El tipo de cambio debe ser mayor que cero.";
  }

  if (normalizedCurrency === "USD" && exchangeRate === null) {
    errors.exchangeRate = "USD requiere tipo de cambio.";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  if (!normalizedCurrency || taxRate === null) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      storeId,
      date,
      currency: normalizedCurrency,
      taxRate: taxRate ?? 0,
      exchangeRate,
    },
    errors: {},
  };
}

export function validatePurchaseCartItemInput(
  input: PurchaseCartItemInput,
): PurchaseCartItemValidationResult {
  const errors: PurchaseCartItemValidationErrors = {};
  const mainPhotoPlaceholder = input.mainPhotoPlaceholder.trim();
  const purchaseCost = parseNumericField(input.purchaseCost);
  const categoryId = input.categoryId?.trim() || null;

  if (!isMainPhotoPlaceholder(mainPhotoPlaceholder)) {
    errors.mainPhotoPlaceholder = "Selecciona una foto principal del demo.";
  }

  if (purchaseCost === null) {
    errors.purchaseCost = "Captura el costo de compra.";
  } else if (purchaseCost <= 0) {
    errors.purchaseCost = "El costo debe ser mayor que cero.";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  if (!isMainPhotoPlaceholder(mainPhotoPlaceholder) || purchaseCost === null) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      mainPhotoPlaceholder,
      purchaseCost,
      categoryId,
    },
    errors: {},
  };
}

function parseNumericField(value: string | number): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseNullableNumericField(
  value: string | number | null,
): number | null {
  if (value === null) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

// --- v4 Payment Confirmation Validation ---

export type PaymentConfirmationValidationErrors = Partial<
  Record<keyof PaymentConfirmationInput, string>
>;

export type PaymentConfirmationValidationResult =
  | {
      valid: true;
      value: NormalizedPaymentConfirmationInput;
      errors: PaymentConfirmationValidationErrors;
    }
  | {
      valid: false;
      errors: PaymentConfirmationValidationErrors;
    };

export class PaymentConfirmationValidationError extends Error {
  readonly errors: PaymentConfirmationValidationErrors;

  constructor(errors: PaymentConfirmationValidationErrors) {
    super("Payment confirmation input is invalid.");
    this.name = "PaymentConfirmationValidationError";
    this.errors = errors;
  }
}

export function validatePaymentConfirmationInput(
  input: PaymentConfirmationInput,
  expectedTotal: number,
  reasonCatalog: DifferenceReason[],
): PaymentConfirmationValidationResult {
  const errors: PaymentConfirmationValidationErrors = {};
  const evidence = input.evidence.trim();
  const paidTotal = parseNumericField(input.paidTotal);
  const differenceReasonId = input.differenceReasonId?.trim() || null;
  const differenceNote = input.differenceNote?.trim() || null;
  const batchMode = input.batchMode?.trim() || "new";
  const existingBatchId = input.existingBatchId?.trim() || null;

  if (!isPurchaseEvidence(evidence)) {
    errors.evidence = "Selecciona un comprobante de pago.";
  }

  if (paidTotal === null) {
    errors.paidTotal = "Captura el total pagado.";
  } else if (paidTotal <= 0) {
    errors.paidTotal = "El total pagado debe ser mayor que cero.";
  }

  // Use the same rounding as the currency display (toFixed(2)) so that
  // what the user sees is what they can type to match exactly.
  const roundedExpected = Number(expectedTotal.toFixed(2));
  const roundedPaid = paidTotal !== null ? Number(paidTotal.toFixed(2)) : null;
  const totalsDiffer = roundedPaid !== null && Math.abs(roundedPaid - roundedExpected) >= 0.001;

  if (totalsDiffer) {
    if (!differenceReasonId) {
      errors.differenceReasonId = "Selecciona un motivo de diferencia.";
    } else {
      const reason = reasonCatalog.find((r) => r.id === differenceReasonId);
      if (!reason) {
        errors.differenceReasonId = "Selecciona un motivo válido.";
      } else if (reason.requiresNote && !differenceNote) {
        errors.differenceNote = "Describe el motivo de la diferencia.";
      }
    }
  }

  if (batchMode !== "new" && batchMode !== "existing") {
    errors.batchMode = "Selecciona cómo agrupar el pago.";
  }

  if (batchMode === "existing" && !existingBatchId) {
    errors.existingBatchId = "Selecciona un lote existente.";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  if (!isPurchaseEvidence(evidence) || paidTotal === null) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      evidence,
      paidTotal,
      differenceReasonId: totalsDiffer ? differenceReasonId : null,
      differenceNote: totalsDiffer ? differenceNote : null,
      batchMode: batchMode as "existing" | "new",
      existingBatchId: batchMode === "existing" ? existingBatchId : null,
    },
    errors: {},
  };
}

function isPurchaseEvidence(value: string): value is PurchaseEvidence {
  return purchaseEvidenceOptions.some((opt) => opt.id === value);
}

function isMainPhotoPlaceholder(value: string): value is MainPhotoPlaceholder {
  return mainPhotoPlaceholders.some((placeholder) => placeholder.id === value);
}
