import { useState } from "react";
import { motion } from "framer-motion";
import { X, ImageIcon, Pencil } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { PhotoLightbox } from "./PhotoLightbox";
import { FinancialBreakdown } from "./FinancialBreakdown";
import { cn } from "@/common/lib/utils";
import { itemPhotoContentUrl } from "../lib/item-photo-content-url";
import type { ItemDto } from "../types/item";

interface ItemDetailModalProps {
  item: ItemDto;
  open: boolean;
  onClose: () => void;
  onEdit: (item: ItemDto) => void;
  canViewFinancials: boolean;
}

export function ItemDetailModal({ item, open, onClose, onEdit, canViewFinancials }: ItemDetailModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);

  const mainPhoto = item.photos?.find((p) => p.isMain) ?? item.photos?.[0];
  const photoUrl = mainPhoto ? itemPhotoContentUrl(mainPhoto.id) : null;

  const brandName = item.brand?.name ?? "";
  const categoryName = item.category?.name ?? "";
  const conditionName = item.condition?.name ?? "";
  const sizeName = item.size?.name ?? "";
  const colorName = item.color?.name ?? "";
  const productName =
    item.productName ?? `${brandName} ${categoryName}`.trim();

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
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-foreground shadow backdrop-blur transition-colors hover:bg-white"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          {photoUrl && !imageError ? (
            <>
              <img
                src={photoUrl}
                alt={productName}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
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
              {/* Botón para ver foto completa */}
              <button
                type="button"
                onClick={() => setShowPhoto(true)}
                className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5 text-sm font-medium text-white shadow backdrop-blur transition-colors hover:bg-black/80"
              >
                <ImageIcon size={16} />
                Ver foto completa
              </button>
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <span className="text-6xl text-muted-foreground/30">
                {categoryName.charAt(0) || "?"}
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 pr-10">
            <StatusBadge status={item.status} />
            <button
              type="button"
              onClick={() => onEdit(item)}
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

      {showPhoto && photoUrl && (
        <PhotoLightbox
          src={photoUrl}
          alt={productName}
          onClose={() => setShowPhoto(false)}
        />
      )}
    </motion.div>
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
