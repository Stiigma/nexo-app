import { z } from "zod";
import { CreditCard } from "lucide-react";
import type { CatConfig, CatEntity } from "../catalog-entity";

export interface PaymentMethodEntity extends CatEntity {
  name: string;
}

export const paymentMethodSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  active: z.boolean().default(true),
});

export const paymentMethodConfig: CatConfig<PaymentMethodEntity> = {
  key: "payment-methods",
  label: "Métodos de pago",
  singular: "Método de pago",
  description: "Formas de pago aceptadas (Efectivo, Tarjeta, Transferencia...).",
  icon: CreditCard,
  basePath: "/catalogs/payment-methods",
  schema: paymentMethodSchema,
  columns: [
    { key: "name", header: "Método", render: (r) => r.name, sortable: true },
  ],
  fields: [
    { name: "name", label: "Método", type: "text", required: true, placeholder: "Efectivo" },
  ],
  defaultValues: { active: true },
};
