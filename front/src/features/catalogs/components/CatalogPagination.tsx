import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import type { PaginationMeta } from "@/common/types/api";

interface CatalogPaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

/** Rango de páginas a mostrar (con ellipsis). */
function getPageRange(current: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (current >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", current - 1, current, current + 1, "...", totalPages];
}

export function CatalogPagination({ meta, onPageChange }: CatalogPaginationProps) {
  if (meta.total === 0) return null;

  const start = (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);
  const pages = getPageRange(meta.page, meta.totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 mt-4">
      <p className="text-sm text-muted-foreground">
        Mostrando {start}-{end} de {meta.total} resultados
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!meta.hasPrevious}
          onClick={() => onPageChange(meta.page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e-${i}`} className="px-2 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === meta.page ? "default" : "outline"}
              size="sm"
              className={cn("h-8 min-w-8 px-2", p === meta.page && "pointer-events-none")}
              onClick={() => onPageChange(p)}
              aria-current={p === meta.page ? "page" : undefined}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!meta.hasNext}
          onClick={() => onPageChange(meta.page + 1)}
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
