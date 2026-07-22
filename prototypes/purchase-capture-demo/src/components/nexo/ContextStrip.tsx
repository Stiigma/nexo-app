import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ContextSegment = {
  label?: string;
  value: ReactNode;
};

type ContextStripProps = {
  segments: ContextSegment[];
  className?: string;
};

/**
 * `ContextStrip` reemplaza el bloque grande de 4 `Metric` por una sola
 * fila compacta de metadata sobre `--surface-2`. Una línea, no un grid.
 */
export function ContextStrip({ segments, className }: ContextStripProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-surface-2 px-3 py-2 text-sm text-muted-foreground",
        className,
      )}
    >
      {segments.map((segment, index) => (
        <span key={index} className="inline-flex items-center gap-1.5">
          {segment.label ? (
            <span className="text-muted-foreground/70">{segment.label}</span>
          ) : null}
          <span className="font-medium text-foreground">{segment.value}</span>
          {index < segments.length - 1 ? (
            <span aria-hidden="true" className="text-muted-foreground/40">
              ·
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}
