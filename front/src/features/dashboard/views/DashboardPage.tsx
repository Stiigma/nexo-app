import { useInventoryStats } from "@/features/inventory/hooks/use-inventory-stats";
import { StatsGrid } from "../components/StatsGrid";
import { StatusOverview } from "../components/StatusOverview";
import { QuickActions } from "../components/QuickActions";

export function DashboardPage() {
  const { data: stats, isLoading } = useInventoryStats();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Resumen general de la operación</p>
      </div>

      <StatsGrid stats={stats} isLoading={isLoading} />

      <div className="grid gap-6 lg:grid-cols-2">
        <StatusOverview stats={stats} />
        <QuickActions />
      </div>
    </div>
  );
}
