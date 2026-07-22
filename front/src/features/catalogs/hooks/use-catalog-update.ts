import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCatalogService } from "../services/catalog-service";
import type { CatConfig, CatEntity } from "../types/catalog-entity";

/** useMutation genérico para actualizar. Invalida la lista al éxito. */
export function useCatalogUpdate<T extends CatEntity>(config: CatConfig<T>) {
  const qc = useQueryClient();
  const service = createCatalogService(config);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<T> }) =>
      service.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [config.key, "list"] });
    },
  });
}
