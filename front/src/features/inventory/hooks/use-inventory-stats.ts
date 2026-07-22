import { useQuery } from "@tanstack/react-query";
import { api } from "@/common/services/api-client";
import type { InventoryStats } from "../types/item";

export function useInventoryStats() {
  return useQuery({
    queryKey: ["inventory", "stats"],
    queryFn: () => api.get<InventoryStats>("inventory/items/stats"),
    staleTime: 60_000,
  });
}
