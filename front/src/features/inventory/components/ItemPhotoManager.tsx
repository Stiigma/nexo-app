// Created by: OpenCode (AI-assisted), 2026-07-26

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ImageOff,
  Loader2,
  RefreshCw,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import { useItemPhotoDelete } from "../hooks/use-item-photo-delete";
import { useItemPhotoSetMain } from "../hooks/use-item-photo-main";
import { useItemPhotoReorder } from "../hooks/use-item-photo-reorder";
import { useItemPhotoUpload } from "../hooks/use-item-photo-upload";
import { refreshInventoryItems } from "../lib/item-photo-cache";
import {
  MAX_ITEM_PHOTOS,
  validatePhotoFiles,
} from "../lib/item-photo-files";
import { itemPhotoContentUrl } from "../lib/item-photo-content-url";
import { sortPhotos } from "../lib/item-photos";
import type { ItemPhoto } from "../types/item";

interface ItemPhotoManagerProps {
  itemId: string;
  photos: ItemPhoto[];
}

interface PendingPhoto {
  file: File;
  previewUrl: string;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo completar el cambio.";
}

export function ItemPhotoManager({ itemId, photos }: ItemPhotoManagerProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef(new Set<string>());
  const uploadMutation = useItemPhotoUpload(itemId);
  const deleteMutation = useItemPhotoDelete(itemId);
  const mainMutation = useItemPhotoSetMain(itemId);
  const reorderMutation = useItemPhotoReorder(itemId);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<ItemPhoto | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const orderedPhotos = sortPhotos(photos);
  const remainingSlots = Math.max(0, MAX_ITEM_PHOTOS - orderedPhotos.length);
  const mutationPending = uploadMutation.isPending
    || deleteMutation.isPending
    || mainMutation.isPending
    || reorderMutation.isPending;
  const visibleError = actionError;

  useEffect(() => () => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current.clear();
  }, []);

  function releasePreviews(previews: PendingPhoto[]) {
    previews.forEach(({ previewUrl }) => {
      URL.revokeObjectURL(previewUrl);
      previewUrlsRef.current.delete(previewUrl);
    });
  }

  function selectFiles(files: File[]) {
    const { accepted, errors } = validatePhotoFiles(files, remainingSlots);
    releasePreviews(pendingPhotos);
    const nextPending = accepted.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);
      return { file, previewUrl };
    });
    setPendingPhotos(nextPending);
    setValidationErrors(errors);
    setActionError(null);
    setUploadFailed(false);
  }

  function removePendingPhoto(index: number) {
    setPendingPhotos((current) => {
      const removed = current[index];
      if (removed) releasePreviews([removed]);
      return current.filter((_, photoIndex) => photoIndex !== index);
    });
  }

  async function uploadPendingPhotos() {
    if (pendingPhotos.length === 0 || mutationPending) return;
    setActionError(null);
    setUploadFailed(false);
    const formData = new FormData();
    pendingPhotos.forEach(({ file }) => formData.append("files", file));
    try {
      await uploadMutation.mutateAsync(formData);
      releasePreviews(pendingPhotos);
      setPendingPhotos([]);
      setValidationErrors([]);
      if (inputRef.current) inputRef.current.value = "";
      toast.success(pendingPhotos.length === 1 ? "Foto agregada" : "Fotos agregadas");
    } catch (error) {
      setActionError(errorMessage(error));
      setUploadFailed(true);
    }
  }

  async function setMainPhoto(photoId: string) {
    setActionError(null);
    setUploadFailed(false);
    try {
      await mainMutation.mutateAsync(photoId);
      toast.success("Foto principal actualizada");
    } catch (error) {
      setActionError(errorMessage(error));
    }
  }

  async function movePhoto(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= orderedPhotos.length) return;
    const photoIds = orderedPhotos.map(({ id }) => id);
    [photoIds[index], photoIds[targetIndex]] = [photoIds[targetIndex], photoIds[index]];
    setActionError(null);
    setUploadFailed(false);
    try {
      await reorderMutation.mutateAsync(photoIds);
    } catch (error) {
      setActionError(errorMessage(error));
    }
  }

  async function deletePhoto() {
    if (!photoToDelete) return;
    setActionError(null);
    setUploadFailed(false);
    try {
      const response = await deleteMutation.mutateAsync(photoToDelete.id);
      if (response.cleanupStatus === "pending") {
        toast.info("La foto se eliminó. La limpieza del archivo continúa en segundo plano.");
      } else {
        toast.success("Foto eliminada");
      }
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setPhotoToDelete(null);
    }
  }

  function retry() {
    if (pendingPhotos.length > 0 && uploadFailed) {
      void uploadPendingPhotos();
      return;
    }
    setActionError(null);
    refreshInventoryItems(queryClient);
  }

  return (
    <section className="space-y-5 border-t pt-4" aria-label="Administrar fotos">
      <div>
        <h3 className="text-sm font-semibold">Fotos</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          JPEG, PNG o WebP. Máximo 5 MB por foto.
        </p>
      </div>

      <div
        className={cn(
          "rounded-xl border-2 border-dashed p-4 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-border",
          remainingSlots === 0 && "bg-muted/40",
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!mutationPending && remainingSlots > 0) setDragActive(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          if (!mutationPending && remainingSlots > 0) selectFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">
              {remainingSlots} de {MAX_ITEM_PHOTOS} espacios disponibles
            </p>
            <p className="text-xs text-muted-foreground">También puedes arrastrar fotos aquí.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => inputRef.current?.click()}
            disabled={mutationPending || remainingSlots === 0}
          >
            <Upload />
            Agregar fotos
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => selectFiles(Array.from(event.target.files ?? []))}
            disabled={mutationPending || remainingSlots === 0}
            aria-label="Seleccionar fotos de la prenda"
          />
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
          <ul className="list-disc space-y-1 pl-5">
            {validationErrors.map((message, index) => <li key={`${message}-${index}`}>{message}</li>)}
          </ul>
        </div>
      )}

      {pendingPhotos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Listas para subir</p>
            <Button
              type="button"
              onClick={() => void uploadPendingPhotos()}
              disabled={mutationPending}
              className="min-h-11"
            >
              {uploadMutation.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
              {uploadMutation.isPending
                ? `Subiendo... ${uploadMutation.uploadProgress}%`
                : `Subir ${pendingPhotos.length}`}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {pendingPhotos.map(({ file, previewUrl }, index) => (
              <div key={`${file.name}-${file.lastModified}-${index}`} className="relative overflow-hidden rounded-lg border bg-muted">
                <img src={previewUrl} alt={`Vista previa de ${file.name}`} className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white"
                  onClick={() => removePendingPhoto(index)}
                  disabled={mutationPending}
                  aria-label={`Quitar ${file.name} de la selección`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {mutationPending && (
        <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm" role="status">
          <Loader2 className="h-4 w-4 animate-spin" />
          Guardando cambios de fotos...
        </div>
      )}

      {visibleError && (
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between" role="alert">
          <span>{visibleError}</span>
          <Button type="button" variant="outline" className="min-h-11" onClick={retry} disabled={mutationPending}>
            <RefreshCw />
            Reintentar
          </Button>
        </div>
      )}

      {orderedPhotos.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          <ImageOff className="mx-auto mb-2 h-8 w-8" />
          Sin fotos
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {orderedPhotos.map((photo, index) => (
            <div key={photo.id} className="overflow-hidden rounded-xl border bg-card">
              <ManagedPhoto photo={photo} position={index + 1} />
              <div className="grid grid-cols-2 gap-1 p-2">
                <Button
                  type="button"
                  size="sm"
                  variant={photo.isMain ? "secondary" : "outline"}
                  className="col-span-2 min-h-11 whitespace-normal"
                  onClick={() => void setMainPhoto(photo.id)}
                  disabled={photo.isMain || mutationPending}
                  aria-label={photo.isMain ? "Esta es la foto principal" : `Hacer principal la foto ${index + 1}`}
                >
                  <Star className={photo.isMain ? "fill-current" : ""} />
                  {photo.isMain ? "Principal" : "Hacer principal"}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-11 w-full"
                  onClick={() => void movePhoto(index, -1)}
                  disabled={index === 0 || mutationPending}
                  aria-label={`Mover arriba la foto ${index + 1}`}
                >
                  <ArrowUp />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-11 w-full"
                  onClick={() => void movePhoto(index, 1)}
                  disabled={index === orderedPhotos.length - 1 || mutationPending}
                  aria-label={`Mover abajo la foto ${index + 1}`}
                >
                  <ArrowDown />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="col-span-2 min-h-11"
                  onClick={() => setPhotoToDelete(photo)}
                  disabled={orderedPhotos.length === 1 || mutationPending}
                  aria-label={`Eliminar la foto ${index + 1}`}
                >
                  <Trash2 />
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={Boolean(photoToDelete)} onOpenChange={(open) => { if (!open) setPhotoToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar foto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro? Esta acción no se puede deshacer.
              {photoToDelete?.isMain && " La siguiente foto se convertirá en principal."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void deletePhoto()} disabled={deleteMutation.isPending}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function ManagedPhoto({ photo, position }: { photo: ItemPhoto; position: number }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative aspect-square overflow-hidden bg-muted">
      {failed ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
          <ImageOff className="h-7 w-7" />
          Error al cargar
        </div>
      ) : (
        <img
          src={itemPhotoContentUrl(photo.id)}
          alt={`Foto ${position} de la prenda`}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
      <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2 py-1 text-xs font-semibold text-white">
        {position}
      </span>
      {photo.isMain && (
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-1 text-xs font-semibold text-amber-950">
          <Star className="h-3 w-3 fill-current" />
          Principal
        </span>
      )}
    </div>
  );
}
