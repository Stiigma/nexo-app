import { motion } from "framer-motion";
import { Banknote } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/common/components/ui";
import { cn } from "@/common/lib/utils";
import type { ItemDto } from "../types/item";

interface FinancialBreakdownProps {
  item: ItemDto;
}

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, type: "spring" as const, stiffness: 300, damping: 24 },
  }),
};

const sectionVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

function fmtCurrency(amount: number, decimals = 2): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function asMoney(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatMoneyValue(
  amount: number | null,
  currency: "MXN" | "USD",
  pendingLabel = "Pendiente",
) {
  return amount === null ? pendingLabel : `$${fmtCurrency(amount)} ${currency}`;
}

function formatSignedMoneyValue(amount: number | null, currency: "MXN" | "USD") {
  if (amount === null) return "Pendiente";
  const sign = amount >= 0 ? "+" : "-";
  return `${sign}$${fmtCurrency(Math.abs(amount))} ${currency}`;
}

function formatPercentValue(percent: number | null) {
  if (percent === null) return "Pendiente";
  const sign = percent >= 0 ? "+" : "";
  return `${sign}${percent.toFixed(1)}%`;
}

function FinancialRow({
  index,
  label,
  value,
  muted,
  className,
}: {
  index: number;
  label: string;
  value: string;
  muted?: boolean;
  className?: string;
}) {
  return (
    <motion.tr
      variants={rowVariants}
      custom={index}
      className={cn(
        "border-b border-border/50 transition-colors hover:bg-muted/30",
        index % 2 === 1 && "bg-muted/10",
      )}
    >
      <TableCell className={cn("py-2.5 text-sm", muted && "text-muted-foreground")}>
        <span>{label}</span>
      </TableCell>
      <TableCell
        className={cn(
          "py-2.5 text-right font-medium tabular-nums whitespace-nowrap",
          muted && "text-muted-foreground",
          className,
        )}
      >
        {value}
      </TableCell>
    </motion.tr>
  );
}

function CurrencyTable({
  rows,
}: {
  rows: Array<{
    label: string;
    value: string;
    muted?: boolean;
    className?: string;
  }>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Concepto</TableHead>
          <TableHead className="text-right">Importe</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <FinancialRow
            key={row.label}
            index={index}
            label={row.label}
            value={row.value}
            muted={row.muted}
            className={row.className}
          />
        ))}
      </TableBody>
    </Table>
  );
}

export function FinancialBreakdown({ item }: FinancialBreakdownProps) {
  const costAmount = asMoney(item.costAmount);
  const costCurrency = item.costCurrency;
  const exchangeRate = asMoney(item.exchangeRate);
  const targetPriceMxn = asMoney(item.targetPriceMxn);
  const minPriceMxn = asMoney(item.minPriceMxn);
  const costMxn =
    asMoney(item.costMxnEq) ??
    (costCurrency === "MXN" ? costAmount : null);

  const netProfitMxn =
    targetPriceMxn !== null && costMxn !== null ? targetPriceMxn - costMxn : null;
  const gainPercent =
    costMxn !== null && targetPriceMxn !== null
      ? ((targetPriceMxn - costMxn) / costMxn) * 100
      : null;

  const canShowUsd = exchangeRate !== null;
  const costUsd = canShowUsd && costMxn !== null ? costMxn / exchangeRate : null;
  const targetPriceUsd =
    canShowUsd && targetPriceMxn !== null ? targetPriceMxn / exchangeRate : null;
  const netProfitUsd =
    canShowUsd && netProfitMxn !== null ? netProfitMxn / exchangeRate : null;

  const isPositive = netProfitMxn !== null && netProfitMxn >= 0;
  const profitColor =
    netProfitMxn === null
      ? "text-muted-foreground"
      : isPositive
        ? "text-green-600"
        : "text-red-500";

  const mxnRows = [
    {
      label: "Costo",
      value: formatMoneyValue(costMxn, "MXN", "Costo pendiente"),
      muted: costMxn === null,
    },
    {
      label: "Queremos darlo",
      value: formatMoneyValue(targetPriceMxn, "MXN", "Precio pendiente"),
      muted: targetPriceMxn === null,
      className: targetPriceMxn !== null ? "font-semibold" : undefined,
    },
    {
      label: "% ganancia",
      value: formatPercentValue(gainPercent),
      muted: gainPercent === null,
      className: cn(gainPercent !== null && "font-semibold", profitColor),
    },
    {
      label: "Ganancia neta",
      value: formatSignedMoneyValue(netProfitMxn, "MXN"),
      muted: netProfitMxn === null,
      className: cn(netProfitMxn !== null && "font-semibold", profitColor),
    },
    ...(minPriceMxn !== null
      ? [
          {
            label: "Precio mínimo",
            value: formatMoneyValue(minPriceMxn, "MXN", "Precio pendiente"),
            muted: true,
          },
        ]
      : []),
  ];

  const usdRows = [
    {
      label: "Costo",
      value: formatMoneyValue(costUsd, "USD", "Costo pendiente"),
      muted: costUsd === null,
    },
    {
      label: "Queremos darlo",
      value: formatMoneyValue(targetPriceUsd, "USD", "Precio pendiente"),
      muted: targetPriceUsd === null,
      className: targetPriceUsd !== null ? "font-semibold" : undefined,
    },
    {
      label: "% ganancia",
      value: formatPercentValue(gainPercent),
      muted: gainPercent === null,
      className: cn(gainPercent !== null && "font-semibold", profitColor),
    },
    {
      label: "Ganancia neta",
      value: formatSignedMoneyValue(netProfitUsd, "USD"),
      muted: netProfitUsd === null,
      className: cn(netProfitUsd !== null && "font-semibold", profitColor),
    },
    ...(canShowUsd && minPriceMxn !== null
      ? [
          {
            label: "Precio mínimo",
            value: formatMoneyValue(minPriceMxn / exchangeRate, "USD", "Precio pendiente"),
            muted: true,
          },
        ]
      : []),
  ];

  const hasFinancialData =
    item.status === "PRICE_PENDING" ||
    costAmount !== null ||
    costMxn !== null ||
    targetPriceMxn !== null ||
    minPriceMxn !== null;

  if (!hasFinancialData) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-center text-sm text-muted-foreground">
        Sin datos financieros registrados.
      </div>
    );
  }

  return (
    <motion.div
      className="overflow-hidden rounded-xl border border-border bg-card"
      initial="hidden"
      animate="show"
      variants={sectionVariants}
    >
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Banknote size={16} className="text-primary" />
          Desglose financiero
        </h3>
      </div>

      <Tabs defaultValue="mxn" className="p-4">
        <TabsList className="w-full">
          <TabsTrigger value="mxn" className="flex-1">
            MXN
          </TabsTrigger>
          <TabsTrigger value="usd" className="flex-1" disabled={!canShowUsd}>
            {canShowUsd ? "USD" : "USD · Sin tipo de cambio"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mxn">
          <CurrencyTable rows={mxnRows} />
        </TabsContent>

        {canShowUsd && (
          <TabsContent value="usd">
            <CurrencyTable rows={usdRows} />
            <p className="mt-3 text-xs text-muted-foreground">
              TC: 1 USD = ${exchangeRate.toFixed(4)} MXN
            </p>
          </TabsContent>
        )}
      </Tabs>
    </motion.div>
  );
}
