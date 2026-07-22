import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StickyActionBarProps = {
  primary: ReactNode;
  secondary?: ReactNode;
  className?: string;
};

/**
 * `StickyActionBar` fija la acción primaria al borde inferior en móvil con
 * `safe-area inset`. Superficie sólida (`--surface`) con borde superior, no
 * translúcido. Una sola acción primaria; la secundaria arriba.
 */
export function StickyActionBar({ primary, secondary, className }: StickyActionBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-4 border-t border-border bg-surface px-4 py-3 safe-area-inset-bottom lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0",
        className,
      )}
    >
      <div className="grid gap-2">
        {primary}
        {secondary}
      </div>
    </div>
  );
}
