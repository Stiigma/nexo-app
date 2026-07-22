import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCatalogService } from "../services/catalog-service";
import type { CatConfig, CatEntity } from "../types/catalog-entity";

/** useMutation genérico para eliminar. Invalida la lista al éxito. */
export function useCatalogDelete<T extends CatEntity>(config: CatConfig<T>) {
  const qc = useQueryClient();
  const service = createCatalogService(config);

  return useMutation({
    mutationFn: (id: string) => service.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [config.key, "list"] });
    },
  });
}
