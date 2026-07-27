import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/common/components/ui/dialog";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Switch } from "@/common/components/ui/switch";
import { Button } from "@/common/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/common/components/ui/select";
import { cn } from "@/common/lib/utils";
import { ApiError } from "@/common/types/api";
import type { CatConfig, CatEntity, CatField } from "../types/catalog-entity";
import { useCatalogCreate } from "../hooks/use-catalog-create";
import { useCatalogUpdate } from "../hooks/use-catalog-update";

interface CatalogFormDialogProps<T extends CatEntity> {
  config: CatConfig<T>;
  open: boolean;
  mode: "create" | "edit";
  editingEntity: T | null;
  onClose: () => void;
}

type FormValues = Record<string, unknown>;

export function CatalogFormDialog<T extends CatEntity>({
  config,
  open,
  mode,
  editingEntity,
  onClose,
}: CatalogFormDialogProps<T>) {
  const createMutation = useCatalogCreate(config);
  const updateMutation = useCatalogUpdate(config);
  const isEdit = mode === "edit";

  // Build default values: config defaults, overlaid with editing entity in edit mode.
  const defaults: FormValues = {
    ...(config.defaultValues as Record<string, unknown>),
    active: true,
    ...(isEdit && editingEntity ? (editingEntity as Record<string, unknown>) : {}),
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(config.schema as never) as never,
    defaultValues: defaults,
    values: defaults,
  });

  function handleClose() {
    reset();
    onClose();
  }

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit && editingEntity) {
        await updateMutation.mutateAsync({ id: editingEntity.id, data: values as Partial<T> });
        toast.success(`${config.singular} actualizada`);
      } else {
        await createMutation.mutateAsync(values);
        toast.success(`${config.singular} creada`);
      }
      handleClose();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Error desconocido";
      toast.error(`No se pudo ${isEdit ? "actualizar" : "crear"} la ${config.singular.toLowerCase()}: ${message}`);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Dynamic option loaders for select fields
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, { value: string; label: string }[]>>({});
  const [loadingOptions, setLoadingOptions] = useState<Set<string>>(new Set());

  useEffect(() => {
    for (const field of config.fields) {
      if (field.type === "select" && field.optionsLoader && !dynamicOptions[field.name]) {
        setLoadingOptions((prev) => new Set(prev).add(field.name));
        void field.optionsLoader().then((options) => {
          setDynamicOptions((prev) => ({ ...prev, [field.name]: options }));
          setLoadingOptions((prev) => {
            const next = new Set(prev);
            next.delete(field.name);
            return next;
          });
        });
      }
    }
  }, [config.fields, dynamicOptions]);

  function renderField(field: CatField) {
    const error = errors[field.name]?.message as string | undefined;
    const fieldId = `field-${field.name}`;
    const fieldValue = watch(field.name);

    const labelEl = (
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
    );

    const hintEl = field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>;
    const errorEl = error && (
      <p className="text-xs text-destructive" role="alert">
        {error}
      </p>
    );

    let control: React.ReactNode;

    if (field.type === "boolean") {
      control = (
        <div className="flex items-center gap-2">
          <Switch
            id={fieldId}
            checked={Boolean(fieldValue)}
            onCheckedChange={(checked) => setValue(field.name, checked, { shouldValidate: true })}
            disabled={isSaving}
          />
          <span className="text-sm text-muted-foreground">
            {Boolean(fieldValue) ? "Activo" : "Inactivo"}
          </span>
        </div>
      );
    } else if (field.type === "select") {
      const options = dynamicOptions[field.name] ?? field.options ?? [];
      const isLoading = loadingOptions.has(field.name);
      control = (
        <Select
          value={String(fieldValue ?? "")}
          onValueChange={(val) => setValue(field.name, val, { shouldValidate: true })}
          disabled={isSaving || isLoading}
        >
          <SelectTrigger id={fieldId}>
            <SelectValue placeholder={isLoading ? "Cargando..." : (field.placeholder ?? "Seleccionar...")} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    } else if (field.type === "textarea") {
      control = (
        <textarea
          id={fieldId}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
            error && "border-destructive"
          )}
          placeholder={field.placeholder}
          disabled={isSaving}
          {...register(field.name)}
        />
      );
    } else if (field.type === "number") {
      control = (
        <Input
          id={fieldId}
          type="number"
          step="any"
          placeholder={field.placeholder}
          disabled={isSaving}
          aria-invalid={!!error}
          {...register(field.name, { valueAsNumber: true })}
        />
      );
    } else {
      control = (
        <Input
          id={fieldId}
          type="text"
          placeholder={field.placeholder}
          disabled={isSaving}
          aria-invalid={!!error}
          {...register(field.name)}
        />
      );
    }

    return (
      <div
        key={field.name}
        className={cn(
          "flex flex-col gap-1.5",
          field.fullWidth ? "sm:col-span-2" : ""
        )}
      >
        {field.type === "boolean" ? (
          <div className="flex items-center justify-between gap-2 pt-1">
            {labelEl}
            {control}
          </div>
        ) : (
          <>
            {labelEl}
            {control}
            {hintEl}
            {errorEl}
          </>
        )}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : handleClose())}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Editar ${config.singular}` : `Nueva ${config.singular}`}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {config.fields.map(renderField)}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
