import type { ApiFilters } from "@/common/types/api";

/**
 * Convierte ApiFilters → query params del backend.
 * Resuelve la diferencia `isActive` (frontend) → `active` (backend).
 * Omite valores vacíos/nulos para no enviar params innecesarios.
 */
export function buildQueryParams(filters: ApiFilters): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.search && filters.search.trim()) {
    params.search = filters.search.trim();
  }
  if (filters.page !== undefined && filters.page > 0) {
    params.page = String(filters.page);
  }
  if (filters.limit !== undefined && filters.limit > 0) {
    params.limit = String(filters.limit);
  }
  if (filters.sortBy) {
    params.sortBy = filters.sortBy;
  }
  if (filters.sortOrder) {
    params.sortOrder = filters.sortOrder;
  }
  if (filters.isActive !== undefined) {
    params.active = String(filters.isActive);
  }

  return params;
}
