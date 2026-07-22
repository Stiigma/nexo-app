import { create } from "zustand";
import type { CatEntity } from "../types/catalog-entity";

interface CatalogUIState {
  // Tab activo
  activeKey: string;
  setActiveKey: (key: string) => void;

  // Búsqueda (por entidad, persiste al cambiar de tab)
  searchByEntity: Record<string, string>;
  setSearch: (key: string, query: string) => void;

  // Página actual (por entidad)
  pageByEntity: Record<string, number>;
  setPage: (key: string, page: number) => void;

  // Modal de crear/editar
  formOpen: boolean;
  formMode: "create" | "edit";
  editingEntity: CatEntity | null;
  openCreate: () => void;
  openEdit: (entity: CatEntity) => void;
  closeForm: () => void;

  // Confirmación de eliminar
  deleteTarget: CatEntity | null;
  openDeleteConfirm: (entity: CatEntity) => void;
  closeDeleteConfirm: () => void;
}

export const useCatalogUIStore = create<CatalogUIState>((set) => ({
  activeKey: "stores",
  setActiveKey: (activeKey) => set({ activeKey }),

  searchByEntity: {},
  setSearch: (key, query) =>
    set((s) => ({ searchByEntity: { ...s.searchByEntity, [key]: query } })),

  pageByEntity: {},
  setPage: (key, page) =>
    set((s) => ({ pageByEntity: { ...s.pageByEntity, [key]: page } })),

  formOpen: false,
  formMode: "create",
  editingEntity: null,
  openCreate: () => set({ formOpen: true, formMode: "create", editingEntity: null }),
  openEdit: (entity) =>
    set({ formOpen: true, formMode: "edit", editingEntity: entity }),
  closeForm: () => set({ formOpen: false, editingEntity: null }),

  deleteTarget: null,
  openDeleteConfirm: (entity) => set({ deleteTarget: entity }),
  closeDeleteConfirm: () => set({ deleteTarget: null }),
}));
