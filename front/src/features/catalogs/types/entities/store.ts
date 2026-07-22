import { z } from "zod";
import { Store } from "lucide-react";
import type { CatConfig, CatEntity } from "../catalog-entity";

export interface StoreEntity extends CatEntity {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  defaultTaxRate: number;
}

export const storeSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  defaultTaxRate: z.coerce.number().min(0).max(1).default(0.0875),
  active: z.boolean().default(true),
});

export const storeConfig: CatConfig<StoreEntity> = {
  key: "stores",
  label: "Tiendas",
  singular: "Tienda",
  description: "Tiendas donde se compran prendas en Estados Unidos.",
  icon: Store,
  basePath: "/catalogs/stores",
  schema: storeSchema,
  columns: [
    { key: "name", header: "Nombre", render: (r) => r.name, sortable: true },
    { key: "city", header: "Ciudad", render: (r) => r.city ?? "—", hideOnMobile: true },
    { key: "state", header: "Estado", render: (r) => r.state ?? "—", hideOnMobile: true },
    {
      key: "defaultTaxRate",
      header: "Tax",
      render: (r) => `${(r.defaultTaxRate * 100).toFixed(2)}%`,
      width: "80px",
    },
  ],
  fields: [
    { name: "name", label: "Nombre", type: "text", required: true, placeholder: "Walmart" },
    { name: "address", label: "Dirección", type: "text", fullWidth: true },
    { name: "city", label: "Ciudad", type: "text" },
    { name: "state", label: "Estado", type: "text", placeholder: "CA" },
    {
      name: "defaultTaxRate",
      label: "Tax rate",
      type: "number",
      hint: "0.0875 = 8.75%",
      placeholder: "0.0875",
    },
  ],
  defaultValues: { defaultTaxRate: 0.0875, active: true },
};
