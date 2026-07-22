import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCatalogService } from "../services/catalog-service";
import type { CatConfig, CatEntity } from "../types/catalog-entity";

/** useMutation genérico para toggle active/inactive. Invalida la lista al éxito. */
export function useCatalogToggle<T extends CatEntity>(config: CatConfig<T>) {
  const qc = useQueryClient();
  const service = createCatalogService(config);

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      service.toggleActive(id, active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [config.key, "list"] });
    },
  });
}
