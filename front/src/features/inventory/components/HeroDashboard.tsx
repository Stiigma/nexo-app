import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, BarChart3, Package, TrendingUp } from "lucide-react";
import type { InventoryStats } from "../types/item";

interface HeroDashboardProps {
  stats: InventoryStats | undefined;
  isLoading: boolean;
  canViewFinancials: boolean;
}

function CountUpValue({
  value,
  prefix,
  format = "number",
}: {
  value: number;
  prefix?: string;
  format?: "number" | "currency";
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  const formatted =
    format === "currency"
      ? `${prefix ?? "$"}${display.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `${prefix ?? ""}${Math.round(display).toLocaleString("en-US")}`;

  return <span>{formatted}</span>;
}

function StatCard({
  label,
  value,
  icon: Icon,
  format = "number",
  prefix,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  format?: "number" | "currency";
  prefix?: string;
}) {
  return (
    <motion.div
      className="glass-card flex items-center gap-4 p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring" as const, stiffness: 200, damping: 20 }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">
          <CountUpValue value={value} format={format} prefix={prefix} />
        </p>
        <p className="text-sm text-white/70">{label}</p>
      </div>
    </motion.div>
  );
}

export function HeroDashboard({ stats, isLoading, canViewFinancials }: HeroDashboardProps) {
  if (isLoading) {
    return (
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#1a5f4a] to-[#0d3326] p-6">
        <div className="mb-4 h-4 w-1/3 animate-pulse rounded bg-white/20" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[88px] animate-pulse rounded-xl bg-white/10"
            />
          ))}
        </div>
      </div>
    );
  }

  const totalCost = stats?.totalCostUSD ?? 0;
  const totalValue = stats?.totalValueMXN ?? 0;
  const avgMargin = stats?.avgMargin ?? 0;
  const totalItems = stats?.totalItems ?? 0;

  return (
    <section
      className="mb-6 overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(135deg, #1a5f4a 0%, #0d3326 100%)",
      }}
    >
      <div className="p-6">
        <h2 className="mb-1 text-sm font-medium text-white/60">
          Mi Inventario
        </h2>
        <p className="mb-6 text-2xl font-bold text-white">
          Resumen general
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {canViewFinancials && (
            <StatCard
              label="USD invertido"
              value={totalCost}
              icon={DollarSign}
              format="currency"
              prefix="$"
            />
          )}
          <StatCard
            label="MXN esperado"
            value={totalValue}
            icon={TrendingUp}
            format="currency"
            prefix="$"
          />
          {canViewFinancials && (
            <StatCard
              label="Margen promedio"
              value={avgMargin}
              icon={BarChart3}
              format="number"
              prefix=""
            />
          )}
          <StatCard
            label="Artículos totales"
            value={totalItems}
            icon={Package}
            format="number"
          />
        </div>

        {stats?.statusBreakdown && stats.statusBreakdown.length > 0 && (
          <div className="mt-6 rounded-xl bg-white/10 p-4">
            <div className="flex flex-wrap gap-4">
              {stats.statusBreakdown.map((s) => (
                <div key={s.status} className="flex items-center gap-2">
                  <span className={s.status === "PRICE_PENDING" ? "h-2 w-2 rounded-full bg-red-300" : "h-2 w-2 rounded-full bg-white/60"} />
                  <span className="text-sm text-white/80">
                    {s.label}:{" "}
                    <span className="font-semibold text-white">{s.count}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
