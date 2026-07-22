import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  help?: string;
  children: ReactNode;
  className?: string;
};

/**
 * `Field` envuelve un control con label, ayuda y error inline.
 * Reemplaza al `Field` hecho a mano de `ui.tsx`, usando `Label` de shadcn.
 */
export function Field({ label, htmlFor, error, help, children, className }: FieldProps) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {help && !error ? (
        <span className="text-xs leading-5 text-muted-foreground">{help}</span>
      ) : null}
      {error ? (
        <span role="alert" className="text-xs font-medium text-danger">
          {error}
        </span>
      ) : null}
    </div>
  );
}
