import { useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  PackageSearch,
  List,
  Users,
  BarChart3,
  Wrench,
  Gift,
  LogOut,
  Home,
  KeyRound
} from "lucide-react";
import { useAuthStore } from "@/common/stores/auth-store";
import { useLogout } from "@/features/auth/hooks";
import { visibleNavigationForRole } from "@/common/utils/access";
import type { NavigationItem } from "@/common/utils/access";
import { cn } from "@/common/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  "shopping-cart": ShoppingCart,
  "package-search": PackageSearch,
  list: List,
  users: Users,
  "bar-chart-3": BarChart3,
  wrench: Wrench,
  gift: Gift,
  "key-round": KeyRound
};

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const logoutMutation = useLogout();

  const nav = user ? visibleNavigationForRole(user.role) : [];

  /** Dashboard path for the current user role — everyone lands on the dashboard */
  const homePath = "/dashboard";

  function isActive(item: NavigationItem): boolean {
    return location.pathname.startsWith(item.path);
  }

  return (
    <aside className="sticky top-0 hidden h-screen flex-col gap-5 bg-sidebar p-6 text-sidebar-foreground md:flex">
      <button
        type="button"
        className="flex items-center gap-2 bg-transparent border-none p-0 cursor-pointer group"
        onClick={() => navigate(homePath)}
      >
        <Home size={18} className="text-sidebar-foreground/60 group-hover:text-white transition-colors" />
        <div>
          <p className="mb-0 text-xs font-bold uppercase tracking-wide text-sidebar-foreground/60 group-hover:text-sidebar-foreground/80 transition-colors">
            Nexo
          </p>
          <h1 className="text-xl font-semibold text-background">Operaciones</h1>
        </div>
      </button>

      {user && (
        <div className="flex flex-col gap-0.5 rounded-md bg-white/5 p-3 text-sm">
          <span className="break-all text-sidebar-foreground/90">{user.email}</span>
          <span className="text-xs font-bold uppercase text-sidebar-foreground/60">
            {user.role}
          </span>
        </div>
      )}

      <nav aria-label="Principal" className="flex flex-1 flex-col gap-1.5">
        {nav.map((item) => {
          const Icon = ICON_MAP[item.icon];
          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md border-none bg-transparent px-3 py-2 text-left text-sm text-sidebar-foreground/85 transition-colors hover:bg-white/10 hover:text-white",
                isActive(item) && "bg-white/15 font-semibold text-white"
              )}
              onClick={() => navigate(item.path)}
            >
              {Icon && <Icon size={18} />}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 pt-3">
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/15"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut size={18} />
          <span>Salir</span>
        </button>
      </div>
    </aside>
  );
}
