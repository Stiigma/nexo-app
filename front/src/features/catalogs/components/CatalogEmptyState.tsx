import { Button } from "@/common/components/ui/button";
import type { CatConfig, CatEntity } from "../types/catalog-entity";

interface CatalogEmptyStateProps<T extends CatEntity> {
  config: CatConfig<T>;
  onCreate: () => void;
  hasSearch?: boolean;
}

export function CatalogEmptyState<T extends CatEntity>({
  config,
  onCreate,
  hasSearch,
}: CatalogEmptyStateProps<T>) {
  const Icon = config.icon;
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {hasSearch ? <span className="text-xl">🔍</span> : <Icon className="h-7 w-7" />}
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">
          {hasSearch
            ? `No se encontraron ${config.label.toLowerCase()} con "${""}".`
            : `Aún no hay ${config.label.toLowerCase()}`}
        </p>
        {!hasSearch && (
          <p className="text-sm text-muted-foreground">{config.description}</p>
        )}
      </div>
      {hasSearch ? (
        <Button variant="outline" size="sm" onClick={() => onCreate()}>
          Limpiar búsqueda
        </Button>
      ) : (
        <Button size="sm" onClick={onCreate}>
          + Nueva {config.singular}
        </Button>
      )}
    </div>
  );
}
