import {
  PaymentConfirmationValidationError,
  PurchaseCartItemValidationError,
  PurchaseCartValidationError,
  validatePaymentConfirmationInput,
  validatePurchaseCartItemInput,
  validatePurchaseCartInput,
} from "../domain/validation";
import { calculateBatchConsolidatedTotals, calculatePurchaseCartTotals } from "../domain/cartTotals";
import type {
  Category,
  Currency,
  DifferenceReason,
  Garment,
  GarmentRow,
  InventoryState,
  Payment,
  PaymentConfirmationInput,
  PaymentDetail,
  PurchaseBatch,
  PurchaseBatchDetail,
  PurchaseCart,
  PurchaseCartDetail,
  PurchaseCartInput,
  PurchaseCartItem,
  PurchaseCartItemInput,
  Store,
} from "../domain/types";
import type { SqlDatabase } from "./sqlDatabase";

type StoreRow = {
  id: string;
  name: string;
  country: "USA" | "MEX";
  default_tax_rate: number;
  default_currency: Currency;
  active: 0 | 1;
};

type PurchaseCartRow = {
  id: string;
  store_id: string;
  store_name: string;
  date: string;
  currency: Currency;
  tax_rate: number;
  exchange_rate: number | null;
  status: "draft";
  created_at: string;
  updated_at: string;
};

type CategoryRow = {
  id: string;
  name: string;
  active: 0 | 1;
};

type PurchaseCartItemRow = {
  id: string;
  cart_id: string;
  capture_id: string;
  capture_sequence: number;
  main_photo_placeholder: PurchaseCartItem["mainPhotoPlaceholder"];
  purchase_cost: number;
  category_id: string | null;
  category_name: string | null;
  created_at: string;
  updated_at: string;
};

type PaymentRow = {
  id: string;
  batch_id: string;
  cart_id: string;
  evidence: string;
  tax_rate: number;
  exchange_rate: number | null;
  expected_total: number;
  paid_total: number;
  difference_reason_id: string | null;
  difference_reason_name: string | null;
  difference_note: string | null;
  garment_count: number;
  created_at: string;
};

type PurchaseBatchRow = {
  id: string;
  store_id: string;
  store_name: string;
  date: string;
  currency: Currency;
  created_at: string;
};

export const schemaVersion = 4;

export const seededStores: Store[] = [
  {
    id: "store-goodwill",
    name: "Goodwill",
    country: "USA",
    defaultTaxRate: 8.25,
    defaultCurrency: "USD",
    active: true,
  },
  {
    id: "store-burlington",
    name: "Burlington",
    country: "USA",
    defaultTaxRate: 8.25,
    defaultCurrency: "USD",
    active: true,
  },
  {
    id: "store-ross",
    name: "Ross",
    country: "USA",
    defaultTaxRate: 8.25,
    defaultCurrency: "USD",
    active: true,
  },
  {
    id: "store-salvation-army",
    name: "Salvation Army",
    country: "USA",
    defaultTaxRate: 7.75,
    defaultCurrency: "USD",
    active: true,
  },
];

export const seededCategories: Category[] = [
  { id: "cat-tops", name: "Tops", active: true },
  { id: "cat-bottoms", name: "Bottoms", active: true },
  { id: "cat-dresses", name: "Dresses", active: true },
  { id: "cat-outerwear", name: "Outerwear", active: true },
  { id: "cat-shoes", name: "Shoes", active: true },
  { id: "cat-accessories", name: "Accessories", active: true },
];

export const storePrefixes: Record<string, string> = {
  "store-goodwill": "GW",
  "store-burlington": "BUR",
  "store-ross": "ROS",
  "store-salvation-army": "SAL",
};

export const seededDifferenceReasons: DifferenceReason[] = [
  { id: "diff-discount", name: "Descuento", requiresNote: false },
  { id: "diff-rounding", name: "Redondeo", requiresNote: false },
  { id: "diff-extra-tax", name: "Impuesto adicional", requiresNote: false },
  { id: "diff-other", name: "Otro", requiresNote: true },
];

export class PurchaseCartRepository {
  constructor(
    private readonly database: SqlDatabase,
    private readonly options: {
      idFactory?: () => string;
      itemIdFactory?: () => string;
      clock?: () => Date;
    } = {},
  ) {}

  initialize(): void {
    this.database.transaction(() => {
      this.database.exec(`CREATE TABLE IF NOT EXISTS demo_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );`);

      // Migrate from v3 → v4: drop tables that changed schema
      const currentVersion = this.database.selectValue<string>(
        "SELECT value FROM demo_meta WHERE key = 'schema_version'",
      );

      if (currentVersion && Number(currentVersion) < 4) {
        this.database.exec(`
          DROP TABLE IF EXISTS garments;
          DROP TABLE IF EXISTS payments;
          DROP TABLE IF EXISTS purchase_batches;
        `);
      }

      this.database.exec(`
        CREATE TABLE IF NOT EXISTS stores (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          country TEXT NOT NULL,
          default_tax_rate REAL NOT NULL CHECK (default_tax_rate >= 0),
          default_currency TEXT NOT NULL CHECK (default_currency IN ('USD', 'MXN')),
          active INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS purchase_carts (
          id TEXT PRIMARY KEY,
          store_id TEXT NOT NULL REFERENCES stores(id),
          date TEXT NOT NULL,
          currency TEXT NOT NULL CHECK (currency IN ('USD', 'MXN')),
          tax_rate REAL NOT NULL CHECK (tax_rate >= 0),
          exchange_rate REAL,
          status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft')),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_purchase_carts_updated_at
          ON purchase_carts(updated_at DESC);

        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          active INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS purchase_cart_items (
          id TEXT PRIMARY KEY,
          cart_id TEXT NOT NULL REFERENCES purchase_carts(id),
          capture_id TEXT NOT NULL,
          capture_sequence INTEGER NOT NULL CHECK (capture_sequence > 0),
          main_photo_placeholder TEXT NOT NULL,
          purchase_cost REAL NOT NULL CHECK (purchase_cost > 0),
          category_id TEXT REFERENCES categories(id),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE (cart_id, capture_id),
          UNIQUE (cart_id, capture_sequence)
        );

        CREATE INDEX IF NOT EXISTS idx_purchase_cart_items_cart_id
          ON purchase_cart_items(cart_id, capture_sequence ASC);

        CREATE TABLE IF NOT EXISTS difference_reasons (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          requires_note INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS purchase_batches (
          id TEXT PRIMARY KEY,
          store_id TEXT NOT NULL,
          date TEXT NOT NULL,
          currency TEXT NOT NULL CHECK (currency IN ('USD', 'MXN')),
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS payments (
          id TEXT PRIMARY KEY,
          batch_id TEXT NOT NULL REFERENCES purchase_batches(id),
          cart_id TEXT NOT NULL UNIQUE,
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

        CREATE INDEX IF NOT EXISTS idx_payments_batch_id
          ON payments(batch_id);

        CREATE TABLE IF NOT EXISTS garments (
          id TEXT PRIMARY KEY,
          payment_id TEXT NOT NULL REFERENCES payments(id),
          cart_item_id TEXT NOT NULL UNIQUE REFERENCES purchase_cart_items(id),
          internal_code TEXT NOT NULL UNIQUE,
          main_photo_placeholder TEXT NOT NULL,
          purchase_cost REAL NOT NULL CHECK (purchase_cost > 0),
          category_id TEXT REFERENCES categories(id),
          inventory_state TEXT NOT NULL DEFAULT 'acquired_stock'
            CHECK (inventory_state IN ('acquired_stock', 'available', 'reserved', 'sold')),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_garments_payment_id
          ON garments(payment_id);
        CREATE INDEX IF NOT EXISTS idx_garments_internal_code
          ON garments(internal_code);
      `);
      this.ensureCartCaptureSequenceColumn();
      this.seedStores();
      this.seedCategories();
      this.seedDifferenceReasons();
      this.syncNextCaptureSequences();
      this.database.run(
        `INSERT INTO demo_meta (key, value)
         VALUES ('schema_version', $schemaVersion)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        { $schemaVersion: String(schemaVersion) },
      );
    });
  }

  // --- Store & Category accessors (unchanged) ---

  listStores(): Store[] {
    return this.database
      .selectObjects<StoreRow>(
        `SELECT id, name, country, default_tax_rate, default_currency, active
         FROM stores
         WHERE active = 1
         ORDER BY name ASC`,
      )
      .map(mapStore);
  }

  listCategories(): Category[] {
    return this.database
      .selectObjects<CategoryRow>(
        `SELECT id, name, active
         FROM categories
         WHERE active = 1
         ORDER BY name ASC`,
      )
      .map(mapCategory);
  }

  listDifferenceReasons(): DifferenceReason[] {
    return this.database
      .selectObjects<{ id: string; name: string; requires_note: 0 | 1 }>(
        `SELECT id, name, requires_note
         FROM difference_reasons
         ORDER BY id ASC`,
      )
      .map((r) => ({
        id: r.id,
        name: r.name,
        requiresNote: r.requires_note === 1,
      }));
  }

  // --- Cart operations (ephemeral tool, mostly unchanged) ---

  listCarts(): PurchaseCart[] {
    return this.database
      .selectObjects<PurchaseCartRow>(
        `SELECT
          pc.id,
          pc.store_id,
          s.name AS store_name,
          pc.date,
          pc.currency,
          pc.tax_rate,
          pc.exchange_rate,
          pc.status,
          pc.created_at,
          pc.updated_at
        FROM purchase_carts pc
        JOIN stores s ON s.id = pc.store_id
        ORDER BY pc.updated_at DESC, pc.created_at DESC`,
      )
      .map(mapPurchaseCart);
  }

  getCart(id: string): PurchaseCart | undefined {
    const row = this.database.selectObject<PurchaseCartRow>(
      `SELECT
        pc.id,
        pc.store_id,
        s.name AS store_name,
        pc.date,
        pc.currency,
        pc.tax_rate,
        pc.exchange_rate,
        pc.status,
        pc.created_at,
        pc.updated_at
       FROM purchase_carts pc
       JOIN stores s ON s.id = pc.store_id
       WHERE pc.id = $id`,
      { $id: id },
    );

    return row ? mapPurchaseCart(row) : undefined;
  }

  getCartDetail(id: string): PurchaseCartDetail | undefined {
    const cart = this.getCart(id);

    if (!cart) {
      return undefined;
    }

    const items = this.listCartItems(id);

    return {
      ...cart,
      items,
      totals: calculatePurchaseCartTotals(cart, items),
    };
  }

  listCartItems(cartId: string): PurchaseCartItem[] {
    return this.database
      .selectObjects<PurchaseCartItemRow>(
        `SELECT
          pci.id,
          pci.cart_id,
          pci.capture_id,
          pci.capture_sequence,
          pci.main_photo_placeholder,
          pci.purchase_cost,
          pci.category_id,
          c.name AS category_name,
          pci.created_at,
          pci.updated_at
        FROM purchase_cart_items pci
        LEFT JOIN categories c ON c.id = pci.category_id
        WHERE pci.cart_id = $cartId
        ORDER BY pci.capture_sequence ASC`,
        { $cartId: cartId },
      )
      .map(mapPurchaseCartItem);
  }

  createCart(input: PurchaseCartInput): PurchaseCart {
    const normalized = this.normalizeAndValidate(input);
    const id = this.createCartId();
    const now = this.now();

    this.database.run(
      `INSERT INTO purchase_carts (
        id,
        store_id,
        date,
        currency,
        tax_rate,
        exchange_rate,
        status,
        created_at,
        updated_at
      ) VALUES (
        $id,
        $storeId,
        $date,
        $currency,
        $taxRate,
        $exchangeRate,
        'draft',
        $createdAt,
        $updatedAt
      )`,
      {
        $id: id,
        $storeId: normalized.storeId,
        $date: normalized.date,
        $currency: normalized.currency,
        $taxRate: normalized.taxRate,
        $exchangeRate: normalized.exchangeRate,
        $createdAt: now,
        $updatedAt: now,
      },
    );

    const cart = this.getCart(id);
    if (!cart) {
      throw new Error("Created purchase cart could not be loaded.");
    }

    return cart;
  }

  updateCart(id: string, input: PurchaseCartInput): PurchaseCart {
    const normalized = this.normalizeAndValidate(input);
    const existing = this.getCart(id);

    if (!existing) {
      throw new Error("No se encontró el carrito.");
    }

    this.database.run(
      `UPDATE purchase_carts
       SET
        store_id = $storeId,
        date = $date,
        currency = $currency,
        tax_rate = $taxRate,
        exchange_rate = $exchangeRate,
        updated_at = $updatedAt
       WHERE id = $id`,
      {
        $id: id,
        $storeId: normalized.storeId,
        $date: normalized.date,
        $currency: normalized.currency,
        $taxRate: normalized.taxRate,
        $exchangeRate: normalized.exchangeRate,
        $updatedAt: this.now(),
      },
    );

    const cart = this.getCart(id);
    if (!cart) {
      throw new Error("Updated purchase cart could not be loaded.");
    }

    return cart;
  }

  createCartItem(cartId: string, input: PurchaseCartItemInput): PurchaseCartItem {
    const normalized = this.normalizeAndValidateItem(input);
    const existingCart = this.getCart(cartId);

    if (!existingCart) {
      throw new Error("No se encontró el carrito.");
    }

    this.assertCategoryExists(normalized.categoryId);

    let itemId = "";

    this.database.transaction(() => {
      const sequence = this.database.selectValue<number>(
        `SELECT next_capture_sequence
         FROM purchase_carts
         WHERE id = $cartId`,
        { $cartId: cartId },
      );

      if (!sequence || sequence < 1) {
        throw new Error("No se pudo generar Capture ID.");
      }

      const now = this.now();
      itemId = this.createItemId();

      this.database.run(
        `INSERT INTO purchase_cart_items (
          id,
          cart_id,
          capture_id,
          capture_sequence,
          main_photo_placeholder,
          purchase_cost,
          category_id,
          created_at,
          updated_at
        ) VALUES (
          $id,
          $cartId,
          $captureId,
          $captureSequence,
          $mainPhotoPlaceholder,
          $purchaseCost,
          $categoryId,
          $createdAt,
          $updatedAt
        )`,
        {
          $id: itemId,
          $cartId: cartId,
          $captureId: formatCaptureId(sequence),
          $captureSequence: sequence,
          $mainPhotoPlaceholder: normalized.mainPhotoPlaceholder,
          $purchaseCost: normalized.purchaseCost,
          $categoryId: normalized.categoryId,
          $createdAt: now,
          $updatedAt: now,
        },
      );

      this.database.run(
        `UPDATE purchase_carts
         SET next_capture_sequence = $nextCaptureSequence,
             updated_at = $updatedAt
         WHERE id = $cartId`,
        {
          $cartId: cartId,
          $nextCaptureSequence: sequence + 1,
          $updatedAt: now,
        },
      );
    });

    const item = this.getCartItem(itemId);
    if (!item) {
      throw new Error("Created purchase cart item could not be loaded.");
    }

    return item;
  }

  updateCartItem(
    itemId: string,
    input: PurchaseCartItemInput,
  ): PurchaseCartItem {
    const existingItem = this.getCartItem(itemId);

    if (!existingItem) {
      throw new Error("No se encontró el item del carrito.");
    }

    const normalized = this.normalizeAndValidateItem(input);
    this.assertCategoryExists(normalized.categoryId);

    this.database.transaction(() => {
      const now = this.now();

      this.database.run(
        `UPDATE purchase_cart_items
         SET
          main_photo_placeholder = $mainPhotoPlaceholder,
          purchase_cost = $purchaseCost,
          category_id = $categoryId,
          updated_at = $updatedAt
         WHERE id = $id`,
        {
          $id: itemId,
          $mainPhotoPlaceholder: normalized.mainPhotoPlaceholder,
          $purchaseCost: normalized.purchaseCost,
          $categoryId: normalized.categoryId,
          $updatedAt: now,
        },
      );

      this.touchCart(existingItem.cartId, now);
    });

    const item = this.getCartItem(itemId);
    if (!item) {
      throw new Error("Updated purchase cart item could not be loaded.");
    }

    return item;
  }

  removeCartItem(itemId: string): void {
    const existingItem = this.getCartItem(itemId);

    if (!existingItem) {
      throw new Error("No se encontró el item del carrito.");
    }

    this.database.transaction(() => {
      const now = this.now();

      this.database.run("DELETE FROM purchase_cart_items WHERE id = $id", {
        $id: itemId,
      });

      this.touchCart(existingItem.cartId, now);
    });
  }

  deleteCart(cartId: string): void {
    const existingCart = this.getCart(cartId);

    if (!existingCart) {
      throw new Error("No se encontró el carrito.");
    }

    this.database.transaction(() => {
      this.database.run("DELETE FROM purchase_cart_items WHERE cart_id = $cartId", {
        $cartId: cartId,
      });
      this.database.run("DELETE FROM purchase_carts WHERE id = $cartId", {
        $cartId: cartId,
      });
    });
  }

  // --- Batch operations (v4: batch-centric) ---

  listBatches(): PurchaseBatch[] {
    const batchRows = this.database
      .selectObjects<PurchaseBatchRow>(
        `SELECT
          pb.id,
          pb.store_id,
          s.name AS store_name,
          pb.date,
          pb.currency,
          pb.created_at
         FROM purchase_batches pb
         JOIN stores s ON s.id = pb.store_id
         ORDER BY pb.created_at DESC`,
      );

    return batchRows.map((row) => {
      const paymentCount = this.database.selectValue<number>(
        "SELECT COUNT(*) FROM payments WHERE batch_id = $batchId",
        { $batchId: row.id },
      ) ?? 0;

      const payments = this.listBatchPayments(row.id);
      const totals = calculateBatchConsolidatedTotals(payments);

      return {
        id: row.id,
        storeId: row.store_id,
        storeName: row.store_name,
        date: row.date,
        currency: row.currency,
        paymentCount: totals.paymentCount,
        garmentCount: totals.garmentCount,
        expectedTotal: totals.expectedTotal,
        paidTotal: totals.paidTotal,
        createdAt: row.created_at,
      };
    });
  }

  getBatchDetail(id: string): PurchaseBatchDetail | undefined {
    const batchRow = this.database.selectObject<PurchaseBatchRow>(
      `SELECT
        pb.id,
        pb.store_id,
        s.name AS store_name,
        pb.date,
        pb.currency,
        pb.created_at
       FROM purchase_batches pb
       JOIN stores s ON s.id = pb.store_id
       WHERE pb.id = $id`,
      { $id: id },
    );

    if (!batchRow) return undefined;

    const payments = this.listBatchPayments(batchRow.id);
    const totals = calculateBatchConsolidatedTotals(payments);

    return {
      id: batchRow.id,
      storeId: batchRow.store_id,
      storeName: batchRow.store_name,
      date: batchRow.date,
      currency: batchRow.currency,
      paymentCount: totals.paymentCount,
      garmentCount: totals.garmentCount,
      expectedTotal: totals.expectedTotal,
      paidTotal: totals.paidTotal,
      createdAt: batchRow.created_at,
      payments,
    };
  }

  listBatchesForStoreDate(storeId: string, date: string): PurchaseBatch[] {
    const batchRows = this.database
      .selectObjects<PurchaseBatchRow>(
        `SELECT
          pb.id,
          pb.store_id,
          s.name AS store_name,
          pb.date,
          pb.currency,
          pb.created_at
         FROM purchase_batches pb
         JOIN stores s ON s.id = pb.store_id
         WHERE pb.store_id = $storeId AND pb.date = $date
         ORDER BY pb.created_at ASC`,
        { $storeId: storeId, $date: date },
      );

    return batchRows.map((row) => {
      const paymentCount = this.database.selectValue<number>(
        "SELECT COUNT(*) FROM payments WHERE batch_id = $batchId",
        { $batchId: row.id },
      ) ?? 0;

      const payments = this.listBatchPayments(row.id);
      const totals = calculateBatchConsolidatedTotals(payments);

      return {
        id: row.id,
        storeId: row.store_id,
        storeName: row.store_name,
        date: row.date,
        currency: row.currency,
        paymentCount: totals.paymentCount,
        garmentCount: totals.garmentCount,
        expectedTotal: totals.expectedTotal,
        paidTotal: totals.paidTotal,
        createdAt: row.created_at,
      };
    });
  }

  private listBatchPayments(batchId: string): PaymentDetail[] {
    const paymentRows = this.database
      .selectObjects<PaymentRow>(
        `SELECT
          p.id,
          p.batch_id,
          p.cart_id,
          p.evidence,
          p.tax_rate,
          p.exchange_rate,
          p.expected_total,
          p.paid_total,
          p.difference_reason_id,
          dr.name AS difference_reason_name,
          p.difference_note,
          p.garment_count,
          p.created_at
         FROM payments p
         LEFT JOIN difference_reasons dr ON dr.id = p.difference_reason_id
         WHERE p.batch_id = $batchId
         ORDER BY p.created_at ASC`,
        { $batchId: batchId },
      );

    return paymentRows.map((pRow) => {
      const garments = this.listPaymentGarments(pRow.id);
      return {
        id: pRow.id,
        batchId: pRow.batch_id,
        evidence: pRow.evidence as Payment["evidence"],
        taxRate: pRow.tax_rate,
        exchangeRate: pRow.exchange_rate,
        expectedTotal: pRow.expected_total,
        paidTotal: pRow.paid_total,
        differenceReasonId: pRow.difference_reason_id,
        differenceNote: pRow.difference_note,
        garmentCount: pRow.garment_count,
        createdAt: pRow.created_at,
        garments,
      };
    });
  }

  // --- Garment / Acquired Stock ---

  listGarments(): Garment[] {
    return this.database
      .selectObjects<GarmentRow>(
        `SELECT
          g.id,
          g.payment_id,
          g.cart_item_id,
          g.internal_code,
          g.main_photo_placeholder,
          g.purchase_cost,
          g.category_id,
          c.name AS category_name,
          g.inventory_state,
          g.created_at,
          g.updated_at
         FROM garments g
         LEFT JOIN categories c ON c.id = g.category_id
         ORDER BY g.created_at DESC`,
      )
      .map(mapGarment);
  }

  private listPaymentGarments(paymentId: string): Garment[] {
    return this.database
      .selectObjects<GarmentRow>(
        `SELECT
          g.id,
          g.payment_id,
          g.cart_item_id,
          g.internal_code,
          g.main_photo_placeholder,
          g.purchase_cost,
          g.category_id,
          c.name AS category_name,
          g.inventory_state,
          g.created_at,
          g.updated_at
         FROM garments g
         LEFT JOIN categories c ON c.id = g.category_id
         WHERE g.payment_id = $paymentId
         ORDER BY g.internal_code ASC`,
        { $paymentId: paymentId },
      )
      .map(mapGarment);
  }

  // --- Payment Confirmation (v4: batch-aware, ephemeral cart) ---

  confirmCartAsBatch(
    cartId: string,
    input: PaymentConfirmationInput,
  ): PurchaseBatchDetail {
    const cart = this.getCartDetail(cartId);
    if (!cart) {
      throw new Error("No se encontró el carrito para confirmar.");
    }

    if (cart.items.length === 0) {
      throw new Error("El carrito no tiene items para confirmar.");
    }

    const reasonCatalog = this.listDifferenceReasons();
    const validation = validatePaymentConfirmationInput(
      input,
      cart.totals.expectedTotal,
      reasonCatalog,
    );

    if (!validation.valid) {
      throw new PaymentConfirmationValidationError(validation.errors);
    }

    const normalized = validation.value;
    const storePrefix =
      storePrefixes[cart.storeId] ?? cart.storeId.slice(0, 3).toUpperCase();

    let batchId = "";

    this.database.transaction(() => {
      const now = this.now();

      // Reuse or create batch
      if (
        normalized.batchMode === "existing" &&
        normalized.existingBatchId
      ) {
        const batchExists = this.database.selectValue<number>(
          "SELECT 1 FROM purchase_batches WHERE id = $id",
          { $id: normalized.existingBatchId },
        );

        if (!batchExists) {
          throw new Error("El lote seleccionado ya no existe.");
        }

        batchId = normalized.existingBatchId;
      } else if (normalized.batchMode === "new") {
        // Always create a new batch
        batchId = this.createBatchId();
        this.database.run(
          `INSERT INTO purchase_batches (
            id, store_id, date, currency, created_at
          ) VALUES (
            $id, $storeId, $date, $currency, $createdAt
          )`,
          {
            $id: batchId,
            $storeId: cart.storeId,
            $date: cart.date,
            $currency: cart.currency,
            $createdAt: now,
          },
        );
      } else {
        // Find or create batch for store+date (auto mode)
        const existingBatch = this.database.selectValue<string>(
          `SELECT id FROM purchase_batches
           WHERE store_id = $storeId AND date = $date
           ORDER BY created_at ASC LIMIT 1`,
          { $storeId: cart.storeId, $date: cart.date },
        );

        if (existingBatch) {
          batchId = existingBatch;
        } else {
          batchId = this.createBatchId();
          this.database.run(
            `INSERT INTO purchase_batches (
              id, store_id, date, currency, created_at
            ) VALUES (
              $id, $storeId, $date, $currency, $createdAt
            )`,
            {
              $id: batchId,
              $storeId: cart.storeId,
              $date: cart.date,
              $currency: cart.currency,
              $createdAt: now,
            },
          );
        }
      }

      // Create payment
      const paymentId = this.createPaymentId();

      this.database.run(
        `INSERT INTO payments (
          id,
          batch_id,
          cart_id,
          evidence,
          tax_rate,
          exchange_rate,
          expected_total,
          paid_total,
          difference_reason_id,
          difference_note,
          garment_count,
          created_at
        ) VALUES (
          $id,
          $batchId,
          $cartId,
          $evidence,
          $taxRate,
          $exchangeRate,
          $expectedTotal,
          $paidTotal,
          $differenceReasonId,
          $differenceNote,
          $garmentCount,
          $createdAt
        )`,
        {
          $id: paymentId,
          $batchId: batchId,
          $cartId: cartId,
          $evidence: normalized.evidence,
          $taxRate: cart.taxRate,
          $exchangeRate: cart.exchangeRate,
          $expectedTotal: cart.totals.expectedTotal,
          $paidTotal: normalized.paidTotal,
          $differenceReasonId: normalized.differenceReasonId,
          $differenceNote: normalized.differenceNote,
          $garmentCount: cart.items.length,
          $createdAt: now,
        },
      );

      // Convert cart items → garments
      for (const item of cart.items) {
        const internalCode = this.nextInternalCode(storePrefix);

        this.database.run(
          `INSERT INTO garments (
            id,
            payment_id,
            cart_item_id,
            internal_code,
            main_photo_placeholder,
            purchase_cost,
            category_id,
            inventory_state,
            created_at,
            updated_at
          ) VALUES (
            $id,
            $paymentId,
            $cartItemId,
            $internalCode,
            $mainPhotoPlaceholder,
            $purchaseCost,
            $categoryId,
            'acquired_stock',
            $createdAt,
            $updatedAt
          )`,
          {
            $id: this.createGarmentId(),
            $paymentId: paymentId,
            $cartItemId: item.id,
            $internalCode: internalCode,
            $mainPhotoPlaceholder: item.mainPhotoPlaceholder,
            $purchaseCost: item.purchaseCost,
            $categoryId: item.categoryId,
            $createdAt: now,
            $updatedAt: now,
          },
        );
      }

      // Delete the ephemeral cart
      this.database.run("DELETE FROM purchase_cart_items WHERE cart_id = $cartId", {
        $cartId: cartId,
      });
      this.database.run("DELETE FROM purchase_carts WHERE id = $cartId", {
        $cartId: cartId,
      });
    });

    const batch = this.getBatchDetail(batchId);
    if (!batch) {
      throw new Error("Batch creado no se pudo cargar.");
    }

    return batch;
  }

  // --- Seed / Reset ---

  seedDemoBatches(): PurchaseBatch[] {
    const today = toDateInput(this.options.clock?.() ?? new Date());
    const yesterday = addDays(today, -1);
    const now = this.now();

    this.database.transaction(() => {
      // Create temp carts, confirm them into batches, then delete carts
      // Goodwill batch today with 2 payments
      const cart1Id = "cart-demo-gw-pay1";
      const cart2Id = "cart-demo-gw-pay2";
      const rossCartId = "cart-demo-ross-pay1";

      this.upsertDemoCart({
        id: cart1Id,
        storeId: "store-goodwill",
        date: today,
        currency: "USD",
        taxRate: 8.25,
        exchangeRate: 18.25,
        now,
      });
      this.seedDemoItemsIfEmpty(cart1Id, [
        { mainPhotoPlaceholder: "photo-front", purchaseCost: 12.99, categoryId: "cat-tops" },
        { mainPhotoPlaceholder: "photo-label", purchaseCost: 8.5, categoryId: null },
      ]);

      this.upsertDemoCart({
        id: cart2Id,
        storeId: "store-goodwill",
        date: today,
        currency: "USD",
        taxRate: 8.25,
        exchangeRate: 18.30,
        now,
      });
      this.seedDemoItemsIfEmpty(cart2Id, [
        { mainPhotoPlaceholder: "photo-shoes", purchaseCost: 21.75, categoryId: "cat-shoes" },
      ]);

      this.upsertDemoCart({
        id: rossCartId,
        storeId: "store-ross",
        date: yesterday,
        currency: "USD",
        taxRate: 8.25,
        exchangeRate: 18.25,
        now,
      });
      this.seedDemoItemsIfEmpty(rossCartId, [
        { mainPhotoPlaceholder: "photo-shoes", purchaseCost: 15.0, categoryId: "cat-accessories" },
      ]);

      // Confirm each cart into batches
      this.confirmCartDirect(cart1Id, { batchMode: "new", existingBatchId: null }, now);
      this.confirmCartDirect(cart2Id, { batchMode: "existing", existingBatchId: null }, now);
      this.confirmCartDirect(rossCartId, { batchMode: "new", existingBatchId: null }, now);
    });

    return this.listBatches();
  }

  resetDemoData(): void {
    this.database.transaction(() => {
      this.database.run("DELETE FROM garments");
      this.database.run("DELETE FROM payments");
      this.database.run("DELETE FROM purchase_batches");
      this.database.run("DELETE FROM purchase_cart_items");
      this.database.run("DELETE FROM purchase_carts");
      this.seedStores();
      this.seedCategories();
      this.seedDifferenceReasons();
      this.database.run(
        `INSERT INTO demo_meta (key, value)
         VALUES ('last_reset_at', $lastResetAt)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        { $lastResetAt: this.now() },
      );
    });
  }

  // --- Private helpers ---

  private confirmCartDirect(
    cartId: string,
    options: { batchMode: "new" | "existing"; existingBatchId: string | null },
    now: string,
  ): void {
    const cart = this.getCartDetail(cartId);
    if (!cart || cart.items.length === 0) return;

    const storePrefix =
      storePrefixes[cart.storeId] ?? cart.storeId.slice(0, 3).toUpperCase();

    let batchId = "";

    // Find or create batch
    if (options.batchMode === "existing") {
      const existingBatch = this.database.selectValue<string>(
        `SELECT id FROM purchase_batches
         WHERE store_id = $storeId AND date = $date
         ORDER BY created_at ASC LIMIT 1`,
        { $storeId: cart.storeId, $date: cart.date },
      );
      if (existingBatch) {
        batchId = existingBatch;
      }
    }

    if (!batchId) {
      const existingBatch = this.database.selectValue<string>(
        `SELECT id FROM purchase_batches
         WHERE store_id = $storeId AND date = $date
         ORDER BY created_at ASC LIMIT 1`,
        { $storeId: cart.storeId, $date: cart.date },
      );

      if (existingBatch) {
        batchId = existingBatch;
      } else {
        batchId = this.createBatchId();
        this.database.run(
          `INSERT INTO purchase_batches (
            id, store_id, date, currency, created_at
          ) VALUES (
            $id, $storeId, $date, $currency, $createdAt
          )`,
          {
            $id: batchId,
            $storeId: cart.storeId,
            $date: cart.date,
            $currency: cart.currency,
            $createdAt: now,
          },
        );
      }
    }

    // Create payment
    const paymentId = this.createPaymentId();
    this.database.run(
      `INSERT INTO payments (
        id, batch_id, cart_id, evidence, tax_rate, exchange_rate,
        expected_total, paid_total, difference_reason_id, difference_note,
        garment_count, created_at
      ) VALUES (
        $id, $batchId, $cartId, $evidence, $taxRate, $exchangeRate,
        $expectedTotal, $paidTotal, $differenceReasonId, $differenceNote,
        $garmentCount, $createdAt
      )`,
      {
        $id: paymentId,
        $batchId: batchId,
        $cartId: cartId,
        $evidence: "evidence-ticket",
        $taxRate: cart.taxRate,
        $exchangeRate: cart.exchangeRate,
        $expectedTotal: cart.totals.expectedTotal,
        $paidTotal: cart.totals.expectedTotal,
        $differenceReasonId: null,
        $differenceNote: null,
        $garmentCount: cart.items.length,
        $createdAt: now,
      },
    );

    // Create garments
    for (const item of cart.items) {
      const internalCode = this.nextInternalCode(storePrefix);
      this.database.run(
        `INSERT INTO garments (
          id, payment_id, cart_item_id, internal_code,
          main_photo_placeholder, purchase_cost, category_id,
          inventory_state, created_at, updated_at
        ) VALUES (
          $id, $paymentId, $cartItemId, $internalCode,
          $mainPhotoPlaceholder, $purchaseCost, $categoryId,
          'acquired_stock', $createdAt, $updatedAt
        )`,
        {
          $id: this.createGarmentId(),
          $paymentId: paymentId,
          $cartItemId: item.id,
          $internalCode: internalCode,
          $mainPhotoPlaceholder: item.mainPhotoPlaceholder,
          $purchaseCost: item.purchaseCost,
          $categoryId: item.categoryId,
          $createdAt: now,
          $updatedAt: now,
        },
      );
    }

    // Delete the cart
    this.database.run("DELETE FROM purchase_cart_items WHERE cart_id = $cartId", {
      $cartId: cartId,
    });
    this.database.run("DELETE FROM purchase_carts WHERE id = $cartId", {
      $cartId: cartId,
    });
  }

  private normalizeAndValidate(input: PurchaseCartInput) {
    const validation = validatePurchaseCartInput(input);

    if (!validation.valid) {
      throw new PurchaseCartValidationError(validation.errors);
    }

    const storeExists = this.database.selectValue<number>(
      "SELECT 1 FROM stores WHERE id = $storeId AND active = 1",
      { $storeId: validation.value.storeId },
    );

    if (!storeExists) {
      throw new PurchaseCartValidationError({
        storeId: "Selecciona una tienda válida.",
      });
    }

    return validation.value;
  }

  private normalizeAndValidateItem(input: PurchaseCartItemInput) {
    const validation = validatePurchaseCartItemInput(input);

    if (!validation.valid) {
      throw new PurchaseCartItemValidationError(validation.errors);
    }

    return validation.value;
  }

  private assertCategoryExists(categoryId: string | null): void {
    if (!categoryId) {
      return;
    }

    const categoryExists = this.database.selectValue<number>(
      "SELECT 1 FROM categories WHERE id = $categoryId AND active = 1",
      { $categoryId: categoryId },
    );

    if (!categoryExists) {
      throw new PurchaseCartItemValidationError({
        categoryId: "Selecciona una categoría válida.",
      });
    }
  }

  private getCartItem(itemId: string): PurchaseCartItem | undefined {
    const row = this.database.selectObject<PurchaseCartItemRow>(
      `SELECT
        pci.id,
        pci.cart_id,
        pci.capture_id,
        pci.capture_sequence,
        pci.main_photo_placeholder,
        pci.purchase_cost,
        pci.category_id,
        c.name AS category_name,
        pci.created_at,
        pci.updated_at
       FROM purchase_cart_items pci
       LEFT JOIN categories c ON c.id = pci.category_id
       WHERE pci.id = $id`,
      { $id: itemId },
    );

    return row ? mapPurchaseCartItem(row) : undefined;
  }

  private touchCart(cartId: string, updatedAt: string): void {
    this.database.run(
      `UPDATE purchase_carts
       SET updated_at = $updatedAt
       WHERE id = $cartId`,
      { $cartId: cartId, $updatedAt: updatedAt },
    );
  }

  private ensureCartCaptureSequenceColumn(): void {
    const columns = this.database.selectObjects<{ name: string }>(
      "PRAGMA table_info(purchase_carts)",
    );
    const hasSequenceColumn = columns.some(
      (column) => column.name === "next_capture_sequence",
    );

    if (!hasSequenceColumn) {
      this.database.run(
        `ALTER TABLE purchase_carts
         ADD COLUMN next_capture_sequence INTEGER NOT NULL DEFAULT 1`,
      );
    }
  }

  private syncNextCaptureSequences(): void {
    this.database.run(
      `UPDATE purchase_carts
       SET next_capture_sequence = MAX(
        next_capture_sequence,
        COALESCE(
          (
            SELECT MAX(capture_sequence) + 1
            FROM purchase_cart_items
            WHERE purchase_cart_items.cart_id = purchase_carts.id
          ),
          1
        )
       )`,
    );
  }

  private seedStores(): void {
    for (const store of seededStores) {
      this.database.run(
        `INSERT INTO stores (
          id, name, country, default_tax_rate, default_currency, active
        ) VALUES ($id, $name, $country, $defaultTaxRate, $defaultCurrency, $active)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          country = excluded.country,
          default_tax_rate = excluded.default_tax_rate,
          default_currency = excluded.default_currency,
          active = excluded.active`,
        {
          $id: store.id,
          $name: store.name,
          $country: store.country,
          $defaultTaxRate: store.defaultTaxRate,
          $defaultCurrency: store.defaultCurrency,
          $active: store.active ? 1 : 0,
        },
      );
    }
  }

  private seedCategories(): void {
    for (const category of seededCategories) {
      this.database.run(
        `INSERT INTO categories (id, name, active) VALUES ($id, $name, $active)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          active = excluded.active`,
        {
          $id: category.id,
          $name: category.name,
          $active: category.active ? 1 : 0,
        },
      );
    }
  }

  private seedDifferenceReasons(): void {
    for (const reason of seededDifferenceReasons) {
      this.database.run(
        `INSERT INTO difference_reasons (id, name, requires_note)
         VALUES ($id, $name, $requiresNote)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           requires_note = excluded.requires_note`,
        {
          $id: reason.id,
          $name: reason.name,
          $requiresNote: reason.requiresNote ? 1 : 0,
        },
      );
    }
  }

  private seedDemoItemsIfEmpty(
    cartId: string,
    items: PurchaseCartItemInput[],
  ): void {
    const itemCount = this.database.selectValue<number>(
      "SELECT COUNT(*) FROM purchase_cart_items WHERE cart_id = $cartId",
      { $cartId: cartId },
    );

    if (itemCount && itemCount > 0) {
      return;
    }

    for (const item of items) {
      const normalized = this.normalizeAndValidateItem(item);
      this.assertCategoryExists(normalized.categoryId);

      const sequence = this.database.selectValue<number>(
        `SELECT next_capture_sequence
         FROM purchase_carts
         WHERE id = $cartId`,
        { $cartId: cartId },
      );

      if (!sequence || sequence < 1) {
        throw new Error("No se pudo generar Capture ID.");
      }

      const now = this.now();

      this.database.run(
        `INSERT INTO purchase_cart_items (
          id, cart_id, capture_id, capture_sequence,
          main_photo_placeholder, purchase_cost, category_id,
          created_at, updated_at
        ) VALUES (
          $id, $cartId, $captureId, $captureSequence,
          $mainPhotoPlaceholder, $purchaseCost, $categoryId,
          $createdAt, $updatedAt
        )`,
        {
          $id: this.createItemId(),
          $cartId: cartId,
          $captureId: formatCaptureId(sequence),
          $captureSequence: sequence,
          $mainPhotoPlaceholder: normalized.mainPhotoPlaceholder,
          $purchaseCost: normalized.purchaseCost,
          $categoryId: normalized.categoryId,
          $createdAt: now,
          $updatedAt: now,
        },
      );

      this.database.run(
        `UPDATE purchase_carts
         SET next_capture_sequence = $nextCaptureSequence,
             updated_at = $updatedAt
         WHERE id = $cartId`,
        {
          $cartId: cartId,
          $nextCaptureSequence: sequence + 1,
          $updatedAt: now,
        },
      );
    }
  }

  private upsertDemoCart(input: {
    id: string;
    storeId: string;
    date: string;
    currency: Currency;
    taxRate: number;
    exchangeRate: number;
    now: string;
  }): void {
    this.database.run(
      `INSERT INTO purchase_carts (
        id, store_id, date, currency, tax_rate, exchange_rate,
        status, created_at, updated_at
      ) VALUES (
        $id, $storeId, $date, $currency, $taxRate, $exchangeRate,
        'draft', $createdAt, $updatedAt
      )
      ON CONFLICT(id) DO UPDATE SET
        store_id = excluded.store_id,
        date = excluded.date,
        currency = excluded.currency,
        tax_rate = excluded.tax_rate,
        exchange_rate = excluded.exchange_rate,
        updated_at = excluded.updated_at`,
      {
        $id: input.id,
        $storeId: input.storeId,
        $date: input.date,
        $currency: input.currency,
        $taxRate: input.taxRate,
        $exchangeRate: input.exchangeRate,
        $createdAt: input.now,
        $updatedAt: input.now,
      },
    );
  }

  private nextInternalCode(prefix: string): string {
    const count = this.database.selectValue<number>(
      `SELECT COUNT(*) + 1
       FROM garments
       WHERE internal_code LIKE $prefixPattern`,
      { $prefixPattern: `${prefix}-%` },
    );

    const sequence = count ?? 1;
    return `${prefix}-${String(sequence).padStart(3, "0")}`;
  }

  // --- Id factories ---

  private createCartId(): string {
    if (this.options.idFactory) {
      return this.options.idFactory();
    }

    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }

    return `cart-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  private createItemId(): string {
    if (this.options.itemIdFactory) {
      return this.options.itemIdFactory();
    }

    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }

    return `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  private createBatchId(): string {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }
    return `batch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  private createPaymentId(): string {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }
    return `payment-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  private createGarmentId(): string {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }
    return `garment-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  private now(): string {
    return (this.options.clock?.() ?? new Date()).toISOString();
  }
}

// --- Mappers ---

function mapStore(row: StoreRow): Store {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    defaultTaxRate: row.default_tax_rate,
    defaultCurrency: row.default_currency,
    active: row.active === 1,
  };
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    active: row.active === 1,
  };
}

function mapPurchaseCart(row: PurchaseCartRow): PurchaseCart {
  return {
    id: row.id,
    storeId: row.store_id,
    storeName: row.store_name,
    date: row.date,
    currency: row.currency,
    taxRate: row.tax_rate,
    exchangeRate: row.exchange_rate,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPurchaseCartItem(row: PurchaseCartItemRow): PurchaseCartItem {
  return {
    id: row.id,
    cartId: row.cart_id,
    captureId: row.capture_id,
    captureSequence: row.capture_sequence,
    mainPhotoPlaceholder: row.main_photo_placeholder,
    purchaseCost: row.purchase_cost,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categoryReview: row.category_id === null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapGarment(row: GarmentRow): Garment {
  return {
    id: row.id,
    paymentId: row.payment_id,
    cartItemId: row.cart_item_id,
    internalCode: row.internal_code,
    mainPhotoPlaceholder: row.main_photo_placeholder,
    purchaseCost: row.purchase_cost,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categoryReview: row.category_id === null,
    inventoryState: row.inventory_state,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatCaptureId(sequence: number): string {
  return `C${String(sequence).padStart(3, "0")}`;
}

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(dateInput: string, days: number): string {
  const date = new Date(`${dateInput}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateInput(date);
}
