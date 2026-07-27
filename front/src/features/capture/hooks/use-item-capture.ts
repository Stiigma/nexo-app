import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/common/services/api-client";
import type { ItemDto } from "@/features/inventory/types/item";
import type { CreateItemPayload } from "@/features/inventory/hooks/use-item-create";

async function uploadPhotos(itemId: string, files: File[]): Promise<void> {
  if (files.length === 0) return;
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  await api.uploadMultipart(`inventory/items/${itemId}/photos`, formData);
}

export function useItemCapture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["inventory", "items", "capture"],
    mutationFn: async ({
      data,
      photoFiles,
    }: {
      data: CreateItemPayload;
      photoFiles: File[];
    }): Promise<ItemDto> => {
      const item = await api.post<ItemDto>("inventory/items/capture", data);
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
