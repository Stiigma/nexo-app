import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useInventoryUIStore } from "../store/inventory-ui.store";
import { useInventoryStats } from "../hooks/use-inventory-stats";
import { useInventoryList } from "../hooks/use-inventory-list";
import {
  HeroDashboard,
  FilterBar,
  InventoryGrid,
  ItemDetailModal,
  ItemEditorDialog,
  ItemCreatorDialog,
} from "../components";
import { Button } from "@/common/components/ui/button";
import type { ItemDto, InventoryFilters } from "../types/item";

export function InventoryPage() {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  // Admin y Operador ven datos financieros. Solo roles futuros limitados (ej. Viewer) los ocultarían.
  const canViewFinancials = true;
  const {
    search,
    status,
    brandId,
    categoryId,
    sizeId,
    conditionId,
    colorId,
    page,
    selectedItemId,
    isDetailOpen,
    setFilter,
    clearFilters,
    setPage,
    openDetail,
    closeDetail,
  } = useInventoryUIStore();

  const filters: InventoryFilters = useMemo(
    () => ({
      search: search || undefined,
      status: status === "all" ? undefined : status,
      brandId: brandId ?? undefined,
      categoryId: categoryId ?? undefined,
      sizeId: sizeId ?? undefined,
      conditionId: conditionId ?? undefined,
      colorId: colorId ?? undefined,
      page,
      limit: 12,
    }),
    [search, status, brandId, categoryId, sizeId, conditionId, colorId, page],
  );

  const { data: stats, isLoading: statsLoading } = useInventoryStats();
  const { data: listData, isLoading: itemsLoading, isError, error, refetch } = useInventoryList(filters);

  const items = listData?.data ?? [];
  const isEmpty = !itemsLoading && !isError && items.length === 0;
  const selectedItem = useMemo<ItemDto | undefined>(() => {
    if (!selectedItemId) return undefined;
    return items.find((i) => i.id === selectedItemId);
  }, [selectedItemId, items]);
  const editingItem = useMemo<ItemDto | undefined>(() => {
    if (!editingItemId) return undefined;
    return items.find((item) => item.id === editingItemId);
  }, [editingItemId, items]);

  return (
    <div>
      <HeroDashboard
        stats={stats}
        isLoading={statsLoading}
        canViewFinancials={canViewFinancials}
      />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Prendas</h2>
        <Button
          onClick={() => setIsCreatorOpen(true)}
          className="min-h-11"
        >
          <Plus className="h-4 w-4" />
          Nueva prenda
        </Button>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={setFilter}
        onClearFilters={clearFilters}
      />

      <InventoryGrid
        items={items}
        isLoading={itemsLoading}
        isError={isError}
        errorMessage={error?.message}
        isEmpty={isEmpty}
        onRetry={() => refetch()}
        onViewDetail={openDetail}
        canViewFinancials={canViewFinancials}
      />

      {listData?.meta && items.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((page - 1) * 12) + 1}–{Math.min(page * 12, listData.meta.total)} de{" "}
            {listData.meta.total}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={!listData.meta.hasNext}
              onClick={() => setPage(page + 1)}
              className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          open={isDetailOpen}
          onClose={closeDetail}
          onEdit={setEditingItemId}
          canViewFinancials={canViewFinancials}
        />
      )}

      <ItemEditorDialog
        itemId={editingItemId}
        open={Boolean(editingItem)}
        onClose={() => setEditingItemId(null)}
        canViewFinancials={canViewFinancials}
      />

      <ItemCreatorDialog
        open={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
      />
    </div>
  );
}
