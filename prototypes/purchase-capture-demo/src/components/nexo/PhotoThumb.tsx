import { Image as ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type PhotoThumbProps = {
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

const SIZE_CLASS = {
  sm: "size-10 rounded",
  md: "size-16 rounded-lg",
};

const ICON_SIZE = {
  sm: "size-4",
  md: "size-5",
};

/**
 * `PhotoThumb` muestra la miniatura del placeholder de foto con borde
 * `--border`, sobre `--surface-2`. Reemplaza los bloques `Image` sueltos.
 */
export function PhotoThumb({ label, size = "md", className }: PhotoThumbProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex shrink-0 flex-col items-center justify-center border border-border bg-surface-2 text-center text-muted-foreground",
        SIZE_CLASS[size],
        className,
      )}
    >
      <ImageIcon className={ICON_SIZE[size]} />
      {label ? (
        <span
          className={cn(
            "mt-0.5 max-w-[3.4rem] truncate font-semibold text-muted-foreground/80",
            size === "sm" ? "text-[9px]" : "text-[10px]",
          )}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
