import { Layers, MoreHorizontal, Package, Plus, RefreshCcw, RotateCcw, Store as StoreIcon } from "lucide-react";
import type { PurchaseBatch } from "../domain/types";
import { formatDate } from "./format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Money } from "@/components/nexo/Money";
import { EmptyState } from "@/components/nexo/EmptyState";
import { StepHeader } from "@/components/nexo/StepHeader";
import { ConfirmDialog } from "@/components/nexo/ConfirmDialog";

type BatchListProps = {
  batches: PurchaseBatch[];
  saving: boolean;
  onNewCart: () => void;
  onViewBatch: (id: string) => void;
  onSeed: () => void;
  onReset: () => void;
};

export function BatchList({
  batches,
  saving,
  onNewCart,
  onViewBatch,
  onSeed,
  onReset,
}: BatchListProps) {
  const count = batches.length;

  return (
    <section className="grid gap-5">
      <StepHeader
        title="Lotes de compra"
        subtitle={`${count} ${count === 1 ? "lote" : "lotes"}`}
        actions={
          <>
            <Button variant="primary" onClick={onNewCart}>
              <Plus className="size-4" aria-hidden="true" />
              Nuevo carrito
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Acciones de demo">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onSeed} disabled={saving}>
                  <RefreshCcw className="size-4" aria-hidden="true" />
                  Cargar datos demo
                </DropdownMenuItem>
                <ConfirmDialog
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      disabled={saving}
                      className="text-danger focus:text-danger"
                    >
                      <RotateCcw className="size-4" aria-hidden="true" />
                      Reiniciar datos
                    </DropdownMenuItem>
                  }
                  title="¿Reiniciar los datos del demo?"
                  description="Se borrarán los lotes, pagos y prendas. Las tiendas, categorías y motivos semilla se conservan. Esta acción no se puede deshacer."
                  confirmLabel="Reiniciar"
                  destructive
                  onConfirm={onReset}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {count === 0 ? (
        <EmptyState
          icon={Layers}
          title="Aún no hay lotes"
          description="Crea un carrito de compra, captura los items y confirma el pago para generar tu primer lote de compra."
          action={
            <Button variant="primary" onClick={onNewCart}>
              <Plus className="size-4" aria-hidden="true" />
              Crear primer carrito
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-2.5" aria-label="Lista de lotes de compra">
          {batches.map((batch) => (
            <li key={batch.id}>
              <button
                type="button"
                onClick={() => onViewBatch(batch.id)}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-colors hover:border-border-strong hover:bg-surface-2/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-2 text-muted-foreground">
                  <StoreIcon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-semibold text-foreground">
                    {batch.storeName}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
                    <span>{formatDate(batch.date)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Package className="size-3.5" aria-hidden="true" />
                      {batch.garmentCount}{" "}
                      {batch.garmentCount === 1 ? "prenda" : "prendas"}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{batch.paymentCount} {batch.paymentCount === 1 ? "pago" : "pagos"}</span>
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1.5">
                  <Money value={batch.paidTotal} currency={batch.currency} strong size="base" />
                  <Badge variant="success">Confirmado</Badge>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
