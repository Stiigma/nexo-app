import { useQuery } from "@tanstack/react-query";
import { api } from "@/common/services/api-client";
import type { FacetCounts, InventoryFilters } from "../types/item";

function buildFacetParams(filters: InventoryFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (filters.search) params.search = filters.search;
  if (filters.status && filters.status !== "all") params.status = filters.status;
  if (filters.brandId) params.brandId = filters.brandId;
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.sizeId) params.sizeId = filters.sizeId;
  if (filters.conditionId) params.conditionId = filters.conditionId;
  if (filters.colorId) params.colorId = filters.colorId;
  return params;
}

export function useFacetedFilters(filters: InventoryFilters) {
  const params = buildFacetParams(filters);

  return useQuery({
    queryKey: ["inventory", "facets", params] as const,
    queryFn: () => api.get<FacetCounts>("inventory/items/facets", params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}
