import { storeConfig } from "../types/entities/store";
import { brandConfig } from "../types/entities/brand";
import { clothingTypeConfig } from "../types/entities/clothing-type";
import { categoryConfig } from "../types/entities/category";
import { sizeConfig } from "../types/entities/size";
import { conditionConfig } from "../types/entities/condition";
import { colorConfig } from "../types/entities/color";
import { paymentMethodConfig } from "../types/entities/payment-method";
import { expenseTypeConfig } from "../types/entities/expense-type";
import { differenceReasonConfig } from "../types/entities/difference-reason";
import type { CatConfig } from "../types/catalog-entity";

/** Registry de las 9 entidades de catálogo en orden de tabs. */
export const CATALOG_REGISTRY: CatConfig[] = [
  storeConfig,
  brandConfig,
  clothingTypeConfig,
  categoryConfig,
  sizeConfig,
  conditionConfig,
  colorConfig,
  paymentMethodConfig,
  expenseTypeConfig,
  differenceReasonConfig,
];
