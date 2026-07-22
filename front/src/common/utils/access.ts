import type { UserRole } from "@/common/types";

export type AppRouteId =
  | "operator-workspace"
  | "admin-inventory"
  | "admin-catalogs"
  | "admin-users"
  | "reports"
  | "corrections"
  | "set-password";

export interface NavigationItem {
  id: AppRouteId;
  label: string;
  path: string;
  requiredRole: UserRole;
  icon: string;
}

export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    id: "operator-workspace",
    label: "Captura",
    path: "/capture",
    requiredRole: "Operator",
    icon: "shopping-cart"
  },
  {
    id: "admin-inventory",
    label: "Inventario",
    path: "/admin/inventory",
    requiredRole: "Admin",
    icon: "package-search"
  },
  {
    id: "admin-catalogs",
    label: "Catálogos",
    path: "/admin/catalogs",
    requiredRole: "Operator",
    icon: "list"
  },
  {
    id: "admin-users",
    label: "Usuarios",
    path: "/admin/users",
    requiredRole: "Admin",
    icon: "users"
  },
  {
    id: "reports",
    label: "Reportes",
    path: "/admin/reports",
    requiredRole: "Admin",
    icon: "bar-chart-3"
  },
  {
    id: "corrections",
    label: "Correcciones",
    path: "/admin/corrections",
    requiredRole: "Admin",
    icon: "wrench"
  },
];

export function canAccessRoute(role: UserRole, routeId: AppRouteId): boolean {
  const route = NAVIGATION_ITEMS.find((item) => item.id === routeId);
  if (!route) return false;
  if (role === "Admin") return true;
  return route.requiredRole === "Operator";
}

export function visibleNavigationForRole(role: UserRole): readonly NavigationItem[] {
  return NAVIGATION_ITEMS.filter((item) => canAccessRoute(role, item.id));
}
