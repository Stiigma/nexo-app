import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Camera, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { ApiError } from "@/common/types/api";
import { useExchangeRateStore } from "@/store/use-exchange-rate";
import { useCatalogOptions } from "@/features/inventory/hooks/use-catalog-options";
import { useItemCapture } from "../hooks/use-item-capture";
import type { CreateItemPayload } from "@/features/inventory/hooks/use-item-create";
import {
  MAX_ITEM_PHOTOS,
  validatePhotoFiles,
} from "@/features/inventory/lib/item-photo-files";
import { CameraCapture } from "@/features/inventory/components/CameraCapture";

interface CaptureForm {
  internalCode: string;
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

interface PendingPhoto {
  file: File;
  previewUrl: string;
}

function genInternalCode(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `NX-${ts}-${rand}`;
}

const EMPTY_FORM: CaptureForm = {
  internalCode: genInternalCode(),
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

export function CapturePage() {
  const { brands, categories, conditions, sizes, colors, isLoading: catalogsLoading } = useCatalogOptions();
  const captureMutation = useItemCapture();
  const [form, setForm] = useState<CaptureForm>(() => ({ ...EMPTY_FORM, internalCode: genInternalCode() }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("generales");
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [photoErrors, setPhotoErrors] = useState<string[]>([]);

  const currentRate = useExchangeRateStore((state) => state.currentRate);
  const rateLoading = useExchangeRateStore((state) => state.loading);
  const rateError = useExchangeRateStore((state) => state.error);
  const fetchCurrentRate = useExchangeRateStore((state) => state.fetchCurrentRate);

  const remainingSlots = Math.max(0, MAX_ITEM_PHOTOS - pendingPhotos.length);
  const isSaving = captureMutation.isPending;
  const isSuccess = captureMutation.isSuccess;

  // Fetch exchange rate when "Compra" tab becomes active
  useEffect(() => {
    if (activeTab === "compra") {
      fetchCurrentRate().catch(() => {});
    }
  }, [activeTab, fetchCurrentRate]);

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

  // Auto-fill rate when USD is selected
  useEffect(() => {
    if (currentRate && activeTab === "compra" && form.costCurrency === "USD" && form.exchangeRate === "") {
      setForm((current) => ({ ...current, exchangeRate: currentRate.rate.toString() }));
    }
  }, [currentRate, activeTab, form.costCurrency, form.exchangeRate]);

  const computedCostMxnEq = useMemo(() => {
    const amount = form.costAmount === "" ? null : Number(form.costAmount);
    if (amount === null || !Number.isFinite(amount)) return null;
    if (form.costCurrency === "MXN") return amount;
    const rate = form.exchangeRate === "" ? null : Number(form.exchangeRate);
    if (rate !== null && Number.isFinite(rate)) return amount * rate;
    return null;
  }, [form.costAmount, form.costCurrency, form.exchangeRate]);

  function updateField(field: keyof CaptureForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handlePhotosSelected(files: File[]) {
    const { accepted, errors: validationErrors } = validatePhotoFiles(files, remainingSlots);
    setPhotoErrors(validationErrors);
    accepted.forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      setPendingPhotos((current) => [...current, { file, previewUrl }]);
    });
  }

  function removePendingPhoto(index: number) {
    setPendingPhotos((current) => {
      const removed = current[index];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((_, i) => i !== index);
    });
  }

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, []);

  function resetForm() {
    setForm({ ...EMPTY_FORM, internalCode: genInternalCode() });
    setErrors({});
    setActiveTab("generales");
    // Clean up pending photo previews
    pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPendingPhotos([]);
    setPhotoErrors([]);
    captureMutation.reset();
  }

  function validate(): CreateItemPayload | null {
    const nextErrors: Record<string, string> = {};

    if (!form.internalCode.trim()) nextErrors.internalCode = "El código interno es obligatorio.";
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
      internalCode: form.internalCode.trim(),
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
      const photoFiles = pendingPhotos.map((p) => p.file);
      await captureMutation.mutateAsync({ data: payload, photoFiles });
      toast.success("Prenda capturada correctamente");
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Error desconocido";
      toast.error(`No se pudo capturar la prenda: ${message}`);
    }
  }

  // Success state after capture
  if (isSuccess) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="mb-6 inline-flex rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/30">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">¡Prenda capturada!</h2>
        <p className="mb-8 text-muted-foreground">
          La prenda <span className="font-mono font-medium text-foreground">{form.internalCode}</span> se
          registró correctamente. Puedes capturar otra o revisarla en el inventario.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={resetForm}>
            Capturar otra prenda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Captura de prenda</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registra una nueva prenda. Completa los datos disponibles; si falta el precio, quedará como
          &ldquo;Falta precio&rdquo; para completar después.
        </p>
      </div>

      <form onSubmit={submit} className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid h-auto w-full grid-cols-4">
            <TabsTrigger value="generales">Generales</TabsTrigger>
            <TabsTrigger value="compra">Compra</TabsTrigger>
            <TabsTrigger value="venta">Venta</TabsTrigger>
            <TabsTrigger value="fotos">Fotos</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Generales ── */}
          <TabsContent value="generales" className="space-y-5 pt-4">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Código interno</h3>
              <Field label="Código" htmlFor="capture-code" error={errors.internalCode}>
                <div className="flex gap-1">
                  <Input
                    id="capture-code"
                    value={form.internalCode}
                    onChange={(event) => updateField("internalCode", event.target.value)}
                    disabled={isSaving}
                    placeholder="NX-0001"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => updateField("internalCode", genInternalCode())}
                    disabled={isSaving}
                    title="Generar nuevo código"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </Field>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Identidad</h3>
              <Field label="Nombre de la prenda" htmlFor="capture-product-name">
                <Input
                  id="capture-product-name"
                  value={form.productName}
                  onChange={(event) => updateField("productName", event.target.value)}
                  disabled={isSaving}
                  placeholder="Ej. Sudadera Nike gris (opcional, se deriva automáticamente)"
                />
              </Field>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Clasificación</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField label="Marca" field="brandId" options={brands} required />
                <SelectField label="Categoría" field="categoryId" options={categories} required />
                <SelectField label="Condición" field="conditionId" options={conditions} required />
                <SelectField label="Talla" field="sizeId" options={sizes} emptyLabel="Sin talla" />
                <SelectField label="Color" field="colorId" options={colors} emptyLabel="Sin color" />
              </div>
            </section>

            <section className="space-y-3">
              <Field label="Ubicación física" htmlFor="capture-location">
                <Input
                  id="capture-location"
                  value={form.physicalLocation}
                  onChange={(event) => updateField("physicalLocation", event.target.value)}
                  disabled={isSaving}
                  placeholder="Ej. Rack B-02"
                />
              </Field>
            </section>

            <Field label="Notas operativas" htmlFor="capture-notes">
              <textarea
                id="capture-notes"
                className="flex min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                disabled={isSaving}
                placeholder="Detalles, medidas o defectos que el equipo debe revisar"
              />
            </Field>
          </TabsContent>

          {/* ── Tab 2: Compra ── */}
          <TabsContent value="compra" className="space-y-5 pt-4">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Costo de adquisición</h3>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={`Costo (${form.costCurrency})`} htmlFor="capture-cost-amount" error={errors.costAmount}>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="capture-cost-amount"
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

                <Field label="Moneda" htmlFor="capture-cost-currency">
                  <select
                    id="capture-cost-currency"
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
                  <Field label="Tipo de cambio" htmlFor="capture-exchange-rate" error={errors.exchangeRate}>
                    <div className="flex gap-1">
                      <Input
                        id="capture-exchange-rate"
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

                  <Field label="Costo MXN (estimado)" htmlFor="capture-cost-mxn-eq">
                    <div className="relative">
                      <Input
                        id="capture-cost-mxn-eq"
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
                  Fuente: {currentRate.apiSource} · actualizado hace unos segundos
                </p>
              )}
              {rateError && (
                <p className="text-xs text-destructive">
                  Error al obtener tipo de cambio: {rateError}
                </p>
              )}
            </section>
          </TabsContent>

          {/* ── Tab 3: Venta ── */}
          <TabsContent value="venta" className="space-y-5 pt-4">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Precios de venta</h3>

              <Field label="Precio público (MXN)" htmlFor="capture-price" error={errors.targetPriceMxn}>
                <Input
                  id="capture-price"
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

              <Field label="Precio mínimo (MXN)" htmlFor="capture-min-price" error={errors.minPriceMxn}>
                <Input
                  id="capture-min-price"
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
            </section>
          </TabsContent>

          {/* ── Tab 4: Fotos ── */}
          <TabsContent value="fotos" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Las fotos se subirán al guardar la prenda. Máximo {MAX_ITEM_PHOTOS} fotos, hasta 5 MB cada una.
            </p>

            <CameraCapture
              pendingPhotos={pendingPhotos}
              onPhotosSelected={handlePhotosSelected}
              onRemovePhoto={removePendingPhoto}
              disabled={isSaving}
              remainingSlots={remainingSlots}
            />

            {photoErrors.length > 0 && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
                <ul className="list-disc space-y-1 pl-5">
                  {photoErrors.map((msg, i) => <li key={i}>{msg}</li>)}
                </ul>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={isSaving}
          >
            Limpiar formulario
          </Button>
          <Button type="submit" disabled={isSaving || catalogsLoading} size="lg">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving
              ? "Capturando..."
              : pendingPhotos.length > 0
                ? <><Camera className="h-4 w-4" /> Capturar prenda + {pendingPhotos.length} foto{pendingPhotos.length > 1 ? "s" : ""}</>
                : <><Camera className="h-4 w-4" /> Capturar prenda</>}
          </Button>
        </div>
      </form>
    </div>
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
    const fieldId = `capture-${field}`;
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
