import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StepHeaderProps = {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/**
 * `StepHeader` es el encabezado de pantalla: título (h1) + subtítulo opcional
 * + acciones alineadas a la derecha. Sin eyebrows en mayúsculas con tracking
 * ancho (tell #1 de "AI").
 */
export function StepHeader({ title, subtitle, actions, className }: StepHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <div className="mt-1 truncate text-sm text-muted-foreground">
            {subtitle}
          </div>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
