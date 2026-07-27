import { z } from "zod";
import { Shirt } from "lucide-react";
import type { CatConfig, CatEntity } from "../catalog-entity";
import { api } from "@/common/services/api-client";

export interface ClothingSectionDto {
  id: string;
  nameEn: string;
  nameEs: string;
}

export interface ClothingTypeEntity extends CatEntity {
  sectionId: string;
  nameEn: string;
  nameEs: string;
  displayOrder: number;
  metadata?: Record<string, unknown>;
  section?: ClothingSectionDto;
}

export const clothingTypeSchema = z.object({
  sectionId: z.string().min(1, "La sección es obligatoria"),
  nameEn: z.string().min(1, "El nombre en inglés es obligatorio"),
  nameEs: z.string().min(1, "El nombre en español es obligatorio"),
  displayOrder: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const clothingTypeConfig: CatConfig<ClothingTypeEntity> = {
  key: "clothing-types",
  label: "Tipos de ropa",
  singular: "Tipo de ropa",
  description: "Tipos de ropa clasificados por sección (Shopify taxonomy).",
  icon: Shirt,
  basePath: "/catalogs/clothing-types",
  schema: clothingTypeSchema,
  columns: [
    {
      key: "section",
      header: "Sección",
      render: (r) => r.section?.nameEs ?? "—",
    },
    { key: "nameEs", header: "Tipo (ES)", render: (r) => r.nameEs, sortable: true },
    {
      key: "nameEn",
      header: "Tipo (EN)",
      render: (r) => r.nameEn,
      sortable: true,
      hideOnMobile: true,
    },
    {
      key: "displayOrder",
      header: "Orden",
      render: (r) => r.displayOrder,
      width: "70px",
      hideOnMobile: true,
    },
  ],
  fields: [
    {
      name: "sectionId",
      label: "Sección",
      type: "select",
      required: true,
      placeholder: "Selecciona una sección...",
      optionsLoader: async () => {
        const sections = await api.get<ClothingSectionDto[]>("catalogs/clothing-types/sections");
        return sections.map((s) => ({ value: s.id, label: s.nameEs }));
      },
      fullWidth: true,
    },
    { name: "nameEs", label: "Nombre (ES)", type: "text", required: true },
    { name: "nameEn", label: "Nombre (EN)", type: "text", required: true },
    { name: "displayOrder", label: "Orden", type: "number", hint: "0 = primero" },
  ],
  defaultValues: { displayOrder: 0, active: true },
};
