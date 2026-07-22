import { useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, PackageSearch, BarChart3, List, Users, Wrench } from "lucide-react";
import { useAuthStore } from "@/common/stores/auth-store";
import { cn } from "@/common/lib/utils";

const MOBILE_NAV = [
  { path: "/capture", label: "Captura", icon: ShoppingCart, roles: ["Admin", "Operator"] },
  { path: "/inventory", label: "Inventario", icon: PackageSearch, roles: ["Admin", "Operator"] },
  { path: "/admin/catalogs", label: "Catálogos", icon: List, roles: ["Admin", "Operator"] },
  { path: "/admin/users", label: "Usuarios", icon: Users, roles: ["Admin"] },
  { path: "/admin/corrections", label: "Correcciones", icon: Wrench, roles: ["Admin"] },
  { path: "/admin/reports", label: "Reportes", icon: BarChart3, roles: ["Admin"] }
];

export function MobileNav() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const visible = MOBILE_NAV.filter((item) => item.roles.includes(user.role));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] flex h-[60px] items-center justify-around border-t border-border bg-card md:hidden"
      aria-label="Navegación móvil"
    >
      {visible.map((item) => {
        const Icon = item.icon;
        const active = location.pathname.startsWith(item.path);

        return (
          <button
            key={item.path}
            type="button"
            className={cn(
              "flex flex-col items-center gap-0.5 border-none bg-transparent p-2 text-[0.68rem] text-muted-foreground",
              active && "font-semibold text-primary"
            )}
            onClick={() => navigate(item.path)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
