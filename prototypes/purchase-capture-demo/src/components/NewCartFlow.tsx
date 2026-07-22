import { ChevronRight, Info, Store as StoreIcon, Zap } from "lucide-react";
import type { Store } from "../domain/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StepHeader } from "@/components/nexo/StepHeader";

type NewCartFlowProps = {
  stores: Store[];
  saving: boolean;
  onBack: () => void;
  onSelectStore: (storeId: string) => void;
};

export function NewCartFlow({
  stores,
  saving,
  onSelectStore,
}: NewCartFlowProps) {
  return (
    <section className="grid gap-5">
      <StepHeader
        title="Selecciona tienda"
        subtitle="El carrito es efímero: desaparece al confirmar el pago."
      />

      {stores.length === 0 ? (
        <Alert variant="warning">
          <Info aria-hidden="true" />
          <AlertDescription>
            No hay tiendas configuradas. Un administrador debe dar de alta al
            menos una tienda para iniciar una compra.
          </AlertDescription>
        </Alert>
      ) : (
        <ul className="grid gap-2.5" aria-label="Tiendas disponibles">
          {stores.map((store) => (
            <li key={store.id}>
              <button
                type="button"
                onClick={() => onSelectStore(store.id)}
                disabled={saving}
                aria-label={`Seleccionar ${store.name}`}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-colors hover:border-border-strong hover:bg-surface-2/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand">
                  <StoreIcon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-semibold text-foreground">
                    {store.name}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {store.country} · Impuesto {store.defaultTaxRate}% ·{" "}
                    {store.defaultCurrency}
                  </span>
                </span>
                <ChevronRight
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Alert variant="info">
        <Zap aria-hidden="true" />
        <AlertDescription>
          Al seleccionar la tienda se crea el carrito con los valores por defecto
          de la tienda y el tipo de cambio actual.
        </AlertDescription>
      </Alert>
    </section>
  );
}
