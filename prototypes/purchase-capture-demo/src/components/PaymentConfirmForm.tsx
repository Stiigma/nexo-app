import {
  Banknote,
  CreditCard,
  FileDigit,
  FileText,
  Layers,
  PlusCircle,
  Receipt,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import {
  purchaseEvidenceOptions,
  type DifferenceReason,
  type PurchaseBatch,
  type PurchaseCartDetail,
} from "../domain/types";
import type { PaymentConfirmationDraft } from "../state/usePurchaseCartStore";
import type { PaymentConfirmationValidationErrors } from "../domain/validation";
import { formatDate, formatPercent, formatRate } from "./format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Spinner } from "@/components/ui/spinner";
import { NativeSelect } from "@/components/ui/native-select";
import { Field } from "@/components/nexo/Field";
import { Money } from "@/components/nexo/Money";
import { StepHeader } from "@/components/nexo/StepHeader";
import { StickyActionBar } from "@/components/nexo/StickyActionBar";
import { DifferenceAlert } from "@/components/nexo/DifferenceAlert";
import { cn } from "@/lib/utils";

const evidenceIcons: Record<string, ReactNode> = {
  "evidence-ticket": <Receipt className="size-5" aria-hidden="true" />,
  "evidence-invoice": <FileText className="size-5" aria-hidden="true" />,
  "evidence-digital": <FileDigit className="size-5" aria-hidden="true" />,
};

type PaymentConfirmFormProps = {
  cart: PurchaseCartDetail;
  differenceReasons: DifferenceReason[];
  eligibleBatches: PurchaseBatch[];
  draft: PaymentConfirmationDraft;
  errors: PaymentConfirmationValidationErrors;
  showValidation: boolean;
  saving: boolean;
  onBack: () => void;
  onChange: (patch: Partial<PaymentConfirmationDraft>) => void;
  onSubmit: () => void;
};

export function PaymentConfirmForm({
  cart,
  differenceReasons,
  eligibleBatches,
  draft,
  errors,
  showValidation,
  saving,
  onChange,
  onSubmit,
}: PaymentConfirmFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  const visibleErrors = showValidation ? errors : {};
  const paidTotal = parseFloat(draft.paidTotal);
  const roundedExpected = Number(cart.totals.expectedTotal.toFixed(2));
  const roundedPaid = !Number.isNaN(paidTotal) ? Number(paidTotal.toFixed(2)) : NaN;
  const totalsDiffer =
    !Number.isNaN(roundedPaid) &&
    Math.abs(roundedPaid - roundedExpected) >= 0.001;
  const selectedReason = differenceReasons.find(
    (r) => r.id === draft.differenceReasonId,
  );

  return (
    <section className="grid gap-5">
      <StepHeader
        title="Confirmar pago"
        subtitle={`${cart.storeName} · ${formatDate(cart.date)}`}
      />

      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        {/* 1. Resumen del carrito */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resumen del carrito</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {cart.items.length}{" "}
                {cart.items.length === 1 ? "item" : "items"}
              </span>{" "}
              · {cart.currency} · Impuesto {formatPercent(cart.taxRate)} · FX{" "}
              {formatRate(cart.exchangeRate)}
            </p>
            <Separator />
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Total esperado</span>
              <Money
                value={cart.totals.expectedTotal}
                currency={cart.currency}
                strong
                size="lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. ¿Dónde guardar este pago? */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">¿Dónde guardar este pago?</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <RadioGroup
              value={eligibleBatches.length > 0 ? draft.batchMode : "new"}
              onValueChange={(value) => {
                if (value === "existing") {
                  onChange({
                    batchMode: "existing",
                    existingBatchId: eligibleBatches[0]?.id ?? null,
                  });
                } else {
                  onChange({ batchMode: "new", existingBatchId: null });
                }
              }}
              disabled={saving}
              className="gap-2.5"
            >
              {eligibleBatches.length > 0 ? (
                <ChoiceOption
                  value="existing"
                  selected={draft.batchMode === "existing"}
                  icon={<Layers className="size-4" aria-hidden="true" />}
                  label="Agregar a lote existente"
                >
                  <NativeSelect
                    value={draft.existingBatchId ?? ""}
                    onChange={(e) =>
                      onChange({ existingBatchId: e.target.value || null })
                    }
                    disabled={saving}
                    aria-label="Lote existente"
                  >
                    <option value="">Selecciona un lote</option>
                    {eligibleBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.storeName} — {formatDate(b.date)} —{" "}
                        {b.paymentCount} {b.paymentCount === 1 ? "pago" : "pagos"}{" "}
                        · {b.paidTotal.toFixed(2)} {b.currency}
                      </option>
                    ))}
                  </NativeSelect>
                </ChoiceOption>
              ) : null}

              <ChoiceOption
                value="new"
                selected={draft.batchMode === "new" || eligibleBatches.length === 0}
                icon={<PlusCircle className="size-4" aria-hidden="true" />}
                label="Crear nuevo lote"
              />
            </RadioGroup>

            {eligibleBatches.length === 0 ? (
              <p className="text-xs leading-5 text-muted-foreground">
                No hay lotes existentes para {cart.storeName} en esta fecha. Se
                creará uno nuevo automáticamente.
              </p>
            ) : null}

            {visibleErrors.batchMode ? (
              <span role="alert" className="text-xs font-medium text-danger">
                {visibleErrors.batchMode}
              </span>
            ) : null}
            {visibleErrors.existingBatchId ? (
              <span role="alert" className="text-xs font-medium text-danger">
                {visibleErrors.existingBatchId}
              </span>
            ) : null}
          </CardContent>
        </Card>

        {/* 3. Comprobante y total pagado */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Comprobante y total pagado</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium text-foreground">
                Comprobante de pago
              </legend>
              <ToggleGroup
                type="single"
                value={draft.evidence || undefined}
                onValueChange={(value) => {
                  if (value) onChange({ evidence: value });
                }}
                disabled={saving}
              >
                {purchaseEvidenceOptions.map((opt) => (
                  <ToggleGroupItem
                    key={opt.id}
                    value={opt.id}
                    disabled={saving}
                    aria-label={opt.label}
                  >
                    {evidenceIcons[opt.id] ?? (
                      <CreditCard className="size-5" aria-hidden="true" />
                    )}
                    <span className="text-sm font-semibold">{opt.label}</span>
                    <span className="text-xs leading-4 text-muted-foreground">
                      {opt.description}
                    </span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {visibleErrors.evidence ? (
                <span role="alert" className="text-xs font-medium text-danger">
                  {visibleErrors.evidence}
                </span>
              ) : null}
            </fieldset>

            <Field
              label={`Total pagado (${cart.currency})`}
              htmlFor="paidTotal"
              error={visibleErrors.paidTotal}
            >
              <Input
                id="paidTotal"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={draft.paidTotal}
                onChange={(e) => onChange({ paidTotal: e.target.value })}
                disabled={saving}
                placeholder="0.00"
                aria-invalid={Boolean(visibleErrors.paidTotal) || undefined}
              />
            </Field>
          </CardContent>
        </Card>

        {/* 4. Motivo de diferencia — sólo si difiere */}
        {totalsDiffer ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Motivo de diferencia</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <DifferenceAlert>
                El total pagado difiere del esperado. Selecciona un motivo para
                registrar la diferencia.
              </DifferenceAlert>
              <Field
                label="Motivo de diferencia"
                htmlFor="differenceReasonId"
                error={visibleErrors.differenceReasonId}
              >
                <NativeSelect
                  id="differenceReasonId"
                  value={draft.differenceReasonId}
                  onChange={(e) =>
                    onChange({ differenceReasonId: e.target.value })
                  }
                  disabled={saving}
                  aria-invalid={Boolean(visibleErrors.differenceReasonId) || undefined}
                >
                  <option value="">Selecciona un motivo</option>
                  {differenceReasons.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>

              {selectedReason?.requiresNote ? (
                <Field
                  label="Nota del motivo"
                  htmlFor="differenceNote"
                  error={visibleErrors.differenceNote}
                >
                  <Input
                    id="differenceNote"
                    value={draft.differenceNote}
                    onChange={(e) =>
                      onChange({ differenceNote: e.target.value })
                    }
                    disabled={saving}
                    placeholder="Describe el motivo..."
                    aria-invalid={Boolean(visibleErrors.differenceNote) || undefined}
                  />
                </Field>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <StickyActionBar
          primary={
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={saving}
              className="w-full"
            >
              {saving ? <Spinner /> : <Banknote className="size-4" aria-hidden="true" />}
              {saving ? "Confirmando..." : "Confirmar pago y crear prendas"}
            </Button>
          }
        />
      </form>
    </section>
  );
}

function ChoiceOption({
  value,
  selected,
  icon,
  label,
  children,
}: {
  value: string;
  selected: boolean;
  icon: ReactNode;
  label: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-2.5 rounded-md border p-3.5 transition-colors",
        selected
          ? "border-brand bg-brand-soft/60"
          : "border-border bg-surface",
      )}
    >
      <label className="flex cursor-pointer items-center gap-2.5">
        <RadioGroupItem
          value={value}
          className={selected ? "" : "border-border-strong"}
        />
        <span
          className={cn(
            "size-4",
            selected ? "text-brand" : "text-muted-foreground",
          )}
        >
          {icon}
        </span>
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </label>
      {children ? <div className="pl-6">{children}</div> : null}
    </div>
  );
}
