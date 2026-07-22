import { z } from "zod";
import { Receipt } from "lucide-react";
import type { CatConfig, CatEntity } from "../catalog-entity";

export interface ExpenseTypeEntity extends CatEntity {
  name: string;
}

export const expenseTypeSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  active: z.boolean().default(true),
});

export const expenseTypeConfig: CatConfig<ExpenseTypeEntity> = {
  key: "expense-types",
  label: "Tipos de gasto",
  singular: "Tipo de gasto",
  description: "Categorías de gastos operativos (Gasolina, Caseta, Comida...).",
  icon: Receipt,
  basePath: "/catalogs/expense-types",
  schema: expenseTypeSchema,
  columns: [
    { key: "name", header: "Tipo", render: (r) => r.name, sortable: true },
  ],
  fields: [
    { name: "name", label: "Tipo de gasto", type: "text", required: true, placeholder: "Gasolina" },
  ],
  defaultValues: { active: true },
};
