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
import type { PhotoUploadResponse } from "../types/item";

interface OptimisticContext {
  snapshots: InventoryQuerySnapshot[];
}

export function useItemPhotoSetMain(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation<PhotoUploadResponse, Error, string, OptimisticContext>({
    mutationKey: ["inventory", "item-photos", itemId, "main"],
    mutationFn: (photoId) =>
      api.put<PhotoUploadResponse>(
        `inventory/items/${itemId}/photos/${photoId}/main`,
        {},
      ),
    onMutate: async (photoId) => {
      const snapshots = await prepareInventoryOptimisticUpdate(queryClient);
      transformInventoryItemPhotos(queryClient, itemId, (photos) =>
        photos.map((photo) => ({ ...photo, isMain: photo.id === photoId })),
      );
      return { snapshots };
    },
    onError: (_error, _photoId, context) => {
      if (context) restoreInventoryQueries(queryClient, context.snapshots);
      refreshInventoryItems(queryClient);
    },
    onSuccess: (response) => {
      updateInventoryItemPhotos(queryClient, itemId, response.photos);
      refreshInventoryItems(queryClient);
    },
  });
}
