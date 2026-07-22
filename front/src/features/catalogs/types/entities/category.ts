import { z } from "zod";
import { Grid2x2 } from "lucide-react";
import type { CatConfig, CatEntity } from "../catalog-entity";

export interface CategoryEntity extends CatEntity {
  name: string;
}

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  active: z.boolean().default(true),
});

export const categoryConfig: CatConfig<CategoryEntity> = {
  key: "categories",
  label: "Categorías",
  singular: "Categoría",
  description: "Categorías generales de prendas (Camisa, Pantalón, Vestido...).",
  icon: Grid2x2,
  basePath: "/catalogs/categories",
  schema: categorySchema,
  columns: [
    { key: "name", header: "Nombre", render: (r) => r.name, sortable: true },
  ],
  fields: [
    { name: "name", label: "Nombre", type: "text", required: true, placeholder: "Camisa" },
  ],
  defaultValues: { active: true },
};
