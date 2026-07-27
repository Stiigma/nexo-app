// Created by: OpenCode (AI-assisted), 2026-07-26

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/common/services/api-client";
import {
  prepareInventoryOptimisticUpdate,
  refreshInventoryItems,
  restoreInventoryQueries,
  transformInventoryItemPhotos,
  updateInventoryItemPhotos,
  type InventoryQuerySnapshot,
} from "../lib/item-photo-cache";
import type { ItemPhoto, PhotoUploadResponse } from "../types/item";

interface OptimisticContext {
  snapshots: InventoryQuerySnapshot[];
}

function reorderPhotos(photos: ItemPhoto[], photoIds: string[]): ItemPhoto[] {
  const byId = new Map(photos.map((photo) => [photo.id, photo]));
  if (photoIds.length !== photos.length || photoIds.some((id) => !byId.has(id))) {
    return photos;
  }
  return photoIds.map((id, displayOrder) => ({ ...byId.get(id)!, displayOrder }));
}

export function useItemPhotoReorder(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation<PhotoUploadResponse, Error, string[], OptimisticContext>({
    mutationKey: ["inventory", "item-photos", itemId, "reorder"],
    mutationFn: (photoIds) =>
      api.put<PhotoUploadResponse>(`inventory/items/${itemId}/photos/reorder`, { photoIds }),
    onMutate: async (photoIds) => {
      const snapshots = await prepareInventoryOptimisticUpdate(queryClient);
      transformInventoryItemPhotos(
        queryClient,
        itemId,
        (photos) => reorderPhotos(photos, photoIds),
      );
      return { snapshots };
    },
    onError: (_error, _photoIds, context) => {
      if (context) restoreInventoryQueries(queryClient, context.snapshots);
      refreshInventoryItems(queryClient);
    },
    onSuccess: (response) => {
      updateInventoryItemPhotos(queryClient, itemId, response.photos);
      refreshInventoryItems(queryClient);
    },
  });
}
