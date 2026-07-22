export const currencies = ["USD", "MXN"] as const;

export type Currency = (typeof currencies)[number];

export type CartStatus = "draft";

export const mainPhotoPlaceholders = [
  {
    id: "photo-front",
    label: "Frente",
    description: "Vista principal",
  },
  {
    id: "photo-label",
    label: "Etiqueta",
    description: "Marca o talla",
  },
  {
    id: "photo-texture",
    label: "Textura",
    description: "Tela o detalle",
  },
  {
    id: "photo-shoes",
    label: "Calzado",
    description: "Par o suela",
  },
] as const;

export type MainPhotoPlaceholder = (typeof mainPhotoPlaceholders)[number]["id"];

export type Store = {
  id: string;
  name: string;
  country: "USA" | "MEX";
  defaultTaxRate: number;
  defaultCurrency: Currency;
  active: boolean;
};

export type PurchaseCart = {
  id: string;
  storeId: string;
  storeName: string;
  date: string;
  currency: Currency;
  taxRate: number;
  exchangeRate: number | null;
  status: CartStatus;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  active: boolean;
};

export type PurchaseCartItem = {
  id: string;
  cartId: string;
  captureId: string;
  captureSequence: number;
  mainPhotoPlaceholder: MainPhotoPlaceholder;
  purchaseCost: number;
  categoryId: string | null;
  categoryName: string | null;
  categoryReview: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseCartTotals = {
  itemCount: number;
  subtotal: number;
  tax: number;
  expectedTotal: number;
  mxnEquivalent: number;
};

export type PurchaseCartDetail = PurchaseCart & {
  items: PurchaseCartItem[];
  totals: PurchaseCartTotals;
};

export type PurchaseCartInput = {
  storeId: string;
  date: string;
  currency: Currency | "";
  taxRate: string | number;
  exchangeRate: string | number | null;
};

export type NormalizedPurchaseCartInput = {
  storeId: string;
  date: string;
  currency: Currency;
  taxRate: number;
  exchangeRate: number | null;
};

export type PurchaseCartItemInput = {
  mainPhotoPlaceholder: string;
  purchaseCost: string | number;
  categoryId: string | null;
};

export type NormalizedPurchaseCartItemInput = {
  mainPhotoPlaceholder: MainPhotoPlaceholder;
  purchaseCost: number;
  categoryId: string | null;
};

// --- v4: Payment, Purchase Batch & Acquired Stock ---

export const purchaseEvidenceOptions = [
  { id: "evidence-ticket", label: "Ticket", description: "Ticket de compra" },
  { id: "evidence-invoice", label: "Factura", description: "Factura oficial" },
  { id: "evidence-digital", label: "Digital", description: "Comprobante digital" },
] as const;

export type PurchaseEvidence = (typeof purchaseEvidenceOptions)[number]["id"];

export type InventoryState = "acquired_stock" | "available" | "reserved" | "sold";

export type DifferenceReason = {
  id: string;
  name: string;
  requiresNote: boolean;
};

// --- Payment (1 confirmed cart) ---
export type Payment = {
  id: string;
  batchId: string;
  evidence: PurchaseEvidence;
  taxRate: number;
  exchangeRate: number | null;
  expectedTotal: number;
  paidTotal: number;
  differenceReasonId: string | null;
  differenceNote: string | null;
  garmentCount: number;
  createdAt: string;
};

export type PaymentDetail = Payment & {
  garments: Garment[];
};

// --- Purchase Batch (1 store, 1 day, N payments) ---
export type PurchaseBatch = {
  id: string;
  storeId: string;
  storeName: string;
  date: string;
  currency: Currency;
  paymentCount: number;
  garmentCount: number;
  expectedTotal: number;
  paidTotal: number;
  createdAt: string;
};

export type PurchaseBatchDetail = PurchaseBatch & {
  payments: PaymentDetail[];
};

// --- Garment (belongs to a Payment) ---
export type GarmentRow = {
  id: string;
  payment_id: string;
  cart_item_id: string;
  internal_code: string;
  main_photo_placeholder: MainPhotoPlaceholder;
  purchase_cost: number;
  category_id: string | null;
  category_name: string | null;
  inventory_state: InventoryState;
  created_at: string;
  updated_at: string;
};

export type Garment = {
  id: string;
  paymentId: string;
  cartItemId: string;
  internalCode: string;
  mainPhotoPlaceholder: MainPhotoPlaceholder;
  purchaseCost: number;
  categoryId: string | null;
  categoryName: string | null;
  categoryReview: boolean;
  inventoryState: InventoryState;
  createdAt: string;
  updatedAt: string;
};

// --- Payment Confirmation Input (v4 with batch mode) ---
export type PaymentConfirmationInput = {
  evidence: string;
  paidTotal: string | number;
  differenceReasonId: string;
  differenceNote: string;
  batchMode: string; // "existing" | "new"
  existingBatchId: string | null;
};

export type NormalizedPaymentConfirmationInput = {
  evidence: PurchaseEvidence;
  paidTotal: number;
  differenceReasonId: string | null;
  differenceNote: string | null;
  batchMode: "existing" | "new";
  existingBatchId: string | null;
};
