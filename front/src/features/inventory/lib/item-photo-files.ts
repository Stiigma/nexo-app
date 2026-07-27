// Created by: OpenCode (AI-assisted), 2026-07-26

export const MAX_ITEM_PHOTOS = 5;
export const MAX_ITEM_PHOTO_BYTES = 5 * 1024 * 1024;
export const ITEM_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

interface PhotoFileLike {
  name: string;
  size: number;
  type: string;
}

export interface PhotoFileValidation<TFile extends PhotoFileLike> {
  accepted: TFile[];
  errors: string[];
}

export function validatePhotoFiles<TFile extends PhotoFileLike>(
  files: TFile[],
  remainingSlots: number,
): PhotoFileValidation<TFile> {
  const errors: string[] = [];
  const validFiles = files.filter((file) => {
    if (!ITEM_PHOTO_TYPES.includes(file.type as (typeof ITEM_PHOTO_TYPES)[number])) {
      errors.push(`${file.name}: usa una imagen JPEG, PNG o WebP.`);
      return false;
    }
    if (file.size > MAX_ITEM_PHOTO_BYTES) {
      errors.push(`${file.name}: supera el límite de 5 MB.`);
      return false;
    }
    return true;
  });

  const slotCount = Math.max(0, remainingSlots);
  if (validFiles.length > slotCount) {
    errors.push(`Solo hay ${slotCount} ${slotCount === 1 ? "espacio disponible" : "espacios disponibles"}.`);
  }

  return { accepted: validFiles.slice(0, slotCount), errors };
}
