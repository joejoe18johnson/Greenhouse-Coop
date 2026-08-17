import type { Product } from "@/types";
import { SHORT_SUPPLY_IDS } from "@/lib/constants";

export type ProductBadgeKind =
  | "out-of-stock"
  | "very-rare"
  | "limited"
  | "short-supply";

export type ProductBadge = {
  kind: ProductBadgeKind;
  label: string;
};

export function isInStock(product: Product) {
  return product.inStock !== false;
}

export type StockStatus = "in-stock" | "out-of-stock" | "limited" | "very-rare";

export const STOCK_STATUS_OPTIONS: { value: StockStatus; label: string }[] = [
  { value: "in-stock", label: "In stock" },
  { value: "out-of-stock", label: "Out of stock" },
  { value: "limited", label: "Limited availability" },
  { value: "very-rare", label: "Very rare" },
];

export function getStockStatus(product: Product): StockStatus {
  if (product.inStock === false) return "out-of-stock";
  if (product.veryRare) return "very-rare";
  if (product.limitedSupply) return "limited";
  return "in-stock";
}

export function applyStockStatus(product: Product, status: StockStatus): Product {
  switch (status) {
    case "out-of-stock":
      return { ...product, inStock: false };
    case "limited":
      return { ...product, inStock: true, limitedSupply: true, veryRare: false };
    case "very-rare":
      return { ...product, inStock: true, veryRare: true, limitedSupply: false };
    default:
      return { ...product, inStock: true, limitedSupply: false, veryRare: false };
  }
}

export function productBadges(product: Product): ProductBadge[] {
  const badges: ProductBadge[] = [];

  if (!isInStock(product)) {
    badges.push({ kind: "out-of-stock", label: "Out of Stock" });
  }
  if (product.veryRare) {
    badges.push({ kind: "very-rare", label: "Very Rare Item" });
  }
  if (product.limitedSupply && !(SHORT_SUPPLY_IDS as readonly string[]).includes(product.id)) {
    badges.push({ kind: "limited", label: "Limited Availability" });
  }
  if ((SHORT_SUPPLY_IDS as readonly string[]).includes(product.id)) {
    badges.push({ kind: "short-supply", label: "Always Short Supply" });
  }

  return badges;
}

export function badgeClassName(kind: ProductBadgeKind) {
  switch (kind) {
    case "out-of-stock":
      return "bg-red-600 text-white ring-2 ring-red-700/40";
    case "very-rare":
      return "bg-forest-deep text-cream";
    case "limited":
      return "bg-citrus/20 text-citrus";
    case "short-supply":
      return "bg-citrus text-ink";
    default:
      return "bg-forest/10 text-forest";
  }
}
