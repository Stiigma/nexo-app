import { useNavigate } from "react-router-dom";
import { ShoppingCart, PackageSearch, List, Camera } from "lucide-react";

interface QuickLink {
  label: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  primary?: boolean;
}

const LINKS: QuickLink[] = [
  {
    label: "Ver inventario",
    description: "Buscar, filtrar y gestionar prendas",
    path: "/inventory",
    icon: PackageSearch,
    primary: true,
  },
  {
    label: "Nueva captura",
    description: "Registrar prendas con cámara",
    path: "/capture",
    icon: Camera,
  },
  {
    label: "Catálogos",
    description: "Marcas, categorías, tallas y más",
    path: "/catalogs",
    icon: List,
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Accesos rápidos</h3>
      <div className="space-y-2">
        {LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.path}
              type="button"
              onClick={() => navigate(link.path)}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted/60 ${
                link.primary
                  ? "border-primary/30 bg-primary/5"
                  : "border-transparent"
              }`}
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-md ${
                link.primary ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
