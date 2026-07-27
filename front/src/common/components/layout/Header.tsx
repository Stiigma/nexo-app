import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/common/stores/auth-store";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/capture": "Captura",
  "/inventory": "Inventario",
  "/catalogs": "Catálogos",
  "/admin/users": "Usuarios",
  "/admin/reports": "Reportes",
  "/admin/corrections": "Correcciones"
};

export function Header() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const title = TITLES[location.pathname] ?? "Nexo";

  return (
    <header className="flex min-h-[60px] flex-col items-start justify-between gap-1 border-b border-border bg-card px-4 py-3 md:flex-row md:items-center md:px-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {user ? user.role : "Sin sesión"}
        </p>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
    </header>
  );
}
