import { create } from "zustand";
import type { ItemStatus } from "../types/item";

interface InventoryUIState {
  search: string;
  status: ItemStatus | "all";
  brandId: string | null;
  categoryId: string | null;
  sizeId: string | null;
  conditionId: string | null;
  colorId: string | null;
  page: number;
  selectedItemId: string | null;
  isDetailOpen: boolean;

  setFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;
}

const INITIAL = {
  search: "",
  status: "all" as ItemStatus | "all",
  brandId: null as string | null,
  categoryId: null as string | null,
  sizeId: null as string | null,
  conditionId: null as string | null,
  colorId: null as string | null,
  page: 1,
  selectedItemId: null as string | null,
  isDetailOpen: false,
};

export const useInventoryUIStore = create<InventoryUIState>((set) => ({
  ...INITIAL,

  setFilter: (key, value) =>
    set({
      [key]: value === "all" ? null : value,
      page: 1,
    } as Partial<InventoryUIState>),

  clearFilters: () =>
    set({
      ...INITIAL,
    }),

  setPage: (page) => set({ page }),

  openDetail: (id) => set({ selectedItemId: id, isDetailOpen: true }),
  closeDetail: () => set({ selectedItemId: null, isDetailOpen: false }),
}));
