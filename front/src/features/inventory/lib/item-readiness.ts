import type { ItemDto } from "../types/item";

export interface ItemReadinessIssue {
  field: string;
  label: string;
}

export function getItemReadinessIssues(item: ItemDto): ItemReadinessIssue[] {
  const mainPhoto = item.photos.find((photo) => photo.isMain) ?? item.photos[0];
  const hasPublicPrice = Number(item.targetPriceMxn) > 0;

  return [
    !mainPhoto && { field: "photo", label: "Foto principal" },
    !item.brandId && { field: "brand", label: "Marca" },
    !item.categoryId && { field: "category", label: "Categoría" },
    !item.conditionId && { field: "condition", label: "Condición" },
    !item.sizeId && { field: "size", label: "Talla" },
    !item.colorId && { field: "color", label: "Color" },
    !item.physicalLocation?.trim() && { field: "location", label: "Ubicación física" },
    !hasPublicPrice && { field: "price", label: "Precio público" },
  ].filter(Boolean) as ItemReadinessIssue[];
}
