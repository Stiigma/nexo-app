import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";

import { cn } from "@/lib/utils";

type Variant = "default" | "brand";

const toggleVariants: Record<Variant, string> = {
  default:
    "border-border bg-surface text-foreground hover:bg-surface-2 data-[state=on]:border-brand data-[state=on]:bg-brand-soft data-[state=on]:text-brand-ink",
  brand:
    "border-border bg-surface text-foreground hover:bg-surface-2 data-[state=on]:border-brand data-[state=on]:bg-brand data-[state=on]:text-primary-foreground",
};

const ToggleGroupContext = React.createContext<{ variant?: Variant } | null>(null);

type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> & {
  variant?: Variant;
};

function ToggleGroup({ className, variant = "default", ...props }: ToggleGroupProps) {
  const type = props.type;

  return (
    <ToggleGroupContext.Provider value={{ variant }}>
      <ToggleGroupPrimitive.Root
        data-slot="toggle-group"
        data-variant={variant}
        className={cn(
          "grid w-full gap-2",
          type === "single" && "grid-cols-3",
          className,
        )}
        {...props}
      />
    </ToggleGroupContext.Provider>
  );
}

function ToggleGroupItem({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & {
  variant?: Variant;
}) {
  const context = React.useContext(ToggleGroupContext);
  const resolvedVariant = variant ?? context?.variant ?? "default";

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        "inline-flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-md border px-3 py-3 text-center text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0",
        toggleVariants[resolvedVariant],
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
