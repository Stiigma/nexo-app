// Created by: OpenCode (AI-assisted), 2026-07-26

import { describe, expect, it } from "vitest";
import { MAX_ITEM_PHOTO_BYTES, validatePhotoFiles } from "./item-photo-files";

const file = (name: string, type: string, size = 100) => ({ name, type, size });

describe("item photo file validation", () => {
  it("accepts supported files up to the remaining slots", () => {
    const result = validatePhotoFiles([
      file("a.jpg", "image/jpeg"),
      file("b.webp", "image/webp"),
    ], 2);

    expect(result.accepted).toHaveLength(2);
    expect(result.errors).toEqual([]);
  });

  it("reports invalid formats, oversize files, and slot overflow", () => {
    const result = validatePhotoFiles([
      file("bad.gif", "image/gif"),
      file("large.png", "image/png", MAX_ITEM_PHOTO_BYTES + 1),
      file("first.jpg", "image/jpeg"),
      file("second.png", "image/png"),
    ], 1);

    expect(result.accepted.map(({ name }) => name)).toEqual(["first.jpg"]);
    expect(result.errors).toHaveLength(3);
  });
});
