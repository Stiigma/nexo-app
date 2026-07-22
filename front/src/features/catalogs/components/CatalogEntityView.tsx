import { toast } from "sonner";
import { ApiError } from "@/common/types/api";
import type { CatConfig, CatEntity } from "../types/catalog-entity";
import { useCatalogList } from "../hooks/use-catalog-list";
import { useCatalogToggle } from "../hooks/use-catalog-toggle";
import { useDebouncedSearch } from "../hooks/use-debounced-search";
import { useCatalogUIStore } from "../store/catalog-ui-store";
import { CatalogToolbar } from "./CatalogToolbar";
import { CatalogDataTable } from "./CatalogDataTable";
import { CatalogPagination } from "./CatalogPagination";
import { CatalogEmptyState } from "./CatalogEmptyState";
import { CatalogErrorState } from "./CatalogErrorState";
import { CatalogLoadingState } from "./CatalogLoadingState";
import { CatalogFormDialog } from "./CatalogFormDialog";
import { CatalogDeleteDialog } from "./CatalogDeleteDialog";

const PAGE_SIZE = 20;

interface CatalogEntityViewProps<T extends CatEntity> {
  config: CatConfig<T>;
}

export function CatalogEntityView<T extends CatEntity>({ config }: CatalogEntityViewProps<T>) {
  const search = useCatalogUIStore((s) => s.searchByEntity[config.key] ?? "");
  const setSearch = useCatalogUIStore((s) => s.setSearch);
  const page = useCatalogUIStore((s) => s.pageByEntity[config.key] ?? 1);
  const setPage = useCatalogUIStore((s) => s.setPage);

  const formOpen = useCatalogUIStore((s) => s.formOpen);
  const formMode = useCatalogUIStore((s) => s.formMode);
  const editingEntity = useCatalogUIStore((s) => s.editingEntity);
  const openCreate = useCatalogUIStore((s) => s.openCreate);
  const openEdit = useCatalogUIStore((s) => s.openEdit);
  const closeForm = useCatalogUIStore((s) => s.closeForm);

  const deleteTarget = useCatalogUIStore((s) => s.deleteTarget);
  const openDeleteConfirm = useCatalogUIStore((s) => s.openDeleteConfirm);
  const closeDeleteConfirm = useCatalogUIStore((s) => s.closeDeleteConfirm);

  const debouncedSearch = useDebouncedSearch(search, 300);
  const toggleMutation = useCatalogToggle(config);

  // Reset page when search changes
  const effectivePage = debouncedSearch ? 1 : page;

  const { data, isLoading, isError, error, refetch } = useCatalogList(config, {
    search: debouncedSearch || undefined,
    page: effectivePage,
    limit: PAGE_SIZE,
  });

  function handleSearchChange(value: string) {
    setSearch(config.key, value);
    if (value && page !== 1) setPage(config.key, 1);
  }

  async function handleToggle(entity: T) {
    const prev = entity.active;
    try {
      await toggleMutation.mutateAsync({ id: entity.id, active: !prev });
      toast.success(`${config.singular} ${!prev ? "activada" : "desactivada"}`);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Error desconocido";
      toast.error(`No se pudo cambiar el estado: ${message}`);
    }
  }

  const items = data?.data ?? [];
  const showEmpty = !isLoading && !isError && items.length === 0;

  return (
    <div className="space-y-4">
      <CatalogToolbar
        config={config}
        search={search}
        onSearchChange={handleSearchChange}
        onCreate={openCreate}
      />

      {isLoading && <CatalogLoadingState config={config} />}

      {isError && (
        <CatalogErrorState label={config.label} error={error} onRetry={() => refetch()} />
      )}

      {showEmpty && (
        <CatalogEmptyState
          config={config}
          onCreate={openCreate}
          hasSearch={!!search}
        />
      )}

      {!isLoading && !isError && items.length > 0 && (
        <>
          <CatalogDataTable
            config={config}
            data={items}
            onEdit={(e) => openEdit(e)}
            onDelete={(e) => openDeleteConfirm(e)}
            onToggle={handleToggle}
          />
          {data?.meta && (
            <CatalogPagination meta={data.meta} onPageChange={(p) => setPage(config.key, p)} />
          )}
        </>
      )}

      <CatalogFormDialog
        config={config}
        open={formOpen}
        mode={formMode}
        editingEntity={editingEntity as T | null}
        onClose={closeForm}
      />

      <CatalogDeleteDialog
        config={config}
        target={deleteTarget as T | null}
        onClose={closeDeleteConfirm}
      />
    </div>
  );
}
