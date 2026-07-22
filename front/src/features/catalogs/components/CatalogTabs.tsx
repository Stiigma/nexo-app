import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/common/components/ui/tabs";
import type { CatConfig, CatEntity } from "../types/catalog-entity";
import { useCatalogUIStore } from "../store/catalog-ui-store";
import { CatalogEntityView } from "./CatalogEntityView";

interface CatalogTabsProps {
  registry: CatConfig[];
}

export function CatalogTabs({ registry }: CatalogTabsProps) {
  const activeKey = useCatalogUIStore((s) => s.activeKey);
  const setActiveKey = useCatalogUIStore((s) => s.setActiveKey);

  return (
    <Tabs value={activeKey} onValueChange={setActiveKey} className="w-full">
      <TabsList className="w-full justify-start">
        {registry.map((cfg) => {
          const Icon = cfg.icon;
          return (
            <TabsTrigger key={cfg.key} value={cfg.key}>
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{cfg.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {registry.map((cfg) => (
        <TabsContent key={cfg.key} value={cfg.key}>
          <CatalogEntityViewGeneric config={cfg} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

/** Wrapper to satisfy TypeScript generic inference from a CatConfig[] entry. */
function CatalogEntityViewGeneric<T extends CatEntity>({ config }: { config: CatConfig<T> }) {
  return <CatalogEntityView config={config} />;
}
