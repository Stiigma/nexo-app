import { useMemo, useState } from "react";
import { Box, Layers, Tag } from "lucide-react";
import type { Garment, PurchaseBatch } from "../domain/types";
import { mainPhotoPlaceholders } from "../domain/types";
import { formatDate } from "./format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Money } from "@/components/nexo/Money";
import { StatusBadge } from "@/components/nexo/StatusBadge";
import { PhotoThumb } from "@/components/nexo/PhotoThumb";
import { EmptyState } from "@/components/nexo/EmptyState";
import { StepHeader } from "@/components/nexo/StepHeader";
import { cn } from "@/lib/utils";

type AcquiredStockListProps = {
  garments: Garment[];
  batches: PurchaseBatch[];
  onBack: () => void;
  onViewBatch: (batchId: string) => void;
};

type EstadoFilter = "todos" | "disponibles" | "bloqueados";

export function AcquiredStockList({
  garments,
  batches,
  onViewBatch,
}: AcquiredStockListProps) {
  const [estado, setEstado] = useState<EstadoFilter>("todos");

  const filteredGarments = useMemo(() => {
    if (estado === "disponibles") return garments.filter((g) => !g.categoryReview);
    if (estado === "bloqueados") return garments.filter((g) => g.categoryReview);
    return garments;
  }, [garments, estado]);

  return (
    <section className="grid gap-5">
      <StepHeader
        title="Inventario adquirido"
        subtitle={`${garments.length} ${garments.length === 1 ? "prenda" : "prendas"} en inventario`}
      />

      {garments.length === 0 ? (
        <EmptyState
          icon={Box}
          title="Sin inventario adquirido"
          description="Confirma un carrito de compra para generar prendas en inventario adquirido."
        />
      ) : (
        <Tabs defaultValue="garments" className="gap-4">
          <TabsList>
            <TabsTrigger value="garments">Prendas</TabsTrigger>
            <TabsTrigger value="batches">Por lote</TabsTrigger>
          </TabsList>

          <TabsContent value="garments" className="grid gap-4">
            {/* Filtro de estado */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
              {(
                [
                  { id: "todos", label: "Todos" },
                  { id: "disponibles", label: "Disponibles" },
                  { id: "bloqueados", label: "Bloqueados" },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={estado === option.id}
                  onClick={() => setEstado(option.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25",
                    estado === option.id
                      ? "border-brand bg-brand-soft text-brand-ink"
                      : "border-border bg-surface text-muted-foreground hover:bg-surface-2",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {filteredGarments.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-surface p-6 text-center text-sm text-muted-foreground">
                No hay prendas para este filtro.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-4 py-2.5 font-semibold">Código</th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">Categoría</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-semibold">Costo</th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredGarments.map((garment) => {
                      const photo = mainPhotoPlaceholders.find(
                        (p) => p.id === garment.mainPhotoPlaceholder,
                      );
                      const blocked = garment.categoryReview;
                      return (
                        <tr
                          key={garment.id}
                          className={cn(
                            "transition-colors hover:bg-surface-2/40",
                            blocked && "bg-warning-soft/30 hover:bg-warning-soft/50",
                          )}
                        >
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <PhotoThumb label={photo?.label} size="sm" />
                              <span className="font-semibold text-foreground">
                                {garment.internalCode}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            {blocked ? (
                              <StatusBadge tone="warning">Revisión</StatusBadge>
                            ) : (
                              <Badge variant="neutral" className="gap-1">
                                <Tag className="size-3" aria-hidden="true" />
                                {garment.categoryName ?? "Sin categoría"}
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <Money value={garment.purchaseCost} currency="USD" />
                          </td>
                          <td className="px-4 py-2.5">
                            <StatusBadge tone={blocked ? "warning" : "success"}>
                              {blocked ? "Bloqueada" : "Disponible"}
                            </StatusBadge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="batches">
            <ul className="grid gap-2.5" aria-label="Lotes con inventario">
              {batches.map((batch) => (
                <li key={batch.id}>
                  <button
                    type="button"
                    onClick={() => onViewBatch(batch.id)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-colors hover:border-border-strong hover:bg-surface-2/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-2 text-muted-foreground">
                      <Layers className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-semibold text-foreground">
                        {batch.storeName}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {formatDate(batch.date)} · {batch.garmentCount}{" "}
                        {batch.garmentCount === 1 ? "prenda" : "prendas"} ·{" "}
                        {batch.paymentCount} {batch.paymentCount === 1 ? "pago" : "pagos"}
                      </span>
                    </span>
                    <Money value={batch.paidTotal} currency={batch.currency} strong />
                  </button>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      )}
    </section>
  );
}
