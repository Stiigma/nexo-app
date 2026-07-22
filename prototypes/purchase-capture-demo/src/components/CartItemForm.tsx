import { ImagePlus, Save } from "lucide-react";
import type { FormEvent } from "react";
import {
  mainPhotoPlaceholders,
  type Category,
  type PurchaseCartDetail,
} from "../domain/types";
import type { PurchaseCartItemDraft } from "../state/usePurchaseCartStore";
import type { PurchaseCartItemValidationErrors } from "../domain/validation";
import { formatDate } from "./format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Spinner } from "@/components/ui/spinner";
import { Field } from "@/components/nexo/Field";
import { StepHeader } from "@/components/nexo/StepHeader";
import { StickyActionBar } from "@/components/nexo/StickyActionBar";
import { NativeSelect } from "@/components/ui/native-select";

type CartItemFormProps = {
  title: string;
  mode: "create" | "edit";
  cart: PurchaseCartDetail;
  categories: Category[];
  draft: PurchaseCartItemDraft;
  errors: PurchaseCartItemValidationErrors;
  showValidation: boolean;
  saving: boolean;
  onBack: () => void;
  onChange: (patch: Partial<PurchaseCartItemDraft>) => void;
  onSubmit: () => void;
};

export function CartItemForm({
  title,
  mode,
  cart,
  categories,
  draft,
  errors,
  showValidation,
  saving,
  onChange,
  onSubmit,
}: CartItemFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  const visibleErrors = showValidation ? errors : {};

  return (
    <section className="grid gap-5">
      <StepHeader
        title={title}
        subtitle={`${cart.storeName} · ${formatDate(cart.date)}`}
      />

      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Ficha mínima de prenda</CardTitle>
            <CardDescription>
              El ID de captura se genera automáticamente al guardar. No se
              convierte en código interno hasta confirmar el pago.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            {/* Foto principal */}
            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium text-foreground">
                Foto principal demo
              </legend>
              <ToggleGroup
                type="single"
                value={draft.mainPhotoPlaceholder || undefined}
                onValueChange={(value) => {
                  if (value) onChange({ mainPhotoPlaceholder: value });
                }}
                className="grid-cols-2"
                disabled={saving}
              >
                {mainPhotoPlaceholders.map((placeholder) => (
                  <ToggleGroupItem
                    key={placeholder.id}
                    value={placeholder.id}
                    disabled={saving}
                    aria-label={placeholder.label}
                  >
                    <ImagePlus className="size-5" aria-hidden="true" />
                    <span className="text-sm font-semibold">
                      {placeholder.label}
                    </span>
                    <span className="text-xs leading-4 text-muted-foreground">
                      {placeholder.description}
                    </span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {visibleErrors.mainPhotoPlaceholder ? (
                <span role="alert" className="text-xs font-medium text-danger">
                  {visibleErrors.mainPhotoPlaceholder}
                </span>
              ) : null}
            </fieldset>

            <Separator />

            {/* Costo de compra */}
            <Field
              label={`Costo de compra (${cart.currency})`}
              htmlFor="purchaseCost"
              error={visibleErrors.purchaseCost}
            >
              <Input
                id="purchaseCost"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={draft.purchaseCost}
                onChange={(event) => onChange({ purchaseCost: event.target.value })}
                disabled={saving}
                placeholder="0.00"
                aria-invalid={Boolean(visibleErrors.purchaseCost) || undefined}
              />
            </Field>

            <Separator />

            {/* Categoría */}
            <Field
              label="Categoría formal"
              htmlFor="categoryId"
              error={visibleErrors.categoryId}
              help="Opcional. Si queda vacío, el item entra a revisión de categoría."
            >
              <NativeSelect
                id="categoryId"
                value={draft.categoryId}
                onChange={(event) => onChange({ categoryId: event.target.value })}
                disabled={saving}
                aria-invalid={Boolean(visibleErrors.categoryId) || undefined}
              >
                <option value="">Sin categoría — Revisión de categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </CardContent>
        </Card>

        <StickyActionBar
          primary={
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={saving}
              className="w-full"
            >
              {saving ? <Spinner /> : <Save className="size-4" aria-hidden="true" />}
              {saving
                ? "Guardando..."
                : mode === "create"
                  ? "Guardar item"
                  : "Guardar cambios"}
            </Button>
          }
        />
      </form>
    </section>
  );
}
