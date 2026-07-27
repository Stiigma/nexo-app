// Created by: OpenCode (AI-assisted), 2026-07-26

import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { PaginatedResponse } from "@/common/types/api";
import { sortPhotos } from "./item-photos";
import type { ItemDto, ItemPhoto } from "../types/item";

const INVENTORY_ITEMS_QUERY_KEY = ["inventory", "items"] as const;

export type InventoryQuerySnapshot = [
  queryKey: QueryKey,
  value: PaginatedResponse<ItemDto> | undefined,
];

export function mergeItemPhotosIntoPage(
  page: PaginatedResponse<ItemDto>,
  itemId: string,
  photos: ItemPhoto[],
): PaginatedResponse<ItemDto> {
  return {
    ...page,
    data: page.data.map((item) =>
      item.id === itemId ? { ...item, photos: sortPhotos(photos) } : item,
    ),
  };
}

export function updateInventoryItemPhotos(
  queryClient: QueryClient,
  itemId: string,
  photos: ItemPhoto[],
): void {
  queryClient.setQueriesData<PaginatedResponse<ItemDto>>(
    { queryKey: INVENTORY_ITEMS_QUERY_KEY },
    (page) => page ? mergeItemPhotosIntoPage(page, itemId, photos) : page,
  );
}

export function transformInventoryItemPhotos(
  queryClient: QueryClient,
  itemId: string,
  transform: (photos: ItemPhoto[]) => ItemPhoto[],
): void {
  queryClient.setQueriesData<PaginatedResponse<ItemDto>>(
    { queryKey: INVENTORY_ITEMS_QUERY_KEY },
    (page) => {
      if (!page) return page;
      const currentItem = page.data.find((item) => item.id === itemId);
      return currentItem
        ? mergeItemPhotosIntoPage(page, itemId, transform(currentItem.photos))
        : page;
    },
  );
}

export function snapshotInventoryQueries(queryClient: QueryClient): InventoryQuerySnapshot[] {
  return queryClient.getQueriesData<PaginatedResponse<ItemDto>>({
    queryKey: INVENTORY_ITEMS_QUERY_KEY,
  });
}

export function restoreInventoryQueries(
  queryClient: QueryClient,
  snapshots: InventoryQuerySnapshot[],
): void {
  snapshots.forEach(([queryKey, value]) => queryClient.setQueryData(queryKey, value));
}

export function findInventoryItem(queryClient: QueryClient, itemId: string | null): ItemDto | null {
  if (!itemId) return null;
  for (const [, page] of snapshotInventoryQueries(queryClient)) {
    const item = page?.data.find((candidate) => candidate.id === itemId);
    if (item) return item;
  }
  return null;
}

export async function prepareInventoryOptimisticUpdate(
  queryClient: QueryClient,
): Promise<InventoryQuerySnapshot[]> {
  await queryClient.cancelQueries({ queryKey: INVENTORY_ITEMS_QUERY_KEY });
  return snapshotInventoryQueries(queryClient);
}

export function refreshInventoryItems(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: INVENTORY_ITEMS_QUERY_KEY });
}
