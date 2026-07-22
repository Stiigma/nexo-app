import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

/**
 * `EmptyState` orienta al siguiente paso (no decorativo). Ilustración (icono
 * sobre `--brand-soft`) + título + guía + CTA opcional.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "grid gap-3 rounded-lg border border-dashed border-border bg-surface p-6 text-center",
        className,
      )}
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-brand-soft text-brand">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <div className="grid gap-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="mt-1 flex justify-center">{action}</div> : null}
    </div>
  );
}
