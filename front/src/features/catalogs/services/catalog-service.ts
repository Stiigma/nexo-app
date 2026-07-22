import { api } from "@/common/services/api-client";
import type { PaginatedResponse, ApiFilters } from "@/common/types/api";
import type { CatConfig, CatEntity } from "../types/catalog-entity";

/**
 * Factory que crea un servicio CRUD para una entidad de catálogo
 * a partir de su configuración. Un solo código sirve para las 9 entidades.
 */
export function createCatalogService<T extends CatEntity>(config: CatConfig<T>) {
  return {
    list: (filters: ApiFilters) =>
      api.get<PaginatedResponse<T>>(config.basePath, filters as Record<string, unknown>),

    create: <D extends Record<string, unknown>>(data: D) =>
      api.post<T>(config.basePath, data),

    update: (id: string, data: Partial<T>) =>
      api.put<T>(`${config.basePath}/${id}`, data),

    toggleActive: (id: string, active: boolean) =>
      api.patch<T>(`${config.basePath}/${id}/active`, { active }),

    remove: (id: string) => api.delete<void>(`${config.basePath}/${id}`),
  };
}

export type CatalogService<T extends CatEntity> =
  ReturnType<typeof createCatalogService<T>>;
