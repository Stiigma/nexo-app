import { z } from "zod";
import { Ruler } from "lucide-react";
import type { CatConfig, CatEntity } from "../catalog-entity";

export interface SizeEntity extends CatEntity {
  name: string;
  displayOrder: number;
}

export const sizeSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  displayOrder: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const sizeConfig: CatConfig<SizeEntity> = {
  key: "sizes",
  label: "Tallas",
  singular: "Talla",
  description: "Tallas disponibles (XS, S, M, L, XL, numéricas...).",
  icon: Ruler,
  basePath: "/catalogs/sizes",
  schema: sizeSchema,
  columns: [
    { key: "name", header: "Talla", render: (r) => r.name, sortable: true },
    {
      key: "displayOrder",
      header: "Orden",
      render: (r) => r.displayOrder,
      width: "70px",
      hideOnMobile: true,
    },
  ],
  fields: [
    { name: "name", label: "Talla", type: "text", required: true, placeholder: "M" },
    { name: "displayOrder", label: "Orden", type: "number", hint: "0 = primero" },
  ],
  defaultValues: { displayOrder: 0, active: true },
};
