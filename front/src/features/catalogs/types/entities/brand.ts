import { z } from "zod";
import { Tag } from "lucide-react";
import type { CatConfig, CatEntity } from "../catalog-entity";

export interface BrandEntity extends CatEntity {
  name: string;
  metadata?: Record<string, unknown>;
}

export const brandSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  active: z.boolean().default(true),
});

export const brandConfig: CatConfig<BrandEntity> = {
  key: "brands",
  label: "Marcas",
  singular: "Marca",
  description: "Marcas de las prendas (Nike, Levi's, Gap, etc.).",
  icon: Tag,
  basePath: "/catalogs/brands",
  schema: brandSchema,
  columns: [
    { key: "name", header: "Nombre", render: (r) => r.name, sortable: true },
  ],
  fields: [
    { name: "name", label: "Nombre", type: "text", required: true, placeholder: "Nike" },
  ],
  defaultValues: { active: true },
};
