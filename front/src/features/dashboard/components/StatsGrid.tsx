import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Package, Percent } from "lucide-react";
import type { InventoryStats } from "@/features/inventory/types/item";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  format?: "number" | "currency";
  prefix?: string;
  suffix?: string;
  accent: "default" | "positive" | "info" | "neutral";
}

const ACCENT_CLASSES: Record<StatCardProps["accent"], { bg: string; text: string }> = {
  default: { bg: "bg-primary/10", text: "text-primary" },
  positive: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  info:     { bg: "bg-sky-500/10",     text: "text-sky-600" },
  neutral:  { bg: "bg-muted",         text: "text-muted-foreground" },
};

function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <>{display.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
}

function StatCard({ label, value, icon: Icon, format = "number", prefix = "", suffix = "", accent }: StatCardProps) {
  const ac = ACCENT_CLASSES[accent];

  return (
    <motion.div
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${ac.bg}`}>
        <Icon size={22} className={ac.text} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {prefix}<CountUp value={value} decimals={format === "currency" ? 2 : 0} />{suffix}
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}

interface StatsGridProps {
  stats: InventoryStats | undefined;
  isLoading: boolean;
}

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[88px] animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  const totalCost = stats?.totalCostMXN ?? 0;
  const totalValue = stats?.totalValueMXN ?? 0;
  const avgMargin = stats?.avgMargin ?? 0;
  const totalItems = stats?.totalItems ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Invertido"
        value={totalCost}
        icon={DollarSign}
        format="currency"
        prefix="$"
        accent="default"
      />
      <StatCard
        label="Valor esperado"
        value={totalValue}
        icon={TrendingUp}
        format="currency"
        prefix="$"
        accent="info"
      />
      <StatCard
        label="Margen promedio"
        value={avgMargin}
        icon={Percent}
        suffix="%"
        accent={avgMargin >= 50 ? "positive" : "default"}
      />
      <StatCard
        label="Artículos"
        value={totalItems}
        icon={Package}
        accent="neutral"
      />
    </div>
  );
}
