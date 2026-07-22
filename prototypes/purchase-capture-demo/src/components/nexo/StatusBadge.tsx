import {
  AlertTriangle,
  CheckCircle2,
  Info,
  MinusCircle,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

type StatusBadgeProps = {
  tone: StatusTone;
  children: ReactNode;
  icon?: LucideIcon;
  className?: string;
  variant?: BadgeProps["variant"];
};

const TONE_META: Record<
  StatusTone,
  { variant: BadgeProps["variant"]; icon: LucideIcon }
> = {
  success: { variant: "success", icon: CheckCircle2 },
  warning: { variant: "warning", icon: AlertTriangle },
  danger: { variant: "danger", icon: AlertTriangle },
  info: { variant: "brand", icon: Info },
  neutral: { variant: "neutral", icon: MinusCircle },
};

/**
 * `StatusBadge` muestra el estado con icono + texto (no sólo color),
 * cumpliendo accesibilidad (§10 de la propuesta).
 */
export function StatusBadge({
  tone,
  children,
  icon: IconOverride,
  className,
}: StatusBadgeProps) {
  const meta = TONE_META[tone];
  const Icon = IconOverride ?? meta.icon;

  return (
    <Badge variant={meta.variant} className={cn("gap-1", className)}>
      <Icon aria-hidden="true" />
      {children}
    </Badge>
  );
}
