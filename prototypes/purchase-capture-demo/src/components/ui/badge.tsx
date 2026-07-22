import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-none whitespace-nowrap transition-colors [&>svg]:size-3.5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        neutral:
          "border-border bg-surface-2 text-muted-foreground",
        brand: "border-brand/20 bg-brand-soft text-brand-ink",
        success:
          "border-success/25 bg-success-soft text-success-ink",
        warning:
          "border-warning/25 bg-warning-soft text-warning-ink",
        danger:
          "border-danger/25 bg-danger-soft text-danger-ink",
        outline: "border-border text-foreground bg-transparent",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  };

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
export type { BadgeProps };
