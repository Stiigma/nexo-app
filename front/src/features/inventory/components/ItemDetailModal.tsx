import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, ImageIcon, ImageOff, Pencil, Star } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { PhotoLightbox } from "./PhotoLightbox";
import { FinancialBreakdown } from "./FinancialBreakdown";
import { cn } from "@/common/lib/utils";
import { getMainPhotoIndex, mapToPhotoUrls, sortPhotos } from "../lib/item-photos";
import type { ItemDto } from "../types/item";

interface ItemDetailModalProps {
  item: ItemDto;
  open: boolean;
  onClose: () => void;
  onEdit: (itemId: string) => void;
  canViewFinancials: boolean;
}

export function ItemDetailModal({ item, open, onClose, onEdit, canViewFinancials }: ItemDetailModalProps) {
  const orderedPhotos = useMemo(() => sortPhotos(item.photos), [item.photos]);
  const mainPhotoIndex = getMainPhotoIndex(orderedPhotos);
  const galleryVersion = `${item.id}:${orderedPhotos.map(({ id, isMain }) => `${id}:${isMain}`).join("|")}`;
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(mainPhotoIndex);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);

  const brandName = item.brand?.name ?? "";
  const categoryName = item.category?.name ?? "";
  const conditionName = item.condition?.name ?? "";
  const sizeName = item.size?.name ?? "";
  const colorName = item.color?.name ?? "";
  const productName =
    item.productName ?? `${brandName} ${categoryName}`.trim();
  const photoUrls = useMemo(
    () => mapToPhotoUrls(orderedPhotos).map((photo, index) => ({
      ...photo,
      alt: `${productName}, foto ${index + 1}`,
    })),
    [orderedPhotos, productName],
  );
  const selectedPhoto = orderedPhotos[selectedPhotoIndex];
  const photoUrl = photoUrls[selectedPhotoIndex]?.src ?? null;

  useEffect(() => {
    setSelectedPhotoIndex(mainPhotoIndex);
  }, [galleryVersion, mainPhotoIndex]);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [selectedPhoto?.id]);

  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle: ${productName}`}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-card shadow-2xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring" as const, stiffness: 300, damping: 24 }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-foreground shadow backdrop-blur transition-colors hover:bg-white"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          {photoUrl && !imageError ? (
            <button
              type="button"
              onClick={() => setShowPhoto(true)}
              className="group block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              aria-label={`Abrir foto ${selectedPhotoIndex + 1} en pantalla completa`}
            >
              <img
                src={photoUrl}
                alt={photoUrls[selectedPhotoIndex].alt}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageLoaded(false);
                  setImageError(true);
                }}
                className={cn(
                  "h-full w-full object-cover transition-opacity duration-500",
                  imageLoaded ? "opacity-100" : "opacity-0",
                )}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
              <span className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5 text-sm font-medium text-white shadow backdrop-blur transition-colors group-hover:bg-black/80">
                <ImageIcon size={16} />
                Ver foto completa
              </span>
            </button>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              {imageError ? (
                <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                  <ImageOff className="h-10 w-10" />
                  Error al cargar
                </span>
              ) : (
                <span className="text-6xl text-muted-foreground/30">
                  {categoryName.charAt(0) || "?"}
                </span>
              )}
            </div>
          )}
        </div>

        {orderedPhotos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-b border-border bg-muted/20 px-4 py-3" aria-label="Miniaturas de fotos">
            {orderedPhotos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedPhotoIndex(index)}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  index === selectedPhotoIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
                )}
                aria-label={`Mostrar foto ${index + 1}`}
                aria-current={index === selectedPhotoIndex ? "true" : undefined}
              >
                <DetailThumbnail src={photoUrls[index].src} alt="" />
                {photo.isMain && (
                  <span className="absolute right-0.5 top-0.5 rounded-full bg-amber-400 p-1 text-amber-950" aria-label="Foto principal">
                    <Star className="h-3 w-3 fill-current" />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 pr-10">
            <StatusBadge status={item.status} />
            <button
              type="button"
              onClick={() => onEdit(item.id)}
              className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              <Pencil size={16} />
              Editar prenda
            </button>
          </div>

          <h2 className="mb-1 text-2xl font-bold text-foreground">
            {productName}
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            {item.internalCode}
          </p>

          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <MetadataItem label="Marca" value={brandName} />
            <MetadataItem label="Categoría" value={categoryName} />
            <MetadataItem
              label="Condición"
              value={conditionName}
            />
            {sizeName && (
              <MetadataItem label="Talla" value={sizeName} />
            )}
            {colorName && (
              <MetadataItem label="Color" value={colorName} />
            )}
            {item.purchase?.store?.name && (
              <MetadataItem
                label="Tienda"
                value={item.purchase.store.name}
              />
            )}
            {item.physicalLocation && (
              <MetadataItem
                label="Ubicación"
                value={item.physicalLocation}
              />
            )}
          </div>

          {canViewFinancials ? (
            <div className="mb-6">
              <FinancialBreakdown item={item} />
            </div>
          ) : item.targetPriceMxn !== null && (
            <div className="mb-6 rounded-xl border border-border bg-card p-4">
              <h3 className="mb-1 text-sm font-semibold text-foreground">Precio público</h3>
              <p className="text-lg font-bold text-[#c9a84c]">
                ${Number(item.targetPriceMxn).toLocaleString("en-US", { minimumFractionDigits: 2 })} MXN
              </p>
            </div>
          )}

          {item.notes && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Notas
              </h3>
              <p className="text-sm text-muted-foreground">{item.notes}</p>
            </div>
          )}
        </div>
      </motion.div>

      {showPhoto && photoUrls.length > 0 && (
        <PhotoLightbox
          photos={photoUrls}
          initialIndex={selectedPhotoIndex}
          onClose={() => setShowPhoto(false)}
        />
      )}
    </motion.div>
  );
}

function DetailThumbnail({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  return failed ? (
    <span className="flex h-full w-full items-center justify-center text-muted-foreground">
      <ImageOff className="h-5 w-5" />
    </span>
  ) : (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function MetadataItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
