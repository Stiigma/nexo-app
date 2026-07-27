import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/common/services/api-client";
import type { ItemDto } from "../types/item";
import type { ItemEditorPayload } from "./use-item-editor-update";

export interface CreateItemPayload extends ItemEditorPayload {
  internalCode: string;
  conditionId: string;
}

export interface CreateItemResult {
  item: ItemDto;
}

async function uploadPhotos(itemId: string, files: File[]): Promise<void> {
  if (files.length === 0) return;
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  await api.uploadMultipart(`inventory/items/${itemId}/photos`, formData);
}

export function useItemCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["inventory", "items", "create"],
    mutationFn: async ({
      data,
      photoFiles,
    }: {
      data: CreateItemPayload;
      photoFiles: File[];
    }): Promise<ItemDto> => {
      const item = await api.post<ItemDto>("inventory/items", data);
      if (photoFiles.length > 0) {
        await uploadPhotos(item.id, photoFiles);
      }
      return item;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["inventory", "items"] });
      void queryClient.invalidateQueries({ queryKey: ["inventory", "stats"] });
    },
  });
}
