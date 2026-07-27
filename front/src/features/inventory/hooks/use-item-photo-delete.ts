// Created by: OpenCode (AI-assisted), 2026-07-26

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/common/services/api-client";
import { refreshInventoryItems, updateInventoryItemPhotos } from "../lib/item-photo-cache";
import type { CleanupStatus, PhotoUploadResponse } from "../types/item";

interface PhotoDeleteApiResponse extends PhotoUploadResponse {
  cleanupStatus?: "COMPLETED" | "PENDING";
}

export interface PhotoDeleteResponse extends PhotoUploadResponse {
  cleanupStatus: CleanupStatus;
}

export function useItemPhotoDelete(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["inventory", "item-photos", itemId, "delete"],
    mutationFn: async (photoId: string): Promise<PhotoDeleteResponse> => {
      const response = await api.delete<PhotoDeleteApiResponse>(
        `inventory/items/${itemId}/photos/${photoId}`,
      );
      return {
        photos: response.photos,
        cleanupStatus: response.cleanupStatus === "PENDING" ? "pending" : "completed",
      };
    },
    onSuccess: (response) => {
      updateInventoryItemPhotos(queryClient, itemId, response.photos);
      refreshInventoryItems(queryClient);
    },
    onError: () => refreshInventoryItems(queryClient),
  });
}
