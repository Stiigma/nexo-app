import type { UserRole } from "@/common/types";

/**
 * Centralized route configuration — single source of truth for routing,
 * role-based access, and navigation rendering.
 *
 * Rules:
 * - `allowedRoles` defines which roles can access the route.
 * - Admin automatically passes every route (superset).
 * - Sidebar and MobileNav consume `allowedRoutesForRole()`.
 * - routes.tsx uses `canAccessRoute()` for guards.
 */
export interface RouteConfig {
  id: string;
  label: string;
  path: string;
  allowedRoles: UserRole[];
  icon: string;
}

export const ROUTE_CONFIG: readonly RouteConfig[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    allowedRoles: ["Admin", "Operator"],
    icon: "bar-chart-3",
  },
  {
    id: "capture",
    label: "Captura",
    path: "/capture",
    allowedRoles: ["Admin", "Operator"],
    icon: "shopping-cart",
  },
  {
    id: "inventory",
    label: "Inventario",
    path: "/inventory",
    allowedRoles: ["Admin", "Operator"],
    icon: "package-search",
  },
  {
    id: "catalogs",
    label: "Catálogos",
    path: "/catalogs",
    allowedRoles: ["Admin", "Operator"],
    icon: "list",
  },
  {
    id: "admin-giveaways",
    label: "Giveaways",
    path: "/admin/giveaways",
    allowedRoles: ["Admin"],
    icon: "gift",
  },
  {
    id: "admin-users",
    label: "Usuarios",
    path: "/admin/users",
    allowedRoles: ["Admin"],
    icon: "users",
  },
  {
    id: "admin-reports",
    label: "Reportes",
    path: "/admin/reports",
    allowedRoles: ["Admin"],
    icon: "bar-chart-3",
  },
  {
    id: "admin-corrections",
    label: "Correcciones",
    path: "/admin/corrections",
    allowedRoles: ["Admin"],
    icon: "wrench",
  },
];

export function canAccessRoute(role: UserRole, route: RouteConfig): boolean {
  if (role === "Admin") return true;
  return route.allowedRoles.includes(role);
}

export function allowedRoutesForRole(role: UserRole): readonly RouteConfig[] {
  return ROUTE_CONFIG.filter((route) => canAccessRoute(role, route));
}

/** Backwards-compatible alias for existing consumers. */
export const NAVIGATION_ITEMS = ROUTE_CONFIG;

/** @deprecated Use `RouteConfig` directly. */
export type NavigationItem = RouteConfig;

/** @deprecated Use `allowedRoutesForRole()`. */
export const visibleNavigationForRole = allowedRoutesForRole;
