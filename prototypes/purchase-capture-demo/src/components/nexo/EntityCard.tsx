import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EntityCardProps = {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
};

/**
 * `EntityCard` es la tarjeta sólida estándar de Nexo (`--surface` con borde
 * `--border`, sin glassmorphism). Reemplaza las tarjetas `bg-white/[.055]`.
 */
export function EntityCard({ children, className }: EntityCardProps) {
  return (
    <Card className={cn("gap-0 p-4", className)}>{children}</Card>
  );
}
