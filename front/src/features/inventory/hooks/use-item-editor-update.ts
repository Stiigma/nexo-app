import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/common/services/api-client";
import type { PaginatedResponse } from "@/common/types/api";
import type { ItemDto } from "../types/item";

export interface ItemEditorPayload {
  productName: string | null;
  brandId: string;
  categoryId: string;
  conditionId: string;
  sizeId: string | null;
  colorId: string | null;
  physicalLocation: string | null;
  targetPriceMxn: number | null;
  notes: string | null;
  costCurrency?: string;
  costAmount?: number | null;
  exchangeRate?: number | null;
  minPriceMxn?: number | null;
}

export function useItemEditorUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ItemEditorPayload }) =>
      api.put<ItemDto>(`inventory/items/${id}/editor`, data),
    onSuccess: (updatedItem) => {
      queryClient.setQueriesData<PaginatedResponse<ItemDto>>(
        { queryKey: ["inventory", "items"] },
        (current) => current
          ? {
              ...current,
              data: current.data.map((item) =>
                item.id === updatedItem.id ? updatedItem : item,
              ),
            }
          : current,
      );
      void queryClient.invalidateQueries({ queryKey: ["inventory", "stats"] });
    },
  });
}
