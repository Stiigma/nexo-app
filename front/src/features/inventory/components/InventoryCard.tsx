import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye, ImageIcon } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { cn } from "@/common/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { PhotoLightbox } from "./PhotoLightbox";
import { getMainPhotoIndex, mapToPhotoUrls, sortPhotos } from "../lib/item-photos";
import type { ItemDto } from "../types/item";

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

interface InventoryCardProps {
  item: ItemDto;
  onViewDetail: (id: string) => void;
  canViewFinancials: boolean;
}

export function InventoryCard({ item, onViewDetail, canViewFinancials }: InventoryCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);

  const brandName = item.brand?.name ?? "";
  const categoryName = item.category?.name ?? "";
  const sizeName = item.size?.name ?? "";
  const conditionName = item.condition?.name ?? "";
  const colorName = item.color?.name ?? "";
  const productName = item.productName ?? `${brandName} ${categoryName}`.trim();
  const orderedPhotos = useMemo(() => sortPhotos(item.photos), [item.photos]);
  const mainPhotoIndex = getMainPhotoIndex(orderedPhotos);
  const photoUrls = useMemo(
    () => mapToPhotoUrls(orderedPhotos).map((photo, index) => ({
      ...photo,
      alt: `${productName}, foto ${index + 1}`,
    })),
    [orderedPhotos, productName],
  );
  const mainPhoto = orderedPhotos[mainPhotoIndex];
  const photoUrl = photoUrls[mainPhotoIndex]?.src ?? null;

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [mainPhoto?.id]);

  const toPositiveMoney = (value: number | null | undefined) => {
    if (value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const costAmount = toPositiveMoney(item.costAmount);
  const targetPrice = toPositiveMoney(item.targetPriceMxn);
  const margin =
    targetPrice !== null && costAmount !== null && costAmount > 0
      ? Math.round((targetPrice / costAmount) * 10) / 10
      : null;

  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg",
        item.status === "PRICE_PENDING" && "border-2 border-red-400",
      )}
      role="article"
      aria-label={productName}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {photoUrl && !imageError ? (
          <>
            <button
              type="button"
              onClick={() => setShowPhoto(true)}
              className="block h-full w-full cursor-pointer"
              aria-label="Ver foto completa"
            >
              <img
                src={photoUrl}
                alt={`${brandName} ${categoryName} - ${colorName}`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageLoaded(false);
                  setImageError(true);
                }}
                className={cn(
                  "h-full w-full object-cover transition-all duration-500 group-hover:scale-105",
                  imageLoaded ? "opacity-100" : "opacity-0",
                )}
              />
            </button>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <span className="text-4xl text-muted-foreground/40">
              {categoryName.charAt(0) || "?"}
            </span>
          </div>
        )}

        {orderedPhotos.length > 1 && (
          <span
            className="pointer-events-none absolute bottom-2 right-2 z-10 rounded-full bg-black/65 px-2 py-1 text-xs font-semibold text-white backdrop-blur"
            aria-label={`${orderedPhotos.length} fotos`}
          >
            📷 {orderedPhotos.length}
          </span>
        )}

        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onViewDetail(item.id)}
            className="inline-flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-foreground shadow transition-colors hover:bg-white"
          >
            <Eye size={16} />
            Ver detalle
          </button>
          {photoUrl && (
            <button
              type="button"
              onClick={() => setShowPhoto(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-foreground shadow transition-colors hover:bg-white"
            >
              <ImageIcon size={16} />
              Ver foto
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-1">
          <StatusBadge status={item.status} />
        </div>

        <h3 className="mb-1 line-clamp-1 text-base font-semibold text-foreground">
          {productName}
        </h3>

        <p className="mb-2 text-xs text-muted-foreground">
          {item.internalCode}
        </p>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {brandName && (
            <Badge variant="outline" className="text-xs">
              {brandName}
            </Badge>
          )}
          {categoryName && (
            <Badge variant="outline" className="text-xs">
              {categoryName}
            </Badge>
          )}
          {sizeName && (
            <Badge variant="secondary" className="text-xs">
              {sizeName}
            </Badge>
          )}
          {colorName && (
            <Badge variant="secondary" className="text-xs">
              {colorName}
            </Badge>
          )}
          {conditionName && (
            <Badge variant="secondary" className="text-xs">
              {conditionName}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {canViewFinancials && (
            <>
              <p className={cn(
                "font-semibold",
                costAmount === null ? "text-red-700" : "text-foreground",
              )}>
                {costAmount === null
                  ? "Costo pendiente"
                  : `$${costAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
              </p>
              <span className="text-xs text-muted-foreground">→</span>
            </>
          )}
          <p className={cn(
            "font-semibold",
            targetPrice === null ? "text-red-700" : "text-[#c9a84c]",
          )}>
            {targetPrice === null
              ? "Precio pendiente"
              : `$${targetPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </p>
          {canViewFinancials && margin !== null && (
            <span className="text-xs text-muted-foreground">({margin}x)</span>
          )}
        </div>
      </div>

      {showPhoto && photoUrls.length > 0 && (
        <PhotoLightbox
          photos={photoUrls}
          initialIndex={mainPhotoIndex}
          onClose={() => setShowPhoto(false)}
        />
      )}
    </motion.div>
  );
}
