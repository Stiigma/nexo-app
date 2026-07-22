import type { z } from "zod";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
/** Toda entidad de catálogo tiene estos campos base */
export interface CatEntity {
  id: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Tipos de campo soportados en el form automático */
export type CatFieldType =
  | "text"
  | "number"
  | "boolean" // → Switch
  | "select" // → Select con options
  | "textarea";

/** Definición de un campo del formulario */
export interface CatField {
  name: string;
  label: string;
  type: CatFieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[]; // solo para select
  fullWidth?: boolean; // ocupa 2 columnas en el grid del form
  hint?: string; // texto de ayuda bajo el campo
}

/** Definición de una columna de la tabla */
export interface CatColumn<T extends CatEntity> {
  key: string;
  header: string;
  // Method syntax (bivariant) so CatConfig<SpecificEntity> is assignable to
  // CatConfig<CatEntity> in the registry.
  render(row: T): ReactNode;
  sortable?: boolean;
  width?: string;
  hideOnMobile?: boolean; // se oculta en pantallas pequeñas
}

/** Configuración completa de una entidad de catálogo */
export interface CatConfig<T extends CatEntity = CatEntity> {
  // Identidad
  key: string; // "stores" — usado en queryKey, URL, store
  label: string; // "Tiendas" — tab label, headers
  singular: string; // "Tienda" — "Nueva Tienda", "Eliminar Tienda"
  description: string; // "Tiendas donde se compran prendas"
  icon: LucideIcon;

  // API
  basePath: string; // "/catalogs/stores"

  // Validación — valida los campos del formulario (subset editable de T).
  // Se tipa como z.ZodType (sin amarrar a T) porque el formulario no envía
  // id/createdAt/updatedAt (generados por el backend). El resolver infiere
  // los tipos en tiempo de ejecución.
  schema: z.ZodType;

  // Tabla
  columns: CatColumn<T>[];

  // Formulario
  fields: CatField[];

  // Defaults para el form de creación
  defaultValues: Partial<T>;
}
