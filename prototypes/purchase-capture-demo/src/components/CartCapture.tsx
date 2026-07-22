import {
  Banknote,
  ChevronDown,
  MoreHorizontal,
  Package,
  Plus,
  ReceiptText,
  Tag,
  Trash2,
} from "lucide-react";
import {
  mainPhotoPlaceholders,
  type PurchaseCartDetail,
  type PurchaseCartItem,
} from "../domain/types";
import { formatDate, formatPercent, formatRate } from "./format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Money } from "@/components/nexo/Money";
import { StatusBadge } from "@/components/nexo/StatusBadge";
import { PhotoThumb } from "@/components/nexo/PhotoThumb";
import { ContextStrip } from "@/components/nexo/ContextStrip";
import { EmptyState } from "@/components/nexo/EmptyState";
import { StepHeader } from "@/components/nexo/StepHeader";
import { StickyActionBar } from "@/components/nexo/StickyActionBar";
import { ConfirmDialog } from "@/components/nexo/ConfirmDialog";

type CartCaptureProps = {
  cart: PurchaseCartDetail;
  saving: boolean;
  onBack: () => void;
  onAddItem: () => void;
  onEditItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onConfirmPayment: () => void;
  onDiscardCart: () => void;
};

export function CartCapture({
  cart,
  saving,
  onAddItem,
  onEditItem,
  onRemoveItem,
  onConfirmPayment,
  onDiscardCart,
}: CartCaptureProps) {
  const photoLabel = (id: string) =>
    mainPhotoPlaceholders.find((p) => p.id === id)?.label ?? "Foto";

  return (
    <section className="grid gap-5">
      <StepHeader
        title="Captura de items"
        subtitle={`${cart.storeName} · ${formatDate(cart.date)}`}
        actions={
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" disabled={saving}>
                <Trash2 className="size-4" aria-hidden="true" />
                Descartar
              </Button>
            }
            title="¿Descartar este carrito?"
            description="Los items capturados se perderán. Esta acción no se puede deshacer."
            confirmLabel="Descartar carrito"
            destructive
            onConfirm={onDiscardCart}
          />
        }
      />

      {/* Context strip: una línea compacta de metadata */}
      <ContextStrip
        segments={[
          { label: "Moneda", value: cart.currency },
          { label: "Impuesto", value: formatPercent(cart.taxRate) },
          { label: "Tipo de cambio", value: formatRate(cart.exchangeRate) },
          { label: "Items", value: String(cart.totals.itemCount) },
        ]}
      />

      {/* Items: región principal */}
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            Items del carrito
          </h2>
          <Button variant="secondary" onClick={onAddItem} disabled={saving}>
            <Plus className="size-4" aria-hidden="true" />
            Agregar item
          </Button>
        </div>

        {cart.items.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="Sin items capturados"
            description="Agrega items con foto demo, costo y categoría opcional antes de confirmar el pago."
            action={
              <Button variant="primary" onClick={onAddItem} disabled={saving}>
                <Plus className="size-4" aria-hidden="true" />
                Agregar primer item
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-2.5" aria-label="Items del carrito">
            {cart.items.map((item) => (
              <li key={item.id}>
                <ItemRow
                  item={item}
                  currency={cart.currency}
                  photoLabel={photoLabel(item.mainPhotoPlaceholder)}
                  saving={saving}
                  onEdit={() => onEditItem(item.id)}
                  onRemove={() => onRemoveItem(item.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Totales: resumen colapsable */}
      <Collapsible className="rounded-lg border border-border bg-card shadow-sm">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25 rounded-lg">
          <span className="text-sm font-medium text-muted-foreground">
            Total esperado
          </span>
          <span className="flex items-center gap-2">
            <Money
              value={cart.totals.expectedTotal}
              currency={cart.currency}
              strong
              size="lg"
            />
            <ChevronDown
              className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid gap-2 px-4 pb-4">
            <Separator />
            <TotalRow
              label="Subtotal antes de impuesto"
              value={<Money value={cart.totals.subtotal} currency={cart.currency} />}
            />
            <TotalRow
              label={`Impuesto ${formatPercent(cart.taxRate)}`}
              value={<Money value={cart.totals.tax} currency={cart.currency} />}
            />
            <TotalRow
              label="Equivalente MXN"
              value={<Money value={cart.totals.mxnEquivalent} currency="MXN" />}
            />
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Provisional: el redondeo final no está definido (OQ-001 abierto).
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Action bar: una sola acción primaria */}
      <StickyActionBar
        primary={
          <Button
            variant="primary"
            size="lg"
            onClick={onConfirmPayment}
            disabled={saving || cart.items.length === 0}
            className="w-full"
          >
            <Banknote className="size-4" aria-hidden="true" />
            {cart.items.length === 0
              ? "Agrega items para confirmar pago"
              : "Confirmar pago"}
          </Button>
        }
      />
    </section>
  );
}

function ItemRow({
  item,
  currency,
  photoLabel,
  saving,
  onEdit,
  onRemove,
}: {
  item: PurchaseCartItem;
  currency: string;
  photoLabel: string;
  saving: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-3">
          <PhotoThumb label={photoLabel} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground">
              ID de captura
            </p>
            <p className="truncate text-base font-semibold text-foreground">
              {item.captureId}
            </p>
            <div className="mt-1.5">
              <Money
                value={item.purchaseCost}
                currency={currency}
                strong
                size="lg"
              />
            </div>
            <div className="mt-2">
              {item.categoryReview ? (
                <StatusBadge tone="warning">Revisión de categoría</StatusBadge>
              ) : (
                <Badge variant="neutral" className="gap-1">
                  <Tag className="size-3" aria-hidden="true" />
                  {item.categoryName}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Acciones de ${item.captureId}`}
              disabled={saving}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit} disabled={saving}>
              <Package className="size-4" aria-hidden="true" />
              Editar item
            </DropdownMenuItem>
            <ConfirmDialog
              trigger={
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  disabled={saving}
                  className="text-danger focus:text-danger"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Eliminar item
                </DropdownMenuItem>
              }
              title={`¿Eliminar ${item.captureId}?`}
              description="El item se quita del carrito. Esta acción no se puede deshacer."
              confirmLabel="Eliminar"
              destructive
              onConfirm={onRemove}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

function TotalRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
