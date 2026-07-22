import { beforeEach, describe, expect, it } from "vitest";
import { PurchaseCartRepository } from "./purchaseCartRepository";
import {
  PaymentConfirmationValidationError,
  PurchaseCartItemValidationError,
  PurchaseCartValidationError,
} from "../domain/validation";
import type { SqlDatabase } from "./sqlDatabase";
import { createTestSqlDatabase } from "../test/sqlJsDatabase";

describe("PurchaseCartRepository", () => {
  let idIndex: number;
  let itemIdIndex: number;
  let database: SqlDatabase;
  let repository: PurchaseCartRepository;

  beforeEach(async () => {
    idIndex = 0;
    itemIdIndex = 0;
    database = await createTestSqlDatabase();
    repository = new PurchaseCartRepository(database, {
      idFactory: () => `cart-test-${++idIndex}`,
      itemIdFactory: () => `item-test-${++itemIdIndex}`,
      clock: () => new Date("2026-07-01T12:00:00.000Z"),
    });
    repository.initialize();
  });

  it("initializes schema metadata and seeds stores and categories", () => {
    expect(
      database.selectValue<string>(
        "SELECT value FROM demo_meta WHERE key = 'schema_version'",
      ),
    ).toBe("4");
    expect(repository.listStores()).toMatchObject([
      { id: "store-burlington", name: "Burlington" },
      { id: "store-goodwill", name: "Goodwill" },
      { id: "store-ross", name: "Ross" },
      { id: "store-salvation-army", name: "Salvation Army" },
    ]);
    expect(repository.listCategories()).toMatchObject([
      { id: "cat-accessories", name: "Accessories" },
      { id: "cat-bottoms", name: "Bottoms" },
      { id: "cat-dresses", name: "Dresses" },
      { id: "cat-outerwear", name: "Outerwear" },
      { id: "cat-shoes", name: "Shoes" },
      { id: "cat-tops", name: "Tops" },
    ]);
    expect(repository.listDifferenceReasons()).toHaveLength(4);
  });

  it("creates, lists, gets, and updates a purchase cart", () => {
    const created = repository.createCart({
      storeId: "store-goodwill",
      date: "2026-07-01",
      currency: "USD",
      taxRate: "8.25",
      exchangeRate: "18.25",
    });

    expect(created).toMatchObject({
      id: "cart-test-1",
      storeId: "store-goodwill",
      storeName: "Goodwill",
      currency: "USD",
      taxRate: 8.25,
      exchangeRate: 18.25,
      status: "draft",
    });

    expect(repository.listCarts()).toHaveLength(1);
    expect(repository.getCart("cart-test-1")?.storeName).toBe("Goodwill");

    const updated = repository.updateCart("cart-test-1", {
      storeId: "store-ross",
      date: "2026-07-02",
      currency: "MXN",
      taxRate: "0",
      exchangeRate: "",
    });

    expect(updated).toMatchObject({
      id: "cart-test-1",
      storeId: "store-ross",
      storeName: "Ross",
      date: "2026-07-02",
      currency: "MXN",
      taxRate: 0,
      exchangeRate: null,
    });
  });

  it("throws validation errors before inserting invalid carts", () => {
    expect(() =>
      repository.createCart({
        storeId: "",
        date: "2026-07-01",
        currency: "USD",
        taxRate: "8.25",
        exchangeRate: "18.25",
      }),
    ).toThrow(PurchaseCartValidationError);
    expect(repository.listCarts()).toHaveLength(0);
  });

  it("creates, lists, updates, removes, and totals purchase cart items", () => {
    const cart = createValidCart();

    const firstItem = repository.createCartItem(cart.id, {
      mainPhotoPlaceholder: "photo-front",
      purchaseCost: "10",
      categoryId: "",
    });
    const secondItem = repository.createCartItem(cart.id, {
      mainPhotoPlaceholder: "photo-label",
      purchaseCost: "20",
      categoryId: "cat-tops",
    });

    expect(firstItem).toMatchObject({
      id: "item-test-1",
      captureId: "C001",
      captureSequence: 1,
      purchaseCost: 10,
      categoryId: null,
      categoryName: null,
      categoryReview: true,
    });
    expect(secondItem).toMatchObject({
      id: "item-test-2",
      captureId: "C002",
      categoryName: "Tops",
      categoryReview: false,
    });
    expect(repository.listCartItems(cart.id).map((item) => item.captureId)).toEqual([
      "C001",
      "C002",
    ]);

    const detail = repository.getCartDetail(cart.id);
    expect(detail?.totals.itemCount).toBe(2);
    expect(detail?.totals.subtotal).toBe(30);
    expect(detail?.totals.tax).toBeCloseTo(2.475);
    expect(detail?.totals.expectedTotal).toBeCloseTo(32.475);
    expect(detail?.totals.mxnEquivalent).toBeCloseTo(592.66875);

    const updated = repository.updateCartItem(firstItem.id, {
      mainPhotoPlaceholder: "photo-texture",
      purchaseCost: "11.50",
      categoryId: "cat-bottoms",
    });

    expect(updated).toMatchObject({
      captureId: "C001",
      mainPhotoPlaceholder: "photo-texture",
      purchaseCost: 11.5,
      categoryName: "Bottoms",
      categoryReview: false,
    });

    repository.removeCartItem(secondItem.id);

    expect(repository.listCartItems(cart.id).map((item) => item.captureId)).toEqual([
      "C001",
    ]);
    expect(repository.getCartDetail(cart.id)?.totals).toMatchObject({
      itemCount: 1,
      subtotal: 11.5,
    });
  });

  it("does not reuse deleted capture IDs in a cart", () => {
    const cart = createValidCart();
    const firstItem = repository.createCartItem(cart.id, {
      mainPhotoPlaceholder: "photo-front",
      purchaseCost: "10",
      categoryId: null,
    });
    const secondItem = repository.createCartItem(cart.id, {
      mainPhotoPlaceholder: "photo-label",
      purchaseCost: "11",
      categoryId: null,
    });

    repository.removeCartItem(secondItem.id);

    const thirdItem = repository.createCartItem(cart.id, {
      mainPhotoPlaceholder: "photo-shoes",
      purchaseCost: "12",
      categoryId: null,
    });

    expect(firstItem.captureId).toBe("C001");
    expect(secondItem.captureId).toBe("C002");
    expect(thirdItem.captureId).toBe("C003");
  });

  it("rejects invalid item input and invalid categories", () => {
    const cart = createValidCart();

    expect(() =>
      repository.createCartItem(cart.id, {
        mainPhotoPlaceholder: "",
        purchaseCost: "10",
        categoryId: null,
      }),
    ).toThrow(PurchaseCartItemValidationError);
    expect(() =>
      repository.createCartItem(cart.id, {
        mainPhotoPlaceholder: "photo-front",
        purchaseCost: "10",
        categoryId: "cat-missing",
      }),
    ).toThrow(PurchaseCartItemValidationError);
    expect(repository.listCartItems(cart.id)).toHaveLength(0);
  });

  it("deletes a cart and its items", () => {
    const cart = createValidCart();
    repository.createCartItem(cart.id, {
      mainPhotoPlaceholder: "photo-front",
      purchaseCost: "10",
      categoryId: null,
    });

    expect(repository.listCarts()).toHaveLength(1);
    repository.deleteCart(cart.id);
    expect(repository.listCarts()).toHaveLength(0);
    expect(repository.getCart(cart.id)).toBeUndefined();
  });

  // --- v4 Batch + Payment tests ---

  it("confirms a cart as a new batch and creates garments", () => {
    const cart = createValidCart();
    repository.createCartItem(cart.id, {
      mainPhotoPlaceholder: "photo-front",
      purchaseCost: "10",
      categoryId: null,
    });

    const batch = repository.confirmCartAsBatch(cart.id, {
      evidence: "evidence-ticket",
      paidTotal: String(10 * (1 + 8.25 / 100)),
      differenceReasonId: "",
      differenceNote: "",
      batchMode: "new",
      existingBatchId: null,
    });

    expect(batch).toMatchObject({
      storeName: "Goodwill",
      paymentCount: 1,
      garmentCount: 1,
      currency: "USD",
    });

    // Cart is deleted after confirmation
    expect(repository.getCart(cart.id)).toBeUndefined();
    expect(repository.listCarts()).toHaveLength(0);

    // Garment was created
    const garments = repository.listGarments();
    expect(garments).toHaveLength(1);
    expect(garments[0]).toMatchObject({
      internalCode: "GW-001",
      purchaseCost: 10,
      inventoryState: "acquired_stock",
    });
  });

  it("adds a payment to an existing batch via batchMode=existing", () => {
    // First cart → creates batch
    const cart1 = createValidCart();
    repository.createCartItem(cart1.id, {
      mainPhotoPlaceholder: "photo-front",
      purchaseCost: "10",
      categoryId: null,
    });

    const batch1 = repository.confirmCartAsBatch(cart1.id, {
      evidence: "evidence-ticket",
      paidTotal: "10.825",
      differenceReasonId: "",
      differenceNote: "",
      batchMode: "new",
      existingBatchId: null,
    });

    // Second cart → add to existing batch
    const cart2 = createValidCart(); // same store + date
    repository.createCartItem(cart2.id, {
      mainPhotoPlaceholder: "photo-label",
      purchaseCost: "20",
      categoryId: null,
    });

    const batch2 = repository.confirmCartAsBatch(cart2.id, {
      evidence: "evidence-invoice",
      paidTotal: "21.65",
      differenceReasonId: "",
      differenceNote: "",
      batchMode: "existing",
      existingBatchId: batch1.id,
    });

    expect(batch2.id).toBe(batch1.id); // Same batch
    expect(batch2.paymentCount).toBe(2);
    expect(batch2.garmentCount).toBe(2);
    expect(batch2.payments).toHaveLength(2);

    // Internal codes are sequential globally per store
    const allGarments = repository.listGarments();
    expect(allGarments).toHaveLength(2);
    const codes = allGarments.map((g) => g.internalCode).sort();
    expect(codes).toEqual(["GW-001", "GW-002"]);

    // Cart 2 is deleted
    expect(repository.getCart(cart2.id)).toBeUndefined();
  });

  it("creates a new batch when batchMode=new and batch already exists for store+date", () => {
    const cart1 = createValidCart();
    repository.createCartItem(cart1.id, {
      mainPhotoPlaceholder: "photo-front",
      purchaseCost: "10",
      categoryId: null,
    });

    const batch1 = repository.confirmCartAsBatch(cart1.id, {
      evidence: "evidence-ticket",
      paidTotal: "10.825",
      differenceReasonId: "",
      differenceNote: "",
      batchMode: "new",
      existingBatchId: null,
    });

    const cart2 = createValidCart();
    repository.createCartItem(cart2.id, {
      mainPhotoPlaceholder: "photo-label",
      purchaseCost: "20",
      categoryId: null,
    });

    // Explicitly choose new batch even though one exists
    const batch2 = repository.confirmCartAsBatch(cart2.id, {
      evidence: "evidence-invoice",
      paidTotal: "21.65",
      differenceReasonId: "",
      differenceNote: "",
      batchMode: "new",
      existingBatchId: null,
    });

    expect(batch2.id).not.toBe(batch1.id); // Different batch
    expect(repository.listBatches()).toHaveLength(2);
  });

  it("rejects confirmation with missing evidence or invalid paid total", () => {
    const cart = createValidCart();
    repository.createCartItem(cart.id, {
      mainPhotoPlaceholder: "photo-front",
      purchaseCost: "10",
      categoryId: null,
    });

    expect(() =>
      repository.confirmCartAsBatch(cart.id, {
        evidence: "",
        paidTotal: "10",
        differenceReasonId: "",
        differenceNote: "",
        batchMode: "new",
        existingBatchId: null,
      }),
    ).toThrow(PaymentConfirmationValidationError);

    expect(() =>
      repository.confirmCartAsBatch(cart.id, {
        evidence: "evidence-ticket",
        paidTotal: "0",
        differenceReasonId: "",
        differenceNote: "",
        batchMode: "new",
        existingBatchId: null,
      }),
    ).toThrow(PaymentConfirmationValidationError);
  });

  it("rejects confirmation with empty cart", () => {
    const cart = createValidCart();

    expect(() =>
      repository.confirmCartAsBatch(cart.id, {
        evidence: "evidence-ticket",
        paidTotal: "10",
        differenceReasonId: "",
        differenceNote: "",
        batchMode: "new",
        existingBatchId: null,
      }),
    ).toThrow("El carrito no tiene items para confirmar.");
  });

  it("lists batches for store and date", () => {
    const cart = createValidCart();
    repository.createCartItem(cart.id, {
      mainPhotoPlaceholder: "photo-front",
      purchaseCost: "10",
      categoryId: null,
    });

    repository.confirmCartAsBatch(cart.id, {
      evidence: "evidence-ticket",
      paidTotal: "10.825",
      differenceReasonId: "",
      differenceNote: "",
      batchMode: "new",
      existingBatchId: null,
    });

    const eligible = repository.listBatchesForStoreDate("store-goodwill", "2026-07-01");
    expect(eligible).toHaveLength(1);
    expect(eligible[0].storeName).toBe("Goodwill");
  });

  it("seeds demo batches and resets while preserving stores", () => {
    const seeded = repository.seedDemoBatches();

    expect(seeded.length).toBeGreaterThanOrEqual(1);
    // Goodwill should have a batch with 2 payments (from seed)
    const goodwillBatch = seeded.find((b) => b.storeName === "Goodwill");
    expect(goodwillBatch).toBeDefined();
    expect(goodwillBatch!.paymentCount).toBeGreaterThanOrEqual(1);

    const garments = repository.listGarments();
    expect(garments.length).toBeGreaterThan(0);
    // All garments should have valid internal codes
    for (const g of garments) {
      expect(g.internalCode).toMatch(/^(GW|BUR|ROS|SAL)-\d{3}$/);
    }

    // Carts should be deleted after seeding
    expect(repository.listCarts()).toHaveLength(0);

    repository.resetDemoData();

    expect(repository.listBatches()).toHaveLength(0);
    expect(repository.listGarments()).toHaveLength(0);
    expect(repository.listStores().map((store) => store.name)).toContain("Goodwill");
    expect(repository.listCategories().map((category) => category.name)).toContain("Tops");
  });

  it("confirmCartAsBatch stores difference reason when totals differ", () => {
    const cart = createValidCart();
    repository.createCartItem(cart.id, {
      mainPhotoPlaceholder: "photo-front",
      purchaseCost: "10",
      categoryId: null,
    });

    const batch = repository.confirmCartAsBatch(cart.id, {
      evidence: "evidence-ticket",
      paidTotal: "12.00", // different from expected ~10.825
      differenceReasonId: "diff-discount",
      differenceNote: "",
      batchMode: "new",
      existingBatchId: null,
    });

    expect(batch.payments[0].differenceReasonId).toBe("diff-discount");
  });

  function createValidCart() {
    return repository.createCart({
      storeId: "store-goodwill",
      date: "2026-07-01",
      currency: "USD",
      taxRate: "8.25",
      exchangeRate: "18.25",
    });
  }
});
