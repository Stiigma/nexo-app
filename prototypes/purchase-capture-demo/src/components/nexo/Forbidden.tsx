import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ForbiddenProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

/**
 * `Forbidden` es el estado para una vista no disponible o sin permiso.
 * Explica la causa y ofrece una acción de retorno (no un redirect silencioso,
 * ver §9/§10 de la propuesta).
 */
export function Forbidden({
  title = "Vista no disponible",
  description = "Regresa a la lista de lotes para continuar.",
  action,
  className,
}: ForbiddenProps) {
  return (
    <div
      role="alert"
      className={cn(
        "grid gap-3 rounded-lg border border-dashed border-border bg-surface p-8 text-center",
        className,
      )}
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-danger-soft text-danger">
        <ShieldAlert className="size-6" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-1 flex justify-center">{action}</div> : null}
    </div>
  );
}
