import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, RefreshCw, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { ApiError } from "@/common/types/api";
import { useExchangeRateStore } from "@/store/use-exchange-rate";
import { useCatalogOptions } from "../hooks/use-catalog-options";
import { useItemEditorUpdate, type ItemEditorPayload } from "../hooks/use-item-editor-update";
import { findInventoryItem } from "../lib/item-photo-cache";
import { getItemReadinessIssues } from "../lib/item-readiness";
import type { ItemDto } from "../types/item";
import { ItemPhotoManager } from "./ItemPhotoManager";

interface ItemEditorDialogProps {
  itemId: string | null;
  open: boolean;
  onClose: () => void;
  canViewFinancials?: boolean;
}

interface ItemEditorForm {
  productName: string;
  brandId: string;
  categoryId: string;
  conditionId: string;
  sizeId: string;
  colorId: string;
  physicalLocation: string;
  targetPriceMxn: string;
  notes: string;
  costCurrency: string;
  costAmount: string;
  exchangeRate: string;
  minPriceMxn: string;
}

interface CatalogOption {
  id: string;
  name: string;
}

const EMPTY_FORM: ItemEditorForm = {
  productName: "",
  brandId: "",
  categoryId: "",
  conditionId: "",
  sizeId: "",
  colorId: "",
  physicalLocation: "",
  targetPriceMxn: "",
  notes: "",
  costCurrency: "MXN",
  costAmount: "",
  exchangeRate: "",
  minPriceMxn: "",
};

function formFromItem(item: ItemDto): ItemEditorForm {
  return {
    productName: item.productName ?? "",
    brandId: item.brandId,
    categoryId: item.categoryId,
    conditionId: item.conditionId,
    sizeId: item.sizeId ?? "",
    colorId: item.colorId ?? "",
    physicalLocation: item.physicalLocation ?? "",
    targetPriceMxn: item.targetPriceMxn?.toString() ?? "",
    notes: item.notes ?? "",
    costCurrency: item.costCurrency ?? "MXN",
    costAmount: item.costAmount?.toString() ?? "",
    exchangeRate: item.exchangeRate?.toString() ?? "",
    minPriceMxn: item.minPriceMxn?.toString() ?? "",
  };
}

function addCurrentOption(options: CatalogOption[], current?: { id: string; name: string } | null): CatalogOption[] {
  return current && !options.some((option) => option.id === current.id)
    ? [current, ...options]
    : options;
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "hace unos segundos";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export function ItemEditorDialog({ itemId, open, onClose, canViewFinancials = false }: ItemEditorDialogProps) {
  const queryClient = useQueryClient();
  const item = findInventoryItem(queryClient, itemId);
  const { brands, categories, conditions, sizes, colors, isLoading: catalogsLoading } = useCatalogOptions();
  const updateMutation = useItemEditorUpdate();
  const photoMutationCount = useIsMutating({
    mutationKey: ["inventory", "item-photos", itemId ?? "no-item"],
  });
  const [form, setForm] = useState<ItemEditorForm>(item ? formFromItem(item) : EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("generales");

  const currentRate = useExchangeRateStore((state) => state.currentRate);
  const rateLoading = useExchangeRateStore((state) => state.loading);
  const rateError = useExchangeRateStore((state) => state.error);
  const fetchCurrentRate = useExchangeRateStore((state) => state.fetchCurrentRate);

  useEffect(() => {
    if (item && open) {
      setForm(formFromItem(item));
      setErrors({});
      setActiveTab("generales");
    }
  }, [item?.id, open]);

  // Fetch exchange rate when dialog opens or "Compra" tab becomes active
  useEffect(() => {
    if (open && activeTab === "compra") {
      fetchCurrentRate().catch(() => {
        // error is captured in the store
      });
    }
  }, [open, activeTab, fetchCurrentRate]);

  const computedCostMxnEq = useMemo(() => {
    const amount = form.costAmount === "" ? null : Number(form.costAmount);
    // Normalize item cost (Prisma Decimal may return string)
    const itemCost = Number.isFinite(Number(item?.costMxnEq)) ? Number(item!.costMxnEq) : null;
    if (amount === null || !Number.isFinite(amount)) {
      return itemCost;
    }
    if (form.costCurrency === "MXN") {
      return amount; // cost IS in pesos
    }
    const rate = form.exchangeRate === "" ? null : Number(form.exchangeRate);
    if (rate !== null && Number.isFinite(rate)) {
      return amount * rate; // USD → MXN
    }
    return itemCost;
  }, [form.costAmount, form.costCurrency, form.exchangeRate, item]);

  const readinessIssues = useMemo(
    () => (item ? getItemReadinessIssues(item) : []),
    [item],
  );

  const handleRefreshRate = useCallback(async () => {
    try {
      await fetchCurrentRate();
      const rate = useExchangeRateStore.getState().currentRate;
      if (rate) {
        setForm((current) => ({ ...current, exchangeRate: rate.rate.toString() }));
      }
    } catch {
      // error handled by store
    }
  }, [fetchCurrentRate]);

  // Sync exchange rate from store when it loads and currency is USD
  useEffect(() => {
    if (currentRate && activeTab === "compra" && form.costCurrency === "USD" && form.exchangeRate === "" && item?.exchangeRate == null) {
      setForm((current) => ({ ...current, exchangeRate: currentRate.rate.toString() }));
    }
  }, [currentRate, activeTab, form.costCurrency, form.exchangeRate, item?.exchangeRate]);

  if (!item) return null;
  const currentItem = item;

  const optionGroups = {
    brands: addCurrentOption(brands, currentItem.brand),
    categories: addCurrentOption(categories, currentItem.category),
    conditions: addCurrentOption(conditions, currentItem.condition),
    sizes: addCurrentOption(sizes, currentItem.size),
    colors: addCurrentOption(colors, currentItem.color),
  };
  const isSaving = updateMutation.isPending;
  const isDirty = JSON.stringify(form) !== JSON.stringify(formFromItem(currentItem));

  function updateField(field: keyof ItemEditorForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function closeEditor() {
    if (isSaving) return;
    if (photoMutationCount > 0) {
      window.alert("Espera a que terminen los cambios de fotos antes de cerrar el editor.");
      return;
    }
    if (isDirty && !window.confirm("Tienes cambios sin guardar. ¿Quieres descartarlos?")) return;
    onClose();
  }

  function validate(): ItemEditorPayload | null {
    const nextErrors: Record<string, string> = {};
    if (!form.brandId) nextErrors.brandId = "Selecciona una marca.";
    if (!form.categoryId) nextErrors.categoryId = "Selecciona una categoría.";
    if (!form.conditionId) nextErrors.conditionId = "Selecciona una condición.";

    const price = form.targetPriceMxn.trim() === "" ? null : Number(form.targetPriceMxn);
    if (price !== null && (!Number.isFinite(price) || price <= 0)) {
      nextErrors.targetPriceMxn = "Ingresa un precio mayor que cero o déjalo vacío.";
    }

    const costVal = form.costAmount.trim() === "" ? null : Number(form.costAmount);
    if (costVal !== null && (!Number.isFinite(costVal) || costVal < 0)) {
      nextErrors.costAmount = "Ingresa un costo válido mayor o igual a cero.";
    }

    const rateVal = form.exchangeRate.trim() === "" ? null : Number(form.exchangeRate);
    if (rateVal !== null && (!Number.isFinite(rateVal) || rateVal < 0)) {
      nextErrors.exchangeRate = "Ingresa un tipo de cambio válido.";
    }

    const minPriceVal = form.minPriceMxn.trim() === "" ? null : Number(form.minPriceMxn);
    if (minPriceVal !== null && (!Number.isFinite(minPriceVal) || minPriceVal < 0)) {
      nextErrors.minPriceMxn = "Ingresa un precio mínimo válido.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return null;

    return {
      productName: form.productName.trim() || null,
      brandId: form.brandId,
      categoryId: form.categoryId,
      conditionId: form.conditionId,
      sizeId: form.sizeId || null,
      colorId: form.colorId || null,
      physicalLocation: form.physicalLocation.trim() || null,
      targetPriceMxn: price,
      notes: form.notes.trim() || null,
      costCurrency: form.costCurrency || "MXN",
      costAmount: costVal,
      exchangeRate: rateVal,
      minPriceMxn: minPriceVal,
    };
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = validate();
    if (!payload) return;

    try {
      await updateMutation.mutateAsync({ id: currentItem.id, data: payload });
      toast.success("Prenda actualizada");
      if (photoMutationCount > 0) {
        toast.info("La prenda se guardó. Espera a que terminen los cambios de fotos para cerrar.");
      } else {
        onClose();
      }
    } catch (error) {
      const message = error instanceof ApiError || error instanceof Error
        ? error.message
        : "Error desconocido";
      toast.error(`No se pudo actualizar la prenda: ${message}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) closeEditor(); }}>
      <DialogContent className="max-h-[95vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Editar prenda {currentItem.internalCode}
          </DialogTitle>
          <DialogDescription>
            Completa los datos de la prenda. Los costos y la venta se configuran en sus pestañas.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          <div className="mb-1 flex items-center gap-2 font-medium">
            <TriangleAlert className="h-4 w-4" />
            {readinessIssues.length > 0 ? "Faltantes para preparar" : "Ficha lista para revisión"}
          </div>
          {readinessIssues.length > 0 ? (
            <p>{readinessIssues.map((issue) => issue.label).join(", ")}.</p>
          ) : (
            <p>Esta ficha tiene los datos mínimos de esta etapa.</p>
          )}
        </div>

        <form onSubmit={submit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="generales" disabled={photoMutationCount > 0}>Generales</TabsTrigger>
              <TabsTrigger value="compra" disabled={photoMutationCount > 0}>Compra</TabsTrigger>
              <TabsTrigger value="venta" disabled={photoMutationCount > 0}>Venta</TabsTrigger>
              <TabsTrigger value="fotos">Fotos</TabsTrigger>
            </TabsList>

            {/* ── Tab 1: Generales ── */}
            <TabsContent value="generales" className="space-y-5">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Identidad</h3>
                <Field label="Nombre de la prenda" htmlFor="editor-product-name">
                  <Input
                    id="editor-product-name"
                    value={form.productName}
                    onChange={(event) => updateField("productName", event.target.value)}
                    disabled={isSaving}
                    placeholder="Ej. Sudadera Nike gris"
                  />
                </Field>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Clasificación</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SelectField label="Marca" field="brandId" options={optionGroups.brands} required />
                  <SelectField label="Categoría" field="categoryId" options={optionGroups.categories} required />
                  <SelectField label="Condición" field="conditionId" options={optionGroups.conditions} required />
                  <SelectField label="Talla" field="sizeId" options={optionGroups.sizes} emptyLabel="Sin talla" />
                  <SelectField label="Color" field="colorId" options={optionGroups.colors} emptyLabel="Sin color" />
                </div>
              </section>

              <section className="space-y-3">
                <Field label="Ubicación física" htmlFor="editor-location">
                  <Input
                    id="editor-location"
                    value={form.physicalLocation}
                    onChange={(event) => updateField("physicalLocation", event.target.value)}
                    disabled={isSaving}
                    placeholder="Ej. Rack B-02"
                  />
                </Field>
              </section>

              <Field label="Notas operativas" htmlFor="editor-notes">
                <textarea
                  id="editor-notes"
                  className="flex min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  disabled={isSaving}
                  placeholder="Detalles, medidas o defectos que el equipo debe revisar"
                />
              </Field>
            </TabsContent>

            {/* ── Tab 2: Compra ── */}
            <TabsContent value="compra" className="space-y-5">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Costo de adquisición</h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label={`Costo (${form.costCurrency})`} htmlFor="editor-cost-amount" error={errors.costAmount}>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="editor-cost-amount"
                        inputMode="decimal"
                        type="number"
                        min="0"
                        step="0.01"
                        className="pl-6"
                        value={form.costAmount}
                        onChange={(event) => updateField("costAmount", event.target.value)}
                        disabled={isSaving}
                        placeholder="0.00"
                      />
                    </div>
                  </Field>

                  <Field label="Moneda" htmlFor="editor-cost-currency">
                    <select
                      id="editor-cost-currency"
                      className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                      value={form.costCurrency}
                      onChange={(event) => updateField("costCurrency", event.target.value)}
                      disabled={isSaving}
                    >
                      <option value="MXN">MXN — Pesos mexicanos</option>
                      <option value="USD">USD — Dólares</option>
                    </select>
                  </Field>
                </div>

                {form.costCurrency === "USD" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Tipo de cambio" htmlFor="editor-exchange-rate" error={errors.exchangeRate}>
                      <div className="flex gap-1">
                        <Input
                          id="editor-exchange-rate"
                          inputMode="decimal"
                          type="number"
                          min="0"
                          step="0.000001"
                          value={form.exchangeRate}
                          onChange={(event) => updateField("exchangeRate", event.target.value)}
                          disabled={isSaving || rateLoading}
                          placeholder="Ej. 18.50"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleRefreshRate}
                          disabled={rateLoading}
                          title="Actualizar tipo de cambio"
                        >
                          {rateLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </Field>

                    <Field label="Costo MXN (estimado)" htmlFor="editor-cost-mxn-eq">
                      <div className="relative">
                        <Input
                          id="editor-cost-mxn-eq"
                          value={computedCostMxnEq != null ? computedCostMxnEq.toFixed(2) : ""}
                          disabled
                          className="text-muted-foreground"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          MXN
                        </span>
                      </div>
                    </Field>
                  </div>
                )}

                {form.costCurrency === "MXN" && (
                  <p className="text-xs text-muted-foreground">
                    El costo se guarda directamente en pesos. Si compraste en dólares, cambia la moneda a USD
                    y agrega el tipo de cambio del día de compra.
                  </p>
                )}

                {currentRate && form.costCurrency === "USD" && (
                  <p className="text-xs text-muted-foreground">
                    Fuente: {currentRate.apiSource} · actualizado {timeAgo(currentRate.fetchedAt)}
                  </p>
                )}
                {rateError && (
                  <p className="text-xs text-destructive">
                    Error al obtener tipo de cambio: {rateError}
                  </p>
                )}

                {/* Hidden: store exchange rate as reference even when currency is MXN */}
                {form.costCurrency === "MXN" && form.exchangeRate && (
                  <div className="rounded-md border border-border bg-muted/20 p-2 text-xs text-muted-foreground">
                    Tipo de cambio registrado (referencia): {form.exchangeRate}
                    <button
                      type="button"
                      className="ml-2 text-primary underline"
                      onClick={() => updateField("exchangeRate", "")}
                    >
                      Limpiar
                    </button>
                  </div>
                )}
              </section>
            </TabsContent>

            {/* ── Tab 3: Venta ── */}
            <TabsContent value="venta" className="space-y-5">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Precios de venta</h3>

                <Field label="Precio público (MXN)" htmlFor="editor-price" error={errors.targetPriceMxn}>
                  <Input
                    id="editor-price"
                    inputMode="decimal"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.targetPriceMxn}
                    onChange={(event) => updateField("targetPriceMxn", event.target.value)}
                    disabled={isSaving}
                    aria-invalid={Boolean(errors.targetPriceMxn)}
                    placeholder="Ej. 850"
                  />
                </Field>

                {canViewFinancials && (
                  <Field label="Precio mínimo (MXN)" htmlFor="editor-min-price" error={errors.minPriceMxn}>
                    <Input
                      id="editor-min-price"
                      inputMode="decimal"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.minPriceMxn}
                      onChange={(event) => updateField("minPriceMxn", event.target.value)}
                      disabled={isSaving}
                      placeholder="Ej. 500"
                    />
                  </Field>
                )}
              </section>
            </TabsContent>

            <TabsContent value="fotos" className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Los cambios en fotos se guardan inmediatamente. Cerrar el editor no deshace cambios de fotos ya realizados.
              </p>
              <ItemPhotoManager itemId={currentItem.id} photos={currentItem.photos} />
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={closeEditor} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving || catalogsLoading}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  function SelectField({
    label,
    field,
    options,
    emptyLabel = "Seleccionar...",
    required = false,
  }: {
    label: string;
    field: "brandId" | "categoryId" | "conditionId" | "sizeId" | "colorId";
    options: CatalogOption[];
    emptyLabel?: string;
    required?: boolean;
  }) {
    const fieldId = `editor-${field}`;
    const error = errors[field];
    return (
      <Field label={label} htmlFor={fieldId} error={error}>
        <select
          id={fieldId}
          className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          value={form[field]}
          onChange={(event) => updateField(field, event.target.value)}
          disabled={isSaving || catalogsLoading}
          aria-invalid={Boolean(error)}
        >
          <option value="">{emptyLabel}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>{option.name}</option>
          ))}
        </select>
        {required && <span className="sr-only">Campo obligatorio</span>}
      </Field>
    );
  }
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
    </div>
  );
}
