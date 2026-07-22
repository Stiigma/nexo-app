import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCatalogService } from "../services/catalog-service";
import type { CatConfig, CatEntity } from "../types/catalog-entity";

/** useMutation genérico para crear. Invalida la lista al éxito. */
export function useCatalogCreate<T extends CatEntity>(config: CatConfig<T>) {
  const qc = useQueryClient();
  const service = createCatalogService(config);

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => service.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [config.key, "list"] });
    },
  });
}
