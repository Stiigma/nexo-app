import { z } from "zod";
import { Heart } from "lucide-react";
import type { CatConfig, CatEntity } from "../catalog-entity";

export interface ConditionEntity extends CatEntity {
  name: string;
  displayOrder: number;
}

export const conditionSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  displayOrder: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const conditionConfig: CatConfig<ConditionEntity> = {
  key: "conditions",
  label: "Condiciones",
  singular: "Condición",
  description: "Condición de la prenda (Nuevo, Como nuevo, Usado...).",
  icon: Heart,
  basePath: "/catalogs/conditions",
  schema: conditionSchema,
  columns: [
    { key: "name", header: "Condición", render: (r) => r.name, sortable: true },
    {
      key: "displayOrder",
      header: "Orden",
      render: (r) => r.displayOrder,
      width: "70px",
      hideOnMobile: true,
    },
  ],
  fields: [
    { name: "name", label: "Condición", type: "text", required: true, placeholder: "Nuevo" },
    { name: "displayOrder", label: "Orden", type: "number", hint: "0 = primero" },
  ],
  defaultValues: { displayOrder: 0, active: true },
};
