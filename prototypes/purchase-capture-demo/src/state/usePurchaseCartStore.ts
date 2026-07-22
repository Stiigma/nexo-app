import { create } from "zustand";
import {
  createDemoExchangeRateProvider,
  type DemoExchangeRateQuote,
  type ExchangeRateProvider,
} from "../domain/exchangeRate";
import type {
  Category,
  Currency,
  DifferenceReason,
  Garment,
  PaymentConfirmationInput,
  PurchaseBatch,
  PurchaseBatchDetail,
  PurchaseCart,
  PurchaseCartDetail,
  PurchaseCartInput,
  PurchaseCartItem,
  PurchaseCartItemInput,
  Store,
} from "../domain/types";
import {
  PaymentConfirmationValidationError,
  PurchaseCartItemValidationError,
  PurchaseCartValidationError,
  validatePaymentConfirmationInput,
  validatePurchaseCartItemInput,
  validatePurchaseCartInput,
  type PaymentConfirmationValidationErrors,
  type PurchaseCartItemValidationErrors,
  type PurchaseCartValidationErrors,
} from "../domain/validation";
import type { PurchaseCartRepository } from "../data/purchaseCartRepository";

export type PurchaseCartScreen =
  | "batch-list"
  | "cart-create"
  | "cart-capture"
  | "cart-item-create"
  | "cart-item-edit"
  | "payment-confirm"
  | "batch-detail"
  | "acquired-stock";

export type PurchaseCartDraft = {
  storeId: string;
  date: string;
  currency: Currency | "";
  taxRate: string;
  exchangeRate: string;
};

export type PurchaseCartItemDraft = {
  mainPhotoPlaceholder: string;
  purchaseCost: string;
  categoryId: string;
};

export type PaymentConfirmationDraft = {
  evidence: string;
  paidTotal: string;
  differenceReasonId: string;
  differenceNote: string;
  batchMode: "existing" | "new";
  existingBatchId: string | null;
};

type PurchaseCartState = {
  repository?: PurchaseCartRepository;
  exchangeRateProvider: ExchangeRateProvider;
  screen: PurchaseCartScreen;
  stores: Store[];
  categories: Category[];
  differenceReasons: DifferenceReason[];
  batches: PurchaseBatch[];
  garments: Garment[];
  eligibleBatches: PurchaseBatch[];
  activeCart?: PurchaseCartDetail;
  selectedBatch?: PurchaseBatchDetail;
  selectedItemId?: string;
  draft: PurchaseCartDraft;
  itemDraft: PurchaseCartItemDraft;
  paymentDraft: PaymentConfirmationDraft;
  fxQuote?: DemoExchangeRateQuote;
  loading: boolean;
  saving: boolean;
  error?: string;
  notice?: string;
  showValidation: boolean;
  validationErrors: PurchaseCartValidationErrors;
  showItemValidation: boolean;
  itemValidationErrors: PurchaseCartItemValidationErrors;
  showPaymentValidation: boolean;
  paymentValidationErrors: PaymentConfirmationValidationErrors;
  offline: boolean;
  initialize: (
    repository: PurchaseCartRepository,
    exchangeRateProvider?: ExchangeRateProvider,
  ) => Promise<void>;
  setOffline: (offline: boolean) => void;
  clearNotice: () => void;
  goToBatchList: () => void;
  viewBatch: (batchId: string) => void;
  viewAcquiredStock: () => void;
  startNewCart: () => void;
  startCartFromStore: (storeId: string) => Promise<void>;
  updateDraft: (patch: Partial<PurchaseCartDraft>) => void;
  applyStoreDefaults: (storeId: string) => void;
  startAddItem: () => void;
  startEditItem: (itemId: string) => void;
  updateItemDraft: (patch: Partial<PurchaseCartItemDraft>) => void;
  createCartItem: () => Promise<void>;
  saveItemEdit: () => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  deleteActiveCart: () => void;
  startConfirmPayment: () => void;
  updatePaymentDraft: (patch: Partial<PaymentConfirmationDraft>) => void;
  confirmCartAsBatch: () => Promise<void>;
  seedDemoBatches: () => Promise<void>;
  resetDemoData: () => Promise<void>;
};

const defaultFxProvider = createDemoExchangeRateProvider();

export const usePurchaseCartStore = create<PurchaseCartState>((set, get) => ({
  exchangeRateProvider: defaultFxProvider,
  screen: "batch-list",
  stores: [],
  categories: [],
  differenceReasons: [],
  batches: [],
  garments: [],
  eligibleBatches: [],
  draft: emptyDraft(),
  itemDraft: emptyItemDraft(),
  paymentDraft: emptyPaymentDraft(),
  loading: true,
  saving: false,
  showValidation: false,
  validationErrors: {},
  showItemValidation: false,
  itemValidationErrors: {},
  showPaymentValidation: false,
  paymentValidationErrors: {},
  offline: typeof navigator !== "undefined" ? !navigator.onLine : false,

  async initialize(repository, exchangeRateProvider = defaultFxProvider) {
    set({ loading: true, error: undefined, repository, exchangeRateProvider });

    try {
      const fxQuote = await exchangeRateProvider.getUsdMxnRate();
      const stores = repository.listStores();
      const categories = repository.listCategories();
      const differenceReasons = repository.listDifferenceReasons();
      const batches = repository.listBatches();
      const garments = repository.listGarments();

      set({
        stores,
        categories,
        differenceReasons,
        batches,
        garments,
        fxQuote,
        draft: createDefaultDraft(stores, fxQuote),
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: errorToMessage(error),
      });
    }
  },

  setOffline(offline) {
    set({ offline });
  },

  clearNotice() {
    set({ notice: undefined });
  },

  // --- Batch List (home) ---

  goToBatchList() {
    const repository = requireRepository(get());
    set({
      screen: "batch-list",
      activeCart: undefined,
      selectedBatch: undefined,
      selectedItemId: undefined,
      batches: repository.listBatches(),
      garments: repository.listGarments(),
      error: undefined,
      showValidation: false,
      validationErrors: {},
      showItemValidation: false,
      itemValidationErrors: {},
      showPaymentValidation: false,
      paymentValidationErrors: {},
    });
  },

  viewBatch(batchId) {
    const repository = requireRepository(get());
    const batch = repository.getBatchDetail(batchId);
    if (!batch) {
      set({ error: "No se encontró el lote." });
      return;
    }
    set({ selectedBatch: batch, screen: "batch-detail", error: undefined });
  },

  viewAcquiredStock() {
    const repository = requireRepository(get());
    set({
      screen: "acquired-stock",
      garments: repository.listGarments(),
      batches: repository.listBatches(),
      error: undefined,
    });
  },

  // --- New Cart Flow ---

  startNewCart() {
    const { stores, fxQuote } = get();
    set({
      screen: "cart-create",
      activeCart: undefined,
      selectedItemId: undefined,
      draft: createDefaultDraft(stores, fxQuote),
      itemDraft: emptyItemDraft(),
      error: undefined,
      showValidation: false,
      validationErrors: {},
      showItemValidation: false,
      itemValidationErrors: {},
    });
  },

  async startCartFromStore(storeId) {
    const state = get();
    const repository = requireRepository(state);

    const store = state.stores.find((s) => s.id === storeId);
    if (!store) {
      set({ error: "Tienda no encontrada." });
      return;
    }

    set({ saving: true, error: undefined });

    try {
      const cart = repository.createCart({
        storeId,
        date: state.draft.date,
        currency: store.defaultCurrency,
        taxRate: store.defaultTaxRate,
        exchangeRate:
          store.defaultCurrency === "USD"
            ? String(state.fxQuote?.rate ?? 18.25)
            : "",
      });

      const activeCart = repository.getCartDetail(cart.id);
      if (!activeCart) {
        throw new Error("No se pudo cargar el carrito creado.");
      }

      set({
        activeCart,
        screen: "cart-capture",
        saving: false,
        notice: "Carrito creado.",
        showValidation: false,
        validationErrors: {},
      });
    } catch (error) {
      set({ saving: false, error: errorToMessage(error) });
    }
  },

  updateDraft(patch) {
    set((state) => ({
      draft: { ...state.draft, ...patch },
      validationErrors: clearPatchedErrors(state.validationErrors, patch),
      error: undefined,
    }));
  },

  applyStoreDefaults(storeId) {
    const { stores, fxQuote } = get();
    const store = stores.find((item) => item.id === storeId);

    if (!store) {
      get().updateDraft({ storeId });
      return;
    }

    get().updateDraft({
      storeId,
      currency: store.defaultCurrency,
      taxRate: String(store.defaultTaxRate),
      exchangeRate: store.defaultCurrency === "USD" ? String(fxQuote?.rate ?? 18.25) : "",
    });
  },

  // --- Item Capture ---

  startAddItem() {
    if (!get().activeCart) {
      set({ error: "Selecciona un carrito antes de agregar items." });
      return;
    }

    set({
      screen: "cart-item-create",
      selectedItemId: undefined,
      itemDraft: emptyItemDraft(),
      error: undefined,
      showItemValidation: false,
      itemValidationErrors: {},
    });
  },

  startEditItem(itemId) {
    const activeCart = get().activeCart;
    const item = activeCart?.items.find((cartItem) => cartItem.id === itemId);

    if (!item) {
      set({ error: "No se encontró el item del carrito." });
      return;
    }

    set({
      screen: "cart-item-edit",
      selectedItemId: item.id,
      itemDraft: itemDraftFromItem(item),
      error: undefined,
      showItemValidation: false,
      itemValidationErrors: {},
    });
  },

  updateItemDraft(patch) {
    set((state) => ({
      itemDraft: { ...state.itemDraft, ...patch },
      itemValidationErrors: clearPatchedItemErrors(
        state.itemValidationErrors,
        patch,
      ),
      error: undefined,
    }));
  },

  async createCartItem() {
    const state = get();
    const repository = requireRepository(state);

    if (!state.activeCart) {
      set({ error: "No hay un carrito seleccionado para agregar items." });
      return;
    }

    const validation = validatePurchaseCartItemInput(toItemInput(state.itemDraft));

    if (!validation.valid) {
      set({
        showItemValidation: true,
        itemValidationErrors: validation.errors,
        error: "Corrige los campos marcados para guardar el item.",
      });
      return;
    }

    set({ saving: true, error: undefined });

    try {
      repository.createCartItem(state.activeCart.id, toItemInput(state.itemDraft));
      const activeCart = repository.getCartDetail(state.activeCart.id);
      if (!activeCart) throw new Error("No se pudo recargar el carrito.");

      set({
        activeCart,
        screen: "cart-capture",
        saving: false,
        notice: "Purchase Cart Item guardado localmente.",
        showItemValidation: false,
        itemValidationErrors: {},
        itemDraft: emptyItemDraft(),
      });
    } catch (error) {
      handleItemSaveError(error, set);
    }
  },

  async saveItemEdit() {
    const state = get();
    const repository = requireRepository(state);

    if (!state.activeCart || !state.selectedItemId) {
      set({ error: "No hay un item seleccionado para editar." });
      return;
    }

    const validation = validatePurchaseCartItemInput(toItemInput(state.itemDraft));

    if (!validation.valid) {
      set({
        showItemValidation: true,
        itemValidationErrors: validation.errors,
        error: "Corrige los campos marcados para guardar el item.",
      });
      return;
    }

    set({ saving: true, error: undefined });

    try {
      repository.updateCartItem(state.selectedItemId, toItemInput(state.itemDraft));
      const activeCart = repository.getCartDetail(state.activeCart.id);
      if (!activeCart) throw new Error("No se pudo recargar el carrito.");

      set({
        activeCart,
        selectedItemId: undefined,
        screen: "cart-capture",
        saving: false,
        notice: "Purchase Cart Item actualizado.",
        showItemValidation: false,
        itemValidationErrors: {},
        itemDraft: emptyItemDraft(),
      });
    } catch (error) {
      handleItemSaveError(error, set);
    }
  },

  async removeCartItem(itemId) {
    const state = get();
    const repository = requireRepository(state);

    if (!state.activeCart) {
      set({ error: "No hay un carrito seleccionado." });
      return;
    }

    set({ saving: true, error: undefined });

    try {
      repository.removeCartItem(itemId);
      const activeCart = repository.getCartDetail(state.activeCart.id);
      if (!activeCart) throw new Error("No se pudo recargar el carrito.");

      set({
        activeCart,
        saving: false,
        notice: "Purchase Cart Item eliminado.",
      });
    } catch (error) {
      set({ saving: false, error: errorToMessage(error) });
    }
  },

  deleteActiveCart() {
    const state = get();
    const repository = requireRepository(state);

    if (!state.activeCart) return;

    repository.deleteCart(state.activeCart.id);

    set({
      screen: "batch-list",
      activeCart: undefined,
      selectedItemId: undefined,
      itemDraft: emptyItemDraft(),
      batches: repository.listBatches(),
      garments: repository.listGarments(),
      notice: "Carrito descartado.",
    });
  },

  // --- Payment Confirmation ---

  startConfirmPayment() {
    const state = get();
    const repository = requireRepository(state);

    const cart = state.activeCart;
    if (!cart) {
      set({ error: "No hay un carrito seleccionado." });
      return;
    }

    // Find eligible batches (same store, same date)
    const eligibleBatches = repository.listBatchesForStoreDate(
      cart.storeId,
      cart.date,
    );

    set({
      screen: "payment-confirm",
      eligibleBatches,
      paymentDraft: emptyPaymentDraft(),
      showPaymentValidation: false,
      paymentValidationErrors: {},
      error: undefined,
    });
  },

  updatePaymentDraft(patch) {
    set((state) => ({
      paymentDraft: { ...state.paymentDraft, ...patch },
      paymentValidationErrors: clearPatchedPaymentErrors(
        state.paymentValidationErrors,
        patch,
      ),
      error: undefined,
    }));
  },

  async confirmCartAsBatch() {
    const state = get();
    const repository = requireRepository(state);

    if (!state.activeCart) {
      set({ error: "No hay un carrito seleccionado." });
      return;
    }

    const input: PaymentConfirmationInput = toPaymentInput(state.paymentDraft);
    const validation = validatePaymentConfirmationInput(
      input,
      state.activeCart.totals.expectedTotal,
      state.differenceReasons,
    );

    if (!validation.valid) {
      set({
        showPaymentValidation: true,
        paymentValidationErrors: validation.errors,
        error: "Corrige los campos marcados para confirmar.",
      });
      return;
    }

    set({ saving: true, error: undefined });

    try {
      const batch = repository.confirmCartAsBatch(
        state.activeCart.id,
        input,
      );

      set({
        selectedBatch: batch,
        batches: repository.listBatches(),
        garments: repository.listGarments(),
        activeCart: undefined,
        screen: "batch-detail",
        saving: false,
        notice: "Pago confirmado. Items convertidos a Acquired Stock.",
        showPaymentValidation: false,
        paymentValidationErrors: {},
        paymentDraft: emptyPaymentDraft(),
      });
    } catch (error) {
      if (error instanceof PaymentConfirmationValidationError) {
        set({
          saving: false,
          showPaymentValidation: true,
          paymentValidationErrors: error.errors,
          error: "Corrige los campos marcados.",
        });
        return;
      }
      set({ saving: false, error: errorToMessage(error) });
    }
  },

  // --- Seed / Reset ---

  async seedDemoBatches() {
    const repository = requireRepository(get());

    set({ saving: true, error: undefined });

    try {
      const batches = repository.seedDemoBatches();
      set({
        batches,
        screen: "batch-list",
        activeCart: undefined,
        selectedBatch: undefined,
        saving: false,
        notice: "Datos demo cargados.",
      });
    } catch (error) {
      set({ saving: false, error: errorToMessage(error) });
    }
  },

  async resetDemoData() {
    const repository = requireRepository(get());

    set({ saving: true, error: undefined });

    try {
      repository.resetDemoData();
      const stores = repository.listStores();
      const categories = repository.listCategories();
      const differenceReasons = repository.listDifferenceReasons();
      set({
        stores,
        categories,
        differenceReasons,
        batches: repository.listBatches(),
        garments: repository.listGarments(),
        activeCart: undefined,
        selectedBatch: undefined,
        selectedItemId: undefined,
        screen: "batch-list",
        draft: createDefaultDraft(stores, get().fxQuote),
        itemDraft: emptyItemDraft(),
        paymentDraft: emptyPaymentDraft(),
        saving: false,
        notice:
          "Datos reiniciados. Tiendas, categorías y motivos semilla siguen disponibles.",
      });
    } catch (error) {
      set({ saving: false, error: errorToMessage(error) });
    }
  },
}));

// --- Draft helpers ---

function emptyDraft(): PurchaseCartDraft {
  return {
    storeId: "",
    date: toDateInput(new Date()),
    currency: "USD",
    taxRate: "0",
    exchangeRate: "18.25",
  };
}

function emptyItemDraft(): PurchaseCartItemDraft {
  return {
    mainPhotoPlaceholder: "",
    purchaseCost: "",
    categoryId: "",
  };
}

function emptyPaymentDraft(): PaymentConfirmationDraft {
  return {
    evidence: "",
    paidTotal: "",
    differenceReasonId: "",
    differenceNote: "",
    batchMode: "new",
    existingBatchId: null,
  };
}

function createDefaultDraft(
  stores: Store[],
  fxQuote?: DemoExchangeRateQuote,
): PurchaseCartDraft {
  const store = stores[0];

  if (!store) {
    return emptyDraft();
  }

  return {
    storeId: store.id,
    date: toDateInput(new Date()),
    currency: store.defaultCurrency,
    taxRate: String(store.defaultTaxRate),
    exchangeRate: store.defaultCurrency === "USD" ? String(fxQuote?.rate ?? 18.25) : "",
  };
}

function itemDraftFromItem(item: PurchaseCartItem): PurchaseCartItemDraft {
  return {
    mainPhotoPlaceholder: item.mainPhotoPlaceholder,
    purchaseCost: String(item.purchaseCost),
    categoryId: item.categoryId ?? "",
  };
}

function toInput(draft: PurchaseCartDraft): PurchaseCartInput {
  return {
    storeId: draft.storeId,
    date: draft.date,
    currency: draft.currency,
    taxRate: draft.taxRate,
    exchangeRate: draft.exchangeRate,
  };
}

function toItemInput(draft: PurchaseCartItemDraft): PurchaseCartItemInput {
  return {
    mainPhotoPlaceholder: draft.mainPhotoPlaceholder,
    purchaseCost: draft.purchaseCost,
    categoryId: draft.categoryId,
  };
}

function toPaymentInput(
  draft: PaymentConfirmationDraft,
): PaymentConfirmationInput {
  return {
    evidence: draft.evidence,
    paidTotal: draft.paidTotal,
    differenceReasonId: draft.differenceReasonId,
    differenceNote: draft.differenceNote,
    batchMode: draft.batchMode,
    existingBatchId: draft.existingBatchId,
  };
}

function clearPatchedErrors(
  errors: PurchaseCartValidationErrors,
  patch: Partial<PurchaseCartDraft>,
): PurchaseCartValidationErrors {
  const next = { ...errors };

  for (const key of Object.keys(patch) as (keyof PurchaseCartDraft)[]) {
    delete next[key];
  }

  return next;
}

function clearPatchedItemErrors(
  errors: PurchaseCartItemValidationErrors,
  patch: Partial<PurchaseCartItemDraft>,
): PurchaseCartItemValidationErrors {
  const next = { ...errors };

  for (const key of Object.keys(patch) as (keyof PurchaseCartItemDraft)[]) {
    delete next[key];
  }

  return next;
}

function clearPatchedPaymentErrors(
  errors: PaymentConfirmationValidationErrors,
  patch: Partial<PaymentConfirmationDraft>,
): PaymentConfirmationValidationErrors {
  const next = { ...errors };

  for (const key of Object.keys(patch) as (keyof PaymentConfirmationDraft)[]) {
    delete next[key];
  }

  return next;
}

function requireRepository(state: PurchaseCartState): PurchaseCartRepository {
  if (!state.repository) {
    throw new Error("El repositorio local todavía no está listo.");
  }

  return state.repository;
}

function handleSaveError(
  error: unknown,
  set: (partial: Partial<PurchaseCartState>) => void,
): void {
  if (error instanceof PurchaseCartValidationError) {
    set({
      saving: false,
      showValidation: true,
      validationErrors: error.errors,
      error: "Corrige los campos marcados.",
    });
    return;
  }

  set({
    saving: false,
    error: errorToMessage(error),
  });
}

function handleItemSaveError(
  error: unknown,
  set: (partial: Partial<PurchaseCartState>) => void,
): void {
  if (error instanceof PurchaseCartItemValidationError) {
    set({
      saving: false,
      showItemValidation: true,
      itemValidationErrors: error.errors,
      error: "Corrige los campos marcados.",
    });
    return;
  }

  set({
    saving: false,
    error: errorToMessage(error),
  });
}

function errorToMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado en el demo local.";
}

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}
