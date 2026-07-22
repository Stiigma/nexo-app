import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, RefreshCw } from "lucide-react";

import { AcquiredStockList } from "@/components/AcquiredStockList";
import { BatchDetail } from "@/components/BatchDetail";
import { BatchList } from "@/components/BatchList";
import { CartCapture } from "@/components/CartCapture";
import { CartItemForm } from "@/components/CartItemForm";
import { NewCartFlow } from "@/components/NewCartFlow";
import { PaymentConfirmForm } from "@/components/PaymentConfirmForm";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { NexoSidebar, NexoSidebarContent } from "./NexoSidebar";
import { Topbar, type Crumb } from "./Topbar";
import { Forbidden } from "./Forbidden";
import { useIsDesktop, useIsMobile } from "@/hooks/use-is-mobile";

import { usePurchaseCartStore } from "@/state/usePurchaseCartStore";

export function NexoAppShell() {
  const store = usePurchaseCartStore();
  const {
    screen,
    stores,
    categories,
    differenceReasons,
    batches,
    garments,
    eligibleBatches,
    activeCart,
    selectedBatch,
    loading,
    saving,
    error,
    notice,
    offline,
    initialize,
    setOffline,
    clearNotice,
    goToBatchList,
    viewBatch,
    viewAcquiredStock,
    startNewCart,
    startCartFromStore,
    startAddItem,
    startEditItem,
    updateItemDraft,
    createCartItem,
    saveItemEdit,
    removeCartItem,
    deleteActiveCart,
    startConfirmPayment,
    updatePaymentDraft,
    confirmCartAsBatch,
    seedDemoBatches,
    resetDemoData,
  } = store;

  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // rail colapsado por defecto en tablet; expandido en escritorio.
  const [collapsed, setCollapsed] = useState(!isDesktop);

  useEffect(() => {
    setCollapsed(!isDesktop);
  }, [isDesktop]);

  // notice del store → toast sonner (presentación; no toca la lógica).
  useEffect(() => {
    if (notice) {
      toast.success(notice);
      clearNotice();
    }
  }, [notice, clearNotice]);

  const crumbs = buildCrumbs(screen, activeCart?.storeName, selectedBatch?.storeName, goToBatchList);

  const sidebarProps = {
    current: screen,
    hasActiveCart: Boolean(activeCart),
    offline,
    onGoToBatches: goToBatchList,
    onGoToCart: () => {
      if (activeCart) {
        usePurchaseCartStore.setState({ screen: "cart-capture" });
      }
    },
    onGoToAcquiredStock: viewAcquiredStock,
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full bg-paper text-foreground">
        {/* Sidebar estático (tablet/escritorio) */}
        <NexoSidebar
          collapsed={collapsed}
          onNavigate={() => {}}
          {...sidebarProps}
        />

        {/* Columna principal: topbar + canvas */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            crumbs={crumbs}
            offline={offline}
            onOpenMenu={() => setMobileNavOpen(true)}
          />

          <main
            role="main"
            aria-label="Contenido principal"
            className="flex-1 px-4 py-5 pb-10 md:px-6 lg:px-8"
          >
            <div className="mx-auto w-full max-w-3xl lg:max-w-5xl">
              {error ? <GlobalErrorAlert message={error} /> : null}

              {loading ? (
                <LoadingSkeleton />
              ) : screen === "batch-list" ? (
                <BatchList
                  batches={batches}
                  saving={saving}
                  onNewCart={startNewCart}
                  onViewBatch={viewBatch}
                  onSeed={() => void seedDemoBatches()}
                  onReset={() => void resetDemoData()}
                />
              ) : screen === "cart-create" ? (
                <NewCartFlow
                  stores={stores}
                  saving={saving}
                  onBack={goToBatchList}
                  onSelectStore={(storeId) => void startCartFromStore(storeId)}
                />
              ) : screen === "cart-capture" && activeCart ? (
                <CartCapture
                  cart={activeCart}
                  saving={saving}
                  onBack={goToBatchList}
                  onAddItem={startAddItem}
                  onEditItem={startEditItem}
                  onRemoveItem={(itemId) => void removeCartItem(itemId)}
                  onConfirmPayment={startConfirmPayment}
                  onDiscardCart={deleteActiveCart}
                />
              ) : screen === "cart-item-create" && activeCart ? (
                <CartItemForm
                  title="Agregar item"
                  mode="create"
                  cart={activeCart}
                  categories={categories}
                  draft={store.itemDraft}
                  errors={store.itemValidationErrors}
                  showValidation={store.showItemValidation}
                  saving={saving}
                  onBack={() => usePurchaseCartStore.setState({ screen: "cart-capture" })}
                  onChange={updateItemDraft}
                  onSubmit={() => void createCartItem()}
                />
              ) : screen === "cart-item-edit" && activeCart ? (
                <CartItemForm
                  title="Editar item"
                  mode="edit"
                  cart={activeCart}
                  categories={categories}
                  draft={store.itemDraft}
                  errors={store.itemValidationErrors}
                  showValidation={store.showItemValidation}
                  saving={saving}
                  onBack={() => usePurchaseCartStore.setState({ screen: "cart-capture" })}
                  onChange={updateItemDraft}
                  onSubmit={() => void saveItemEdit()}
                />
              ) : screen === "payment-confirm" && activeCart ? (
                <PaymentConfirmForm
                  cart={activeCart}
                  differenceReasons={differenceReasons}
                  eligibleBatches={eligibleBatches}
                  draft={store.paymentDraft}
                  errors={store.paymentValidationErrors}
                  showValidation={store.showPaymentValidation}
                  saving={saving}
                  onBack={() => usePurchaseCartStore.setState({ screen: "cart-capture" })}
                  onChange={updatePaymentDraft}
                  onSubmit={() => void confirmCartAsBatch()}
                />
              ) : screen === "batch-detail" && selectedBatch ? (
                <BatchDetail
                  batch={selectedBatch}
                  onBack={goToBatchList}
                  onNewCartForBatch={() => {
                    if (selectedBatch) {
                      void startCartFromStore(selectedBatch.storeId);
                    }
                  }}
                  onViewAcquiredStock={viewAcquiredStock}
                />
              ) : screen === "acquired-stock" ? (
                <AcquiredStockList
                  garments={garments}
                  batches={batches}
                  onBack={goToBatchList}
                  onViewBatch={(id) => viewBatch(id)}
                />
              ) : (
                <Forbidden
                  action={
                    <Button variant="primary" onClick={goToBatchList}>
                      <RefreshCw className="size-4" aria-hidden="true" />
                      Volver a lotes
                    </Button>
                  }
                />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Sidebar móvil en Sheet */}
      <Sheet open={isMobile && mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Navegación Nexo</SheetTitle>
          <NexoSidebarContent
            collapsed={false}
            onNavigate={() => setMobileNavOpen(false)}
            {...sidebarProps}
          />
        </SheetContent>
      </Sheet>

      <Toaster />
    </TooltipProvider>
  );
}

function buildCrumbs(
  screen: ReturnType<typeof usePurchaseCartStore.getState>["screen"],
  storeName: string | undefined,
  batchStoreName: string | undefined,
  goToBatchList: () => void,
): Crumb[] {
  switch (screen) {
    case "batch-list":
      return [{ label: "Compras" }, { label: "Lotes" }];
    case "cart-create":
      return [
        { label: "Compras" },
        { label: "Lotes", onClick: goToBatchList },
        { label: "Nuevo carrito" },
      ];
    case "cart-capture":
      return [
        { label: "Compras" },
        { label: "Lotes", onClick: goToBatchList },
        { label: storeName ?? "Carrito" },
      ];
    case "cart-item-create":
      return [
        { label: "Compras" },
        { label: "Lotes", onClick: goToBatchList },
        { label: storeName ?? "Carrito" },
        { label: "Agregar item" },
      ];
    case "cart-item-edit":
      return [
        { label: "Compras" },
        { label: "Lotes", onClick: goToBatchList },
        { label: storeName ?? "Carrito" },
        { label: "Editar item" },
      ];
    case "payment-confirm":
      return [
        { label: "Compras" },
        { label: "Lotes", onClick: goToBatchList },
        { label: storeName ?? "Carrito" },
        { label: "Confirmar pago" },
      ];
    case "batch-detail":
      return [
        { label: "Compras" },
        { label: "Lotes", onClick: goToBatchList },
        { label: batchStoreName ?? "Lote" },
      ];
    case "acquired-stock":
      return [{ label: "Inventario" }, { label: "Inventario adquirido" }];
    default:
      return [{ label: "Nexo" }];
  }
}

function GlobalErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="danger" className="mb-4">
      <AlertCircle aria-hidden="true" />
      <AlertTitle>Ocurrió un error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}
