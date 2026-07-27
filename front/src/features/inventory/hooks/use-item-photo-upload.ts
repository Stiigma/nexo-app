// Created by: OpenCode (AI-assisted), 2026-07-26

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/common/services/api-client";
import { refreshInventoryItems, updateInventoryItemPhotos } from "../lib/item-photo-cache";
import type { PhotoUploadResponse } from "../types/item";

export function useItemPhotoUpload(itemId: string) {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const mutation = useMutation({
    mutationKey: ["inventory", "item-photos", itemId, "upload"],
    mutationFn: (formData: FormData) =>
      api.uploadMultipart<PhotoUploadResponse>(
        `inventory/items/${itemId}/photos`,
        formData,
        setUploadProgress,
      ),
    onMutate: () => setUploadProgress(0),
    onSuccess: (response) => {
      setUploadProgress(100);
      updateInventoryItemPhotos(queryClient, itemId, response.photos);
      refreshInventoryItems(queryClient);
    },
    onError: () => refreshInventoryItems(queryClient),
  });

  return { ...mutation, uploadProgress };
}
