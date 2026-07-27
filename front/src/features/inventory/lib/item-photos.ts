// Created by: OpenCode (AI-assisted), 2026-07-26

import { itemPhotoContentUrl } from "./item-photo-content-url";
import type { ItemPhoto } from "../types/item";

export interface PhotoUrl {
  id: string;
  src: string;
  alt: string;
}

export function sortPhotos(photos: ItemPhoto[]): ItemPhoto[] {
  return [...photos].sort((left, right) =>
    left.displayOrder - right.displayOrder
      || left.createdAt.localeCompare(right.createdAt)
      || left.id.localeCompare(right.id),
  );
}

export function getMainPhoto(photos: ItemPhoto[]): ItemPhoto | undefined {
  const orderedPhotos = sortPhotos(photos);
  return orderedPhotos.find((photo) => photo.isMain) ?? orderedPhotos[0];
}

export function getMainPhotoIndex(photos: ItemPhoto[]): number {
  if (photos.length === 0) return 0;
  const orderedPhotos = sortPhotos(photos);
  const index = orderedPhotos.findIndex((photo) => photo.isMain);
  return index >= 0 ? index : 0;
}

export function mapToPhotoUrls(photos: ItemPhoto[]): PhotoUrl[] {
  return sortPhotos(photos).map((photo, index) => ({
    id: photo.id,
    src: itemPhotoContentUrl(photo.id),
    alt: `Foto ${index + 1} de la prenda`,
  }));
}

export function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), length - 1);
}

export function adjacentIndex(
  current: number,
  length: number,
  direction: "prev" | "next",
): number {
  return clampIndex(current + (direction === "prev" ? -1 : 1), length);
}
