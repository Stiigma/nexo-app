import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm gap-3 grid [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:shrink-0 [&>svg]:text-current",
  {
    variants: {
      variant: {
        info: "border-brand/20 bg-brand-soft text-info-ink [&>svg]:text-brand",
        success:
          "border-success/25 bg-success-soft text-success-ink [&>svg]:text-success",
        warning:
          "border-warning/25 bg-warning-soft text-warning-ink [&>svg]:text-warning",
        danger:
          "border-danger/25 bg-danger-soft text-danger-ink [&>svg]:text-danger",
        destructive:
          "border-destructive/25 bg-danger-soft text-danger-ink [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

type AlertProps = React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants>;

function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 font-semibold leading-none", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 text-sm leading-5 text-current/90 [&_p]:leading-5",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
export type { AlertProps };
