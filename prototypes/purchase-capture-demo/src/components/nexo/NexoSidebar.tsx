import {
  BarChart3,
  BookOpen,
  Bookmark,
  Box,
  Layers,
  Package,
  Receipt,
  ShoppingCart,
  ShieldCheck,
  Users,
  Wallet,
  WifiOff,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollAreaViewport } from "@/components/ui/scroll-area";
import { NavGroup, NavItem } from "./NavItem";
import { cn } from "@/lib/utils";
import type { PurchaseCartScreen } from "@/state/usePurchaseCartStore";

type NexoSidebarContentProps = {
  current: PurchaseCartScreen;
  hasActiveCart: boolean;
  collapsed: boolean;
  offline: boolean;
  onGoToBatches: () => void;
  onGoToCart: () => void;
  onGoToAcquiredStock: () => void;
  onNavigate?: () => void;
};

function isCartScreen(screen: PurchaseCartScreen): boolean {
  return (
    screen === "cart-capture" ||
    screen === "cart-item-create" ||
    screen === "cart-item-edit" ||
    screen === "payment-confirm"
  );
}

/**
 * `NexoSidebarContent` es el contenido reutilizable del sidebar (logo, nav,
 * footer). Se usa tanto en el sidebar estático (tablet/escritorio) como en el
 * `Sheet` móvil. Va sobre placa `--chrome` (sidebar tokens).
 */
export function NexoSidebarContent({
  current,
  hasActiveCart,
  collapsed,
  offline,
  onGoToBatches,
  onGoToCart,
  onGoToAcquiredStock,
  onNavigate,
}: NexoSidebarContentProps) {
  const handleNav = (fn: () => void) => () => {
    fn();
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Marca sobre placa oscura */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        {collapsed ? (
          <img
            src={`${import.meta.env.BASE_URL}nexo-mark.svg`}
            alt="Nexo"
            className="size-8"
          />
        ) : (
          <img
            src={`${import.meta.env.BASE_URL}nexo-logo.png`}
            alt="Nexo"
            className="h-9 w-auto max-w-[150px] object-contain"
          />
        )}
      </div>

      <ScrollArea className="flex-1">
        <ScrollAreaViewport className="h-full">
          <nav
            aria-label="Navegación principal"
            className={cn("grid gap-3 p-3", collapsed && "px-2")}
          >
            <NavGroup label="Compras" collapsed={collapsed}>
              <NavItem
                icon={Layers}
                label="Lotes"
                active={current === "batch-list"}
                collapsed={collapsed}
                onClick={handleNav(onGoToBatches)}
              />
              <NavItem
                icon={ShoppingCart}
                label="Carrito activo"
                active={isCartScreen(current)}
                disabled={!hasActiveCart}
                collapsed={collapsed}
                onClick={handleNav(onGoToCart)}
              />
            </NavGroup>

            <NavGroup label="Inventario" collapsed={collapsed}>
              <NavItem
                icon={Box}
                label="Inventario adquirido"
                active={current === "acquired-stock"}
                collapsed={collapsed}
                onClick={handleNav(onGoToAcquiredStock)}
              />
              <NavItem
                icon={Package}
                label="Inventario"
                comingSoon
                collapsed={collapsed}
              />
            </NavGroup>

            <NavGroup label="Ventas" collapsed={collapsed}>
              <NavItem icon={Receipt} label="Ventas" comingSoon collapsed={collapsed} />
              <NavItem icon={Bookmark} label="Apartados" comingSoon collapsed={collapsed} />
              <NavItem icon={Users} label="Clientes" comingSoon collapsed={collapsed} />
            </NavGroup>

            <NavGroup label="Operación" collapsed={collapsed}>
              <NavItem icon={Wallet} label="Gastos" comingSoon collapsed={collapsed} />
              <NavItem icon={BarChart3} label="Reportes" comingSoon collapsed={collapsed} />
            </NavGroup>

            <NavGroup label="Admin" collapsed={collapsed}>
              <NavItem icon={BookOpen} label="Catálogos" comingSoon collapsed={collapsed} />
              <NavItem icon={ShieldCheck} label="Usuarios" comingSoon collapsed={collapsed} />
            </NavGroup>
          </nav>
        </ScrollAreaViewport>
      </ScrollArea>

      {/* Footer: usuario/rol, offline, versión */}
      <div
        className={cn(
          "shrink-0 border-t border-sidebar-border p-3 text-xs text-sidebar-foreground/55",
          collapsed && "px-2",
        )}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            {offline ? (
              <WifiOff className="size-4 text-warning" aria-label="Sin conexión" />
            ) : null}
          </div>
        ) : (
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sidebar-foreground/80">Operador</span>
              {offline ? (
                <Badge variant="warning" className="gap-1">
                  <WifiOff className="size-3" aria-hidden="true" />
                  Sin conexión
                </Badge>
              ) : null}
            </div>
            <span className="text-sidebar-foreground/40">Prototype v4 · SQLite local</span>
          </div>
        )}
      </div>
    </div>
  );
}

type NexoSidebarProps = NexoSidebarContentProps & {
  collapsed: boolean;
};

/**
 * `NexoSidebar` es el contenedor estático (tablet/escritorio): rail colapsado
 * (`w-16`) o expandido (`w-64`). El móvil usa `NexoSidebarContent` dentro de
 * un `Sheet` gestionado por `NexoAppShell`.
 */
export function NexoSidebar({ collapsed, ...content }: NexoSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
      aria-label="Barra lateral"
    >
      <div className="w-full">
        <NexoSidebarContent collapsed={collapsed} {...content} />
      </div>
    </aside>
  );
}

export type { NexoSidebarContentProps };
