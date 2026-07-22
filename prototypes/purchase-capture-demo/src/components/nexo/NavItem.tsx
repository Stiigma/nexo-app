import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type NavItemProps = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
};

/**
 * `NavItem` es un item de sidebar. En modo rail (colapsado) muestra sólo el
 * icono con tooltip; en modo expandido, icono + etiqueta + badge opcional.
 * Los items "próximamente" son no interactivos (`aria-disabled`).
 */
export function NavItem({
  icon: Icon,
  label,
  active = false,
  disabled = false,
  comingSoon = false,
  collapsed = false,
  onClick,
}: NavItemProps) {
  const isInteractive = !disabled && !comingSoon;

  const inner = (
    <button
      type="button"
      onClick={isInteractive ? onClick : undefined}
      aria-current={active ? "page" : undefined}
      aria-disabled={!isInteractive || undefined}
      disabled={disabled}
      className={cn(
        "group flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-brand/40",
        collapsed && "justify-center px-0",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        !isInteractive && "cursor-not-allowed opacity-50 hover:bg-transparent",
      )}
    >
      <Icon
        className={cn("size-4.5 shrink-0", active && "text-brand")}
        aria-hidden="true"
      />
      {!collapsed ? (
        <>
          <span className="flex-1 truncate text-left">{label}</span>
          {comingSoon ? (
            <Badge variant="neutral" className="border-sidebar-border bg-sidebar-accent/60 text-sidebar-foreground/60">
              pronto
            </Badge>
          ) : null}
        </>
      ) : null}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
          {comingSoon ? " · próximamente" : ""}
        </TooltipContent>
      </Tooltip>
    );
  }

  return inner;
}

type NavGroupProps = {
  label: string;
  children: ReactNode;
  collapsed?: boolean;
};

export function NavGroup({ label, children, collapsed = false }: NavGroupProps) {
  return (
    <div className="grid gap-1">
      {collapsed ? null : (
        <p className="px-2.5 pb-0.5 pt-2 text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/45">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}
