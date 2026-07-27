import type { InventoryStats } from "@/features/inventory/types/item";

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE:    "bg-emerald-500",
  RESERVED:     "bg-amber-500",
  SOLD:         "bg-sky-500",
  PRICE_PENDING: "bg-red-400",
  DRAFT:        "bg-muted-foreground/40",
};

interface StatusOverviewProps {
  stats: InventoryStats | undefined;
}

export function StatusOverview({ stats }: StatusOverviewProps) {
  const breakdown = stats?.statusBreakdown ?? [];
  const total = breakdown.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Estado de artículos</h3>

      {/* Stacked bar */}
      <div className="mb-4 flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {breakdown.map((s) => (
          <div
            key={s.status}
            className={`${STATUS_COLORS[s.status] ?? "bg-muted-foreground/30"} transition-all`}
            style={{ width: `${(s.count / total) * 100}%` }}
            title={`${s.label}: ${s.count}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {breakdown.map((s) => (
          <div key={s.status} className="flex items-center gap-2 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[s.status] ?? "bg-muted-foreground/30"}`} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-semibold tabular-nums text-foreground">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
