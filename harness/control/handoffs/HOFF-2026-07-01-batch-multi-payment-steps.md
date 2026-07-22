# NEXO-0002 — Batch+Payment Rewrite: Implementation Steps

> Companion to `HOFF-2026-07-01-purchase-batch-multi-payment.md`.
> For `nexo-build` agent in a clean session.

---

## Phase 1: Schema v4

### 1.1 Bump schema and add `payments` table

In `src/data/purchaseCartRepository.ts`:

```sql
-- Schema v4

-- NEW: payments table (between batches and garments)
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES purchase_batches(id),
  cart_id TEXT NOT NULL UNIQUE,  -- consumed cart, for traceability
  evidence TEXT NOT NULL,
  tax_rate REAL NOT NULL CHECK (tax_rate >= 0),
  exchange_rate REAL,
  expected_total REAL NOT NULL,
  paid_total REAL NOT NULL CHECK (paid_total > 0),
  difference_reason_id TEXT REFERENCES difference_reasons(id),
  difference_note TEXT,
  garment_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

-- MODIFIED: purchase_batches no longer has cart_id UNIQUE
-- Remove cart_id UNIQUE constraint, add store_id + date as batch key
-- purchase_batches becomes: id, store_id, date, currency, created_at

-- MODIFIED: garments now reference payment_id (not batch_id directly)
-- garments.batch_id → garments.payment_id
```

### 1.2 Seed data

Keep stores, categories, difference_reasons. Update demo seed to create:
- 1 batch (Goodwill, today) with 2 payments
- 1 batch (Ross, yesterday) with 1 payment

---

## Phase 2: Domain Types

### 2.1 New types in `types.ts`

```ts
type Payment = {
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

type PurchaseBatch = {
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

type PurchaseBatchDetail = PurchaseBatch & {
  payments: (Payment & { garments: Garment[] })[];
};

type PaymentConfirmationInput = {
  evidence: string;
  paidTotal: string | number;
  differenceReasonId: string;
  differenceNote: string;
  batchMode: 'existing' | 'new';
  existingBatchId: string | null;
};
```

### 2.2 Remove / deprecate

- `PurchaseCartDetail` (batch detail replaces it)
- `PurchaseBatchRow` (old flat row)

---

## Phase 3: Repository Methods

### 3.1 New methods

```ts
// Batch operations (main entity)
listBatches(): PurchaseBatch[]
getBatchDetail(id: string): PurchaseBatchDetail | undefined

// Cart operations (ephemeral tool)
createCart(input: PurchaseCartInput): PurchaseCart
getCartDetail(id: string): { cart, items, totals } | undefined
createCartItem(cartId, input): PurchaseCartItem
updateCartItem(itemId, input): PurchaseCartItem
removeCartItem(itemId): void

// Payment confirmation (the big one)
confirmCartAsBatch(input: PaymentConfirmationInput, cartId: string): PurchaseBatchDetail
  // 1. Validate payment input
  // 2. Find or create batch (by store+date if batchMode='existing')
  // 3. Create payment record
  // 4. Convert cart items → garments (assign internal codes)
  // 5. Delete the cart (ephemeral)
  // 6. Return batch detail

// Acquired stock (unchanged)
listGarments(): Garment[]
listDifferenceReasons(): DifferenceReason[]

// Batch selector helper
listBatchesForStoreDate(storeId: string, date: string): PurchaseBatch[]
  // Returns batches that can receive a new payment (same store, same date)
```

### 3.2 Modified

- `resetDemoData()`: also clear payments + garments + batches
- `seedDemoCarts()`: seed demo batches with payments instead of carts

---

## Phase 4: Zustand Store

### 4.1 Screens

```
'batch-list'        → home screen
'cart-create'       → new cart: select store
'cart-capture'      → capture items (was 'detail')
'cart-item-create'  → add item form
'cart-item-edit'    → edit item form
'payment-confirm'   → confirm payment with batch selector
'batch-detail'      → view batch with payments
'acquired-stock'    → inventory view
```

### 4.2 Key state

```ts
batches: PurchaseBatch[]
selectedBatch?: PurchaseBatchDetail
activeCart?: PurchaseCartDetail  // the ONE cart being captured
draft: PurchaseCartDraft
itemDraft: PurchaseCartItemDraft
paymentDraft: PaymentConfirmationDraft
```

### 4.3 Key actions

```ts
startNewCart()           // screen = 'cart-create', init draft
startCartFromStore(storeId)  // create cart, screen = 'cart-capture'
startConfirmPayment()    // screen = 'payment-confirm'
confirmCartAsBatch()     // call repo, get batch detail, clear cart
viewBatch(batchId)       // load batch detail
deleteActiveCart()       // discard cart without confirming
```

---

## Phase 5: Components

### 5.1 `BatchList.tsx` (NEW — home screen)

- Title: "Lotes de compra"
- Batch cards: store name, date, N payments, N garments, consolidated total
- Empty state: "Sin lotes confirmados"
- Buttons: [+ Nuevo carrito], [Cargar demo], [Reiniciar]
- Batch status pills: "N pagos", "N garments"

### 5.2 `BatchDetail.tsx` (NEW)

- Batch header: store, date, currency
- Section: Payments list
  - Each payment: evidence icon, expected vs paid, diff reason, N garments
- Section: Consolidated totals (sum of payments)
- Section: All garments with internal codes, costs, categories
- Button: [Ver Acquired Stock] → AcquiredStockList
- Button: [+ Nuevo pago en este lote] → starts new cart for same store

### 5.3 `NewCartFlow.tsx` (NEW)

- Step 1: Store selector (only step before cart creation)
- After store selected → create cart → navigate to CartCapture

### 5.4 `CartCapture.tsx` (rewrite of CartDetail)

- Cart header: store name, date, currency, tax, FX
- Item list with add/edit/remove
- Item cards: capture ID, photo placeholder, cost, category/review
- Empty state: "Agrega items..."
- Totals panel: subtotal, tax, expected total, MXN equivalent
- Button: [Confirmar pago] → PaymentConfirmForm
- Button: [Descartar carrito] → confirm, delete cart, back to batch list

### 5.5 `PaymentConfirmForm.tsx` (adapt from v3)

- Evidence selector (keep from v3)
- Paid total input (keep from v3)
- Difference reason + note (keep from v3, conditional)
- **NEW**: Batch selector section
  - If batches exist for store+date: radio or dropdown
    - "Agregar a Goodwill (hoy) — 2 pagos, 5 garments"
    - "Crear nuevo lote"
  - If no batches exist: auto "Crear nuevo lote" (hidden, implicit)
- Confirm button: "Confirmar pago y crear garments"

### 5.6 `AcquiredStockList.tsx` (adapt from v3)

- Add batch context: show which batch each garment belongs to
- Keep blocked-availability indicators for Category Review
- Keep internal code display

---

## Phase 6: App.tsx Routing

```tsx
screen === 'batch-list'        → <BatchList />
screen === 'cart-create'       → <NewCartFlow />
screen === 'cart-capture' && activeCart → <CartCapture />
screen === 'cart-item-create'  → <CartItemForm mode="create" />
screen === 'cart-item-edit'    → <CartItemForm mode="edit" />
screen === 'payment-confirm'   → <PaymentConfirmForm />
screen === 'batch-detail' && selectedBatch → <BatchDetail />
screen === 'acquired-stock'    → <AcquiredStockList />
```

---

## Phase 7: Tests

- Repository: batch creation, payment creation, multi-payment batch, cart deletion after confirm, internal code sequencing across payments
- Validation: payment confirmation with batch selector
- Totals: consolidated batch totals from multiple payments
- Existing cart/item validation tests: keep, adapt as needed

---

## Phase 8: Verification

- `npm run test` — all tests pass
- `npm run build` — clean build
- Vite dev server at `http://127.0.0.1:5174/`
- Manual flow: create cart → add items → confirm payment (new batch) → see batch in list → create another cart same store → confirm → add to existing batch → see 2 payments in batch
