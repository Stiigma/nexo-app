import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { useCatalogOptions } from "../hooks/use-catalog-options";
import { useFacetedFilters } from "../hooks/use-faceted-filters";
import type { ItemStatus, FacetOption, InventoryFilters } from "../types/item";

interface FilterBarProps {
  filters: InventoryFilters;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

const STATUS_OPTIONS: { value: ItemStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "PRICE_PENDING", label: "Falta precio" },
  { value: "ACQUIRED_STOCK", label: "Adquirido" },
  { value: "AVAILABLE", label: "Disponible" },
  { value: "RESERVED", label: "Reservado" },
  { value: "SOLD", label: "Vendido" },
  { value: "RETURNED", label: "Devuelto" },
];

/** Renderiza una lista de opciones con conteo entre paréntesis */
function renderFacetOptions(
  options: FacetOption[],
  allValue: string,
  allLabel: string,
) {
  return (
    <>
      <SelectItem value={allValue}>{allLabel}</SelectItem>
      {options.map((opt) => (
        <SelectItem key={opt.value} value={opt.id ?? opt.value}>
          {opt.label}{" "}
          <span className="text-muted-foreground">({opt.count})</span>
        </SelectItem>
      ))}
    </>
  );
}

/** Calcula qué opciones del catálogo tienen count=0 respecto a las facetas */
function computeZeroCount(
  catalog: { id: string; name: string }[],
  facets: FacetOption[],
): FacetOption[] {
  const facetIds = new Set(facets.map((f) => f.id ?? f.value));
  return catalog
    .filter((c) => !facetIds.has(c.id))
    .map((c) => ({ id: c.id, value: c.id, label: c.name, count: 0 }));
}

export function FilterBar({
  filters,
  onFilterChange,
  onClearFilters,
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(filters.search ?? "");

  // Referencia de catálogo completa (para la sección "Sin inventario")
  const { brands: allBrands, categories: allCategories, sizes: allSizes } =
    useCatalogOptions();

  // Conteos de facetas desde items reales
  const { data: facets, isLoading: facetsLoading } =
    useFacetedFilters(filters);

  useEffect(() => {
    setLocalSearch(filters.search ?? "");
  }, [filters.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.search ?? "")) {
        onFilterChange("search", localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, filters.search, onFilterChange]);

  const hasFilters =
    filters.status !== "all" ||
    !!filters.brandId ||
    !!filters.categoryId ||
    !!filters.sizeId ||
    !!filters.search;

  const handleStatusChange = useCallback(
    (val: string) => {
      onFilterChange("status", val === "all" ? "" : val);
    },
    [onFilterChange],
  );

  // Opciones con count=0 (catálogo completo − facetas con items)
  const zeroBrands = useMemo(
    () => computeZeroCount(allBrands, facets?.brands ?? []),
    [allBrands, facets?.brands],
  );
  const zeroCategories = useMemo(
    () => computeZeroCount(allCategories, facets?.categories ?? []),
    [allCategories, facets?.categories],
  );
  const zeroSizes = useMemo(
    () => computeZeroCount(allSizes, facets?.sizes ?? []),
    [allSizes, facets?.sizes],
  );

  return (
    <div className="mb-6 space-y-3">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Buscar artículos..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="h-10 pl-10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Estado */}
        <Select value={filters.status ?? "all"} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => {
              const count =
                opt.value === "all"
                  ? undefined
                  : facets?.statuses.find((s) => s.value === opt.value);
              return (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                  {count && (
                    <span className="text-muted-foreground">
                      {" "}
                      ({count.count})
                    </span>
                  )}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Marca */}
        <Select
          value={filters.brandId ?? "all"}
          onValueChange={(v) => onFilterChange("brandId", v)}
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            {renderFacetOptions(facets?.brands ?? [], "all", "Todas")}
            {zeroBrands.length > 0 && (
              <details className="mt-1 px-2 text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground py-1">
                  Sin inventario ({zeroBrands.length})
                </summary>
                <div className="space-y-0.5 pl-3 pb-1">
                  {zeroBrands.map((opt) => (
                    <div key={opt.value} className="opacity-50 line-through">
                      {opt.label}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </SelectContent>
        </Select>

        {/* Categoría */}
        <Select
          value={filters.categoryId ?? "all"}
          onValueChange={(v) => onFilterChange("categoryId", v)}
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {renderFacetOptions(facets?.categories ?? [], "all", "Todas")}
            {zeroCategories.length > 0 && (
              <details className="mt-1 px-2 text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground py-1">
                  Sin inventario ({zeroCategories.length})
                </summary>
                <div className="space-y-0.5 pl-3 pb-1">
                  {zeroCategories.map((opt) => (
                    <div key={opt.value} className="opacity-50 line-through">
                      {opt.label}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </SelectContent>
        </Select>

        {/* Talla */}
        <Select
          value={filters.sizeId ?? "all"}
          onValueChange={(v) => onFilterChange("sizeId", v)}
        >
          <SelectTrigger className="h-9 w-[120px]">
            <SelectValue placeholder="Talla" />
          </SelectTrigger>
          <SelectContent>
            {renderFacetOptions(facets?.sizes ?? [], "all", "Todas")}
            {zeroSizes.length > 0 && (
              <details className="mt-1 px-2 text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground py-1">
                  Sin inventario ({zeroSizes.length})
                </summary>
                <div className="space-y-0.5 pl-3 pb-1">
                  {zeroSizes.map((opt) => (
                    <div key={opt.value} className="opacity-50 line-through">
                      {opt.label}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </SelectContent>
        </Select>

        {facetsLoading && (
          <span className="text-xs text-muted-foreground animate-pulse">
            Cargando...
          </span>
        )}

        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <X size={14} />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
