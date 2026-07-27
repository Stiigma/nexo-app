import { useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";

interface PendingPhoto {
  file: File;
  previewUrl: string;
}

interface CameraCaptureProps {
  pendingPhotos: PendingPhoto[];
  onPhotosSelected: (files: File[]) => void;
  onRemovePhoto: (index: number) => void;
  disabled?: boolean;
  remainingSlots: number;
}

export function CameraCapture({
  pendingPhotos,
  onPhotosSelected,
  onRemovePhoto,
  disabled = false,
  remainingSlots,
}: CameraCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    onPhotosSelected(Array.from(files));
  }

  const noSlots = remainingSlots <= 0 || pendingPhotos.length >= 5;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 flex-1"
          onClick={() => cameraRef.current?.click()}
          disabled={disabled || noSlots}
        >
          <Camera className="h-4 w-4" />
          Cámara
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 flex-1"
          onClick={() => galleryRef.current?.click()}
          disabled={disabled || noSlots}
        >
          <ImagePlus className="h-4 w-4" />
          Galería
        </Button>

        {/* Camera input — uses capture for mobile */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
          disabled={disabled || noSlots}
          aria-label="Tomar foto con la cámara"
        />

        {/* Gallery input — no capture attribute, opens file picker */}
        <input
          ref={galleryRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
          disabled={disabled || noSlots}
          aria-label="Seleccionar fotos de la galería"
        />
      </div>

      {pendingPhotos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {pendingPhotos.map(({ file, previewUrl }, index) => (
            <div
              key={`${file.name}-${file.lastModified}-${index}`}
              className="relative overflow-hidden rounded-lg border bg-muted"
            >
              <img
                src={previewUrl}
                alt={`Vista previa ${index + 1}`}
                className="aspect-square w-full object-cover"
              />
              <button
                type="button"
                className={cn(
                  "absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white",
                  "hover:bg-black/90",
                )}
                onClick={() => onRemovePhoto(index)}
                disabled={disabled}
                aria-label={`Quitar foto ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </button>
              <span className="absolute bottom-2 left-2 rounded-full bg-black/75 px-2 py-1 text-xs font-semibold text-white">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {pendingPhotos.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Toma una foto desde la cámara o selecciona de la galería. Máximo 5 fotos.
        </p>
      )}
    </div>
  );
}
