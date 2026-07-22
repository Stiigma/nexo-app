import { CatalogTabs } from "../components/CatalogTabs";
import { CATALOG_REGISTRY } from "../config/registry";

export function CatalogsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Catálogos</h2>
        <p className="text-sm text-muted-foreground">
          Administra los catálogos operativos: tiendas, marcas, tipos de ropa y más.
        </p>
      </div>
      <CatalogTabs registry={CATALOG_REGISTRY} />
    </div>
  );
}
