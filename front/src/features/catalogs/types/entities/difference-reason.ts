import { z } from "zod";
import { ArrowLeftRight } from "lucide-react";
import type { CatConfig, CatEntity } from "../catalog-entity";

export interface DifferenceReasonEntity extends CatEntity {
  name: string;
}

export const differenceReasonSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  active: z.boolean().default(true),
});

export const differenceReasonConfig: CatConfig<DifferenceReasonEntity> = {
  key: "difference-reasons",
  label: "Motivos de diferencia",
  singular: "Motivo de diferencia",
  description: "Motivos de diferencia en inventario (Daño, Precio, Talla...).",
  icon: ArrowLeftRight,
  basePath: "/catalogs/difference-reasons",
  schema: differenceReasonSchema,
  columns: [
    { key: "name", header: "Motivo", render: (r) => r.name, sortable: true },
  ],
  fields: [
    { name: "name", label: "Motivo", type: "text", required: true, placeholder: "Daño" },
  ],
  defaultValues: { active: true },
};
