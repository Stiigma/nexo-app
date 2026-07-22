import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/common/components/ui/alert-dialog";
import { ApiError } from "@/common/types/api";
import type { CatConfig, CatEntity } from "../types/catalog-entity";
import { useCatalogDelete } from "../hooks/use-catalog-delete";

interface CatalogDeleteDialogProps<T extends CatEntity> {
  config: CatConfig<T>;
  target: T | null;
  onClose: () => void;
}

export function CatalogDeleteDialog<T extends CatEntity>({
  config,
  target,
  onClose,
}: CatalogDeleteDialogProps<T>) {
  const deleteMutation = useCatalogDelete(config);

  async function handleDelete() {
    if (!target) return;
    try {
      await deleteMutation.mutateAsync(target.id);
      toast.success(`${config.singular} eliminada`);
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Error desconocido";
      toast.error(`No se pudo eliminar la ${config.singular.toLowerCase()}: ${message}`);
    }
  }

  return (
    <AlertDialog open={!!target} onOpenChange={(o) => (o ? null : onClose())}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar {config.singular.toLowerCase()}</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Seguro que quieres eliminar{" "}
            <strong className="text-foreground">
              {target ? String((target as Record<string, unknown>).name ?? config.singular) : ""}
            </strong>
            ? Esta acción no se puede deshacer.
            <br />
            <span className="text-xs">Los registros históricos no se afectan.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
