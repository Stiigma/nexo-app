import { useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, PackageSearch, BarChart3, List, Users, Wrench, Gift } from "lucide-react";
import { useAuthStore } from "@/common/stores/auth-store";
import { allowedRoutesForRole, type RouteConfig } from "@/common/utils/access";
import { cn } from "@/common/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  "shopping-cart": ShoppingCart,
  "package-search": PackageSearch,
  list: List,
  users: Users,
  "bar-chart-3": BarChart3,
  wrench: Wrench,
  gift: Gift,
};

function renderIcon(route: RouteConfig) {
  const Icon = ICON_MAP[route.icon];
  return Icon ? <Icon size={20} /> : null;
}

export function MobileNav() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const visible = allowedRoutesForRole(user.role);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] flex h-[60px] items-center justify-around border-t border-border bg-card md:hidden"
      aria-label="Navegación móvil"
    >
      {visible.map((item) => {
        const active = location.pathname.startsWith(item.path);

        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              "flex flex-col items-center gap-0.5 border-none bg-transparent p-2 text-[0.68rem] text-muted-foreground",
              active && "font-semibold text-primary",
            )}
            onClick={() => navigate(item.path)}
          >
            {renderIcon(item)}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
