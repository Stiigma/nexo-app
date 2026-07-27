// Created by: OpenCode (AI-assisted), 2026-07-26

import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import {
  mergeItemPhotosIntoPage,
  restoreInventoryQueries,
  snapshotInventoryQueries,
  transformInventoryItemPhotos,
} from "./item-photo-cache";
import type { PaginatedResponse } from "@/common/types/api";
import type { ItemDto, ItemPhoto } from "../types/item";

function itemFixture(id: string, photos: ItemPhoto[] = []): ItemDto {
  return {
    id,
    internalCode: `NEXO-${id}`,
    productName: "Prenda",
    brandId: "brand-1",
    categoryId: "category-1",
    conditionId: "condition-1",
    sizeId: null,
    colorId: null,
    purchaseId: null,
    status: "AVAILABLE",
    physicalLocation: null,
    photos,
    targetPriceMxn: 500,
    notes: null,
    createdAt: "2026-07-26T00:00:00.000Z",
    updatedAt: "2026-07-26T00:00:00.000Z",
  };
}

describe("inventory photo cache merge", () => {
  it("replaces only the matching item's photos and preserves redacted fields", () => {
    const originalItem = itemFixture("item-1");
    const otherItem = itemFixture("item-2");
    const page: PaginatedResponse<ItemDto> = {
      data: [originalItem, otherItem],
      meta: {
        total: 2,
        page: 1,
        limit: 12,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    };
    const photos = [
      {
        id: "photo-2",
        itemId: "item-1",
        isMain: false,
        displayOrder: 1,
        createdAt: "2026-07-26T00:00:01.000Z",
      },
      {
        id: "photo-1",
        itemId: "item-1",
        isMain: true,
        displayOrder: 0,
        createdAt: "2026-07-26T00:00:00.000Z",
      },
    ] satisfies ItemPhoto[];

    const nextPage = mergeItemPhotosIntoPage(page, "item-1", photos);

    expect(nextPage.data[0]).toMatchObject({
      id: "item-1",
      targetPriceMxn: 500,
      photos: [{ id: "photo-1" }, { id: "photo-2" }],
    });
    expect(nextPage.data[1]).toBe(otherItem);
    expect(page.data[0].photos).toEqual([]);
  });

  it("snapshots and restores every paginated cache touched by an optimistic update", () => {
    const queryClient = new QueryClient();
    const item = itemFixture(
      "item-1",
      [
        {
          id: "photo-1",
          itemId: "item-1",
          isMain: true,
          displayOrder: 0,
          createdAt: "2026-07-26T00:00:00.000Z",
        },
        {
          id: "photo-2",
          itemId: "item-1",
          isMain: false,
          displayOrder: 1,
          createdAt: "2026-07-26T00:00:01.000Z",
        },
      ],
    );
    const page = {
      data: [item],
      meta: {
        total: 1,
        page: 1,
        limit: 12,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    } satisfies PaginatedResponse<ItemDto>;
    queryClient.setQueryData(["inventory", "items", { page: 1 }], page);
    queryClient.setQueryData(["inventory", "items", { page: 2 }], page);
    const snapshots = snapshotInventoryQueries(queryClient);

    transformInventoryItemPhotos(queryClient, "item-1", (photos) =>
      photos.map((photo) => ({ ...photo, isMain: photo.id === "photo-2" })),
    );
    expect(snapshotInventoryQueries(queryClient)).toHaveLength(2);
    expect(snapshotInventoryQueries(queryClient)[0][1]?.data[0].photos[1].isMain).toBe(true);

    restoreInventoryQueries(queryClient, snapshots);
    expect(snapshotInventoryQueries(queryClient)[0][1]?.data[0].photos[0].isMain).toBe(true);
    expect(snapshotInventoryQueries(queryClient)[1][1]?.data[0].photos[1].isMain).toBe(false);
  });
});
