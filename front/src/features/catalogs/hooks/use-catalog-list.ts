import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { createCatalogService } from "../services/catalog-service";
import { buildQueryParams } from "../helpers/build-query-params";
import type { CatConfig, CatEntity } from "../types/catalog-entity";
import type { ApiFilters } from "@/common/types/api";

/** useQuery genérico paginado. Mantiene data anterior al paginar (sin flash). */
export function useCatalogList<T extends CatEntity>(
  config: CatConfig<T>,
  filters: ApiFilters,
) {
  const service = createCatalogService(config);
  const params = buildQueryParams(filters);

  return useQuery({
    queryKey: [config.key, "list", params] as const,
    queryFn: () => service.list(filters),
    placeholderData: keepPreviousData,
  });
}
