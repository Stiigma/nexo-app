import { Search, Plus } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Button } from "@/common/components/ui/button";
import type { CatConfig, CatEntity } from "../types/catalog-entity";

interface CatalogToolbarProps<T extends CatEntity> {
  config: CatConfig<T>;
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
}

export function CatalogToolbar<T extends CatEntity>({
  config,
  search,
  onSearchChange,
  onCreate,
}: CatalogToolbarProps<T>) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Buscar ${config.singular.toLowerCase()}...`}
          className="pl-9"
          aria-label={`Buscar ${config.label}`}
        />
      </div>
      <Button onClick={onCreate} className="shrink-0">
        <Plus className="h-4 w-4" />
        Nueva {config.singular}
      </Button>
    </div>
  );
}
