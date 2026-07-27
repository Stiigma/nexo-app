export type ItemStatus =
  | "PRICE_PENDING"
  | "ACQUIRED_STOCK"
  | "AVAILABLE"
  | "RESERVED"
  | "SOLD"
  | "RETURNED";

export interface ItemPhoto {
  id: string;
  itemId: string;
  isMain: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface PhotoUploadResponse {
  photos: ItemPhoto[];
}

export type CleanupStatus = "completed" | "pending";

export interface ItemDto {
  id: string;
  internalCode: string;
  productName: string | null;
  brandId: string;
  categoryId: string;
  conditionId: string;
  sizeId: string | null;
  colorId: string | null;
  purchaseId: string | null;
  status: ItemStatus;
  physicalLocation: string | null;
  costCurrency?: string;
  costAmount?: number | null;
  costMxnEq?: number | null;
  exchangeRate?: number | null;
  targetPriceMxn: number | null;
  minPriceMxn?: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  brand?: { id: string; name: string };
  category?: { id: string; name: string };
  condition?: { id: string; name: string };
  size?: { id: string; name: string } | null;
  color?: { id: string; name: string; hex?: string } | null;
  purchase?: {
    id: string;
    tripDate: string;
    store?: { id: string; name: string } | null;
  } | null;
  photos: ItemPhoto[];
}

export interface InventoryStats {
  totalItems: number;
  totalCostMXN?: number;
  totalValueMXN: number;
  avgMargin?: number;
  statusBreakdown: { status: ItemStatus; label: string; count: number }[];
}

export interface InventoryFilters {
  search?: string;
  status?: ItemStatus | "all";
  brandId?: string;
  categoryId?: string;
  sizeId?: string;
  conditionId?: string;
  colorId?: string;
  page?: number;
  limit?: number;
}

export interface FacetOption {
  id?: string;
  value: string;
  label: string;
  count: number;
}

export interface FacetCounts {
  statuses: FacetOption[];
  brands: FacetOption[];
  categories: FacetOption[];
  sizes: FacetOption[];
  conditions: FacetOption[];
  colors: FacetOption[];
}
