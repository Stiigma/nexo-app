import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/common/services/api-client";
import type { PaginatedResponse } from "@/common/types/api";
import type { ItemDto, InventoryFilters } from "../types/item";

function buildParams(filters: InventoryFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 12,
    sortBy: "createdAt",
    sortOrder: "desc",
  };
  if (filters.search) params.search = filters.search;
  if (filters.status && filters.status !== "all") params.status = filters.status;
  if (filters.brandId) params.brandId = filters.brandId;
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.sizeId) params.sizeId = filters.sizeId;
  if (filters.conditionId) params.conditionId = filters.conditionId;
  if (filters.colorId) params.colorId = filters.colorId;
  return params;
}

export function useInventoryList(filters: InventoryFilters) {
  const params = buildParams(filters);

  return useQuery({
    queryKey: ["inventory", "items", params] as const,
    queryFn: () => api.get<PaginatedResponse<ItemDto>>("inventory/items", params),
    placeholderData: keepPreviousData,
  });
}
