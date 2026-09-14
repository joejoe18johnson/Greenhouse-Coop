import { applyOrderToProductInventory } from "@/lib/product-quantity";
import type { Order, Product } from "@/types";

export function reserveInventoryForOrder(
  items: Order["items"],
  getProduct: (id: string) => Product | undefined,
  saveProduct: (product: Product) => void
) {
  for (const item of items) {
    const product = getProduct(item.productId);
    if (!product) continue;
    const updated = applyOrderToProductInventory(product, item.quantity);
    if (updated) saveProduct(updated);
  }
}
