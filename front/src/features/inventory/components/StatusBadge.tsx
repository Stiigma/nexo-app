import { cn } from "@/common/lib/utils";
import { AlertCircle } from "lucide-react";
import type { ItemStatus } from "../types/item";

const STATUS_CONFIG: Record<
  ItemStatus,
  { label: string; className: string }
> = {
  PRICE_PENDING: {
    label: "Falta precio",
    className: "border-red-300 bg-red-50 text-red-700",
  },
  ACQUIRED_STOCK: {
    label: "Adquirido",
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
  },
  AVAILABLE: {
    label: "Disponible",
    className:
      "border-green-200 bg-green-50 text-green-700",
  },
  RESERVED: {
    label: "Reservado",
    className:
      "border-purple-200 bg-purple-50 text-purple-700",
  },
  SOLD: {
    label: "Vendido",
    className:
      "border-gray-200 bg-gray-50 text-gray-500",
  },
  RETURNED: {
    label: "Devuelto",
    className:
      "border-red-200 bg-red-50 text-red-700",
  },
};

interface StatusBadgeProps {
  status: ItemStatus;
  pulse?: boolean;
}

export function StatusBadge({ status, pulse }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.ACQUIRED_STOCK;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        pulse && "animate-pulse",
      )}
      role="status"
      aria-label={config.label}
    >
      {status === "PRICE_PENDING" ? (
        <AlertCircle size={13} aria-hidden="true" />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      )}
      {config.label}
    </span>
  );
}
