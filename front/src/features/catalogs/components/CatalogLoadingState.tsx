import { Skeleton } from "@/common/components/ui/skeleton";
import type { CatConfig, CatEntity } from "../types/catalog-entity";

interface CatalogLoadingStateProps<T extends CatEntity> {
  config: CatConfig<T>;
}

/** Filas skeleton que imitan la estructura de columnas de la tabla real. */
export function CatalogLoadingState<T extends CatEntity>({
  config,
}: CatalogLoadingStateProps<T>) {
  const cols = config.columns.length + 2; // + active + actions
  return (
    <div className="space-y-2 p-1">
      <div className="flex gap-3 border-b border-border pb-2">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, row) => (
        <div key={row} className="flex gap-3">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
