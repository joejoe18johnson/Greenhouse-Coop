import type { Product } from "@/types";

/** Max purchasable when limited / very rare with a set nursery count. */
export function productQuantityCap(product: Product): number | undefined {
  if (!product.limitedSupply && !product.veryRare) return undefined;
  if (product.availableQuantity === undefined || product.availableQuantity === null) return undefined;
  return Math.max(0, Math.floor(product.availableQuantity));
}

export function hasQuantityCap(product: Product) {
  return productQuantityCap(product) !== undefined;
}

export function maxCartQuantity(product: Product): number {
  const cap = productQuantityCap(product);
  return cap === undefined ? 999 : cap;
}

export function clampCartQuantity(product: Product, quantity: number) {
  const max = maxCartQuantity(product);
  return Math.max(0, Math.min(Math.floor(quantity), max));
}

export function canAddToCart(product: Product, currentCartQty: number, addQty = 1) {
  if (product.inStock === false) return false;
  const cap = productQuantityCap(product);
  if (cap !== undefined && cap <= 0) return false;
  return currentCartQty + addQty <= maxCartQuantity(product);
}

export function limitedQuantityLabel(product: Product): string | null {
  const cap = productQuantityCap(product);
  if (cap === undefined) return null;
  if (cap <= 0) return "Sold out";
  if (cap === 1) return "Only 1 left";
  return `Only ${cap} left`;
}

export function applyOrderToProductInventory(product: Product, orderedQty: number): Product | null {
  const cap = productQuantityCap(product);
  if (cap === undefined) return null;

  const next = Math.max(0, cap - orderedQty);
  return {
    ...product,
    availableQuantity: next,
    inStock: next > 0,
  };
}

export function validateCartQuantities(
  items: { productId: string; quantity: number }[],
  getProduct: (id: string) => Product | undefined
): string | null {
  for (const item of items) {
    const product = getProduct(item.productId);
    if (!product) continue;
    const cap = productQuantityCap(product);
    if (cap === undefined) continue;
    if (item.quantity > cap) {
      return `${product.name} has limited stock — maximum ${cap} available.`;
    }
    if (cap <= 0) {
      return `${product.name} is no longer available.`;
    }
  }
  return null;
}
