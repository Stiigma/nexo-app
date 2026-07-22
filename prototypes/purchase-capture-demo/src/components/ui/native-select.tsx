import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Select nativo estilado Nexo. Conserva la API `SelectHTMLAttributes`
 * (value/onChange con `<option>` de strings), evitando el problema de
 * Radix Select con `value=""` (que rompería la lógica de "sin categoría").
 * Igualmente accesible y sólido.
 */
function NativeSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative flex items-center">
      <select
        data-slot="native-select"
        className={cn(
          "flex h-10 w-full min-w-0 appearance-none rounded-md border border-border bg-input px-3 py-2 pr-9 text-base text-foreground shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-brand/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 size-4 text-muted-foreground"
      />
    </div>
  );
}

export { NativeSelect };
