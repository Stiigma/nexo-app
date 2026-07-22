import { useQueries } from "@tanstack/react-query";
import { api } from "@/common/services/api-client";

interface CatalogOption {
  id: string;
  name: string;
}

interface PaginatedCatalogResult {
  data: CatalogOption[];
}

export function useCatalogOptions() {
  return useQueries({
    queries: [
      {
        queryKey: ["catalogs", "brands", "options"],
        queryFn: () =>
          api.get<PaginatedCatalogResult>("catalogs/brands", {
            active: true,
            limit: 100,
          }),
        staleTime: 5 * 60_000,
      },
      {
        queryKey: ["catalogs", "categories", "options"],
        queryFn: () =>
          api.get<PaginatedCatalogResult>("catalogs/categories", {
            active: true,
            limit: 100,
          }),
        staleTime: 5 * 60_000,
      },
      {
        queryKey: ["catalogs", "sizes", "options"],
        queryFn: () =>
          api.get<PaginatedCatalogResult>("catalogs/sizes", {
            active: true,
            limit: 100,
          }),
        staleTime: 5 * 60_000,
      },
      {
        queryKey: ["catalogs", "conditions", "options"],
        queryFn: () =>
          api.get<PaginatedCatalogResult>("catalogs/conditions", {
            active: true,
            limit: 100,
          }),
        staleTime: 5 * 60_000,
      },
      {
        queryKey: ["catalogs", "colors", "options"],
        queryFn: () =>
          api.get<PaginatedCatalogResult>("catalogs/colors", {
            active: true,
            limit: 100,
          }),
        staleTime: 5 * 60_000,
      },
    ],
    combine: (results) => ({
      brands: results[0]?.data?.data ?? [],
      categories: results[1]?.data?.data ?? [],
      sizes: results[2]?.data?.data ?? [],
      conditions: results[3]?.data?.data ?? [],
      colors: results[4]?.data?.data ?? [],
      isLoading: results.some((r) => r.isLoading),
    }),
  });
}
