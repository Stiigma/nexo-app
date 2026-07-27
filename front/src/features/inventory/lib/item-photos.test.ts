// Created by: OpenCode (AI-assisted), 2026-07-26

import { describe, expect, it } from "vitest";
import {
  adjacentIndex,
  clampIndex,
  getMainPhoto,
  getMainPhotoIndex,
  mapToPhotoUrls,
  sortPhotos,
} from "./item-photos";
import type { ItemPhoto } from "../types/item";

function photo(id: string, displayOrder: number, isMain = false): ItemPhoto {
  return {
    id,
    itemId: "item-1",
    isMain,
    displayOrder,
    createdAt: `2026-07-26T00:00:0${displayOrder}.000Z`,
  };
}

describe("item photo gallery helpers", () => {
  it("sorts without mutating and resolves the canonical main", () => {
    const photos = [photo("second", 1, true), photo("first", 0)];

    expect(sortPhotos(photos).map(({ id }) => id)).toEqual(["first", "second"]);
    expect(photos.map(({ id }) => id)).toEqual(["second", "first"]);
    expect(getMainPhoto(photos)?.id).toBe("second");
    expect(getMainPhotoIndex(photos)).toBe(1);
  });

  it("falls back to the first ordered photo when no main is marked", () => {
    const photos = [photo("second", 1), photo("first", 0)];

    expect(getMainPhoto(photos)?.id).toBe("first");
    expect(getMainPhotoIndex(photos)).toBe(0);
  });

  it("clamps direct and adjacent navigation at gallery boundaries", () => {
    expect(clampIndex(-3, 3)).toBe(0);
    expect(clampIndex(8, 3)).toBe(2);
    expect(clampIndex(2, 0)).toBe(0);
    expect(adjacentIndex(0, 3, "prev")).toBe(0);
    expect(adjacentIndex(2, 3, "next")).toBe(2);
    expect(adjacentIndex(1, 3, "next")).toBe(2);
  });

  it("maps only stable protected photo IDs to browser URLs", () => {
    const urls = mapToPhotoUrls([photo("photo/b", 1), photo("photo-a", 0)]);

    expect(urls.map(({ id, alt }) => ({ id, alt }))).toEqual([
      { id: "photo-a", alt: "Foto 1 de la prenda" },
      { id: "photo/b", alt: "Foto 2 de la prenda" },
    ]);
    expect(urls[0].src).toMatch(/\/api\/v1\/media\/photos\/photo-a\/content$/);
    expect(urls[1].src).toMatch(/\/api\/v1\/media\/photos\/photo%2Fb\/content$/);
  });
});
