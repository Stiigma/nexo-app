import { PackageSearch } from "lucide-react";

export function InventoryEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 animate-float text-muted-foreground/40">
        <PackageSearch size={80} />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">
        Aún no tienes artículos
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Comienza registrando tu inventario para ver tus artículos aquí.
      </p>
    </div>
  );
}
