import { cn } from "@/lib/utils";
import { formatMoney as formatMoneyValue } from "@/components/format";

type MoneyProps = {
  value: number;
  currency: string;
  className?: string;
  strong?: boolean;
  size?: "sm" | "base" | "lg" | "xl";
};

const SIZE_CLASS: Record<NonNullable<MoneyProps["size"]>, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

/**
 * `<Money>` envuelve `formatMoney` en un `<span>` con `tabular-nums`
 * para alinear columnas de dinero. Reemplaza los usos inline de
 * `formatMoney(...)` en la UI.
 */
export function Money({ value, currency, className, strong, size = "base" }: MoneyProps) {
  return (
    <span
      className={cn(
        "tabular-nums whitespace-nowrap",
        SIZE_CLASS[size],
        strong && "font-semibold text-foreground",
        className,
      )}
    >
      {formatMoneyValue(value, currency)}
    </span>
  );
}
