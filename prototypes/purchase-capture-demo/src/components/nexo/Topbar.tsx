import { Menu, Search, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type Crumb = {
  label: string;
  onClick?: () => void;
};

type TopbarProps = {
  crumbs: Crumb[];
  onOpenMenu: () => void;
  offline: boolean;
  className?: string;
};

/**
 * `Topbar` responsive.
 * - Móvil: placa `--chrome` con menú (abre el `Sheet`), logo pequeño y badge
 *   offline. El logo va sobre placa oscura (§5.1).
 * - Escritorio: placa `--paper` con breadcrumb, búsqueda (placeholder) y
 *   badge offline sutil.
 */
export function Topbar({ crumbs, onOpenMenu, offline, className }: TopbarProps) {
  return (
    <header className={cn("shrink-0", className)}>
      {/* Móvil: chrome + menú + logo + offline */}
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border bg-chrome px-3 text-text-inverse md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMenu}
          aria-label="Abrir menú"
          className="text-text-inverse hover:bg-sidebar-accent hover:text-text-inverse"
        >
          <Menu className="size-5" />
        </Button>
        <img
          src={`${import.meta.env.BASE_URL}nexo-mark.svg`}
          alt="Nexo"
          className="size-7"
        />
        <span className="flex-1 truncate text-sm font-semibold">
          {crumbs[crumbs.length - 1]?.label ?? "Nexo"}
        </span>
        {offline ? (
          <span className="inline-flex items-center gap-1 text-xs text-warning">
            <WifiOff className="size-3.5" aria-hidden="true" />
            Sin conexión
          </span>
        ) : null}
      </div>

      {/* Escritorio: paper + breadcrumb + búsqueda + offline */}
      <div className="hidden h-14 items-center gap-3 border-b border-border bg-paper px-5 md:flex">
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;
              return (
                <BreadcrumbItem key={index}>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : crumb.onClick ? (
                    <button
                      type="button"
                      onClick={crumb.onClick}
                      className="rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="text-muted-foreground">{crumb.label}</span>
                  )}
                  {!isLast ? <BreadcrumbSeparator /> : null}
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-1 items-center justify-end gap-3">
          <CommandSearchPlaceholder />
          {offline ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-warning/25 bg-warning-soft px-2.5 py-0.5 text-xs font-semibold text-warning-ink">
              <WifiOff className="size-3.5" aria-hidden="true" />
              Sin conexión
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function CommandSearchPlaceholder() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Buscar (próximamente)"
          className="inline-flex h-9 w-full max-w-64 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-muted-foreground/70 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25"
        >
          <Search className="size-4" aria-hidden="true" />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="hidden rounded border border-border bg-surface-2 px-1.5 text-[10px] font-semibold text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        </button>
      </TooltipTrigger>
      <TooltipContent>Búsqueda disponible próximamente      </TooltipContent>
    </Tooltip>
  );
}
