import { useMemo, useState } from "react";
import { useInventoryUIStore } from "../store/inventory-ui.store";
import { useAuthStore } from "@/common/stores/auth-store";
import { useInventoryStats } from "../hooks/use-inventory-stats";
import { useInventoryList } from "../hooks/use-inventory-list";
import {
  HeroDashboard,
  FilterBar,
  InventoryGrid,
  ItemDetailModal,
  ItemEditorDialog,
} from "../components";
import type { ItemDto, InventoryFilters } from "../types/item";

export function InventoryPage() {
  const [editingItem, setEditingItem] = useState<ItemDto | null>(null);
  const canViewFinancials = useAuthStore((state) => state.user?.role === "Admin");
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

  return (
    <div>
      <HeroDashboard
        stats={stats}
        isLoading={statsLoading}
        canViewFinancials={canViewFinancials}
      />

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
          onEdit={setEditingItem}
          canViewFinancials={canViewFinancials}
        />
      )}

      <ItemEditorDialog
        item={editingItem}
        open={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        canViewFinancials={canViewFinancials}
      />
    </div>
  );
}
