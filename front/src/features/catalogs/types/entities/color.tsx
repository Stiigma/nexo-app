import { z } from "zod";
import { Palette } from "lucide-react";
import type { CatConfig, CatEntity } from "../catalog-entity";

export interface ColorEntity extends CatEntity {
  name: string;
  hex: string;
}

export const colorSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  hex: z
    .string()
    .min(1, "El código hex es obligatorio")
    .regex(/^#[0-9a-fA-F]{6}$/, "Formato inválido (ej. #1a5f4a)"),
  active: z.boolean().default(true),
});

export const colorConfig: CatConfig<ColorEntity> = {
  key: "colors",
  label: "Colores",
  singular: "Color",
  description: "Colores disponibles con código hexadecimal.",
  icon: Palette,
  basePath: "/catalogs/colors",
  schema: colorSchema,
  columns: [
    { key: "name", header: "Color", render: (r) => r.name, sortable: true },
    {
      key: "hex",
      header: "Hex",
      render: (r) => (
        <span className="inline-flex items-center gap-2">
          <span
            className="h-4 w-4 rounded-full border border-border"
            style={{ backgroundColor: r.hex }}
            aria-hidden
          />
          {r.hex}
        </span>
      ),
      width: "120px",
      hideOnMobile: true,
    },
  ],
  fields: [
    { name: "name", label: "Nombre", type: "text", required: true, placeholder: "Negro" },
    { name: "hex", label: "Hex", type: "text", required: true, placeholder: "#000000", hint: "#RRGGBB" },
  ],
  defaultValues: { hex: "#000000", active: true },
};
