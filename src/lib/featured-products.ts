import type { Product } from "@/types";

export function syncFeaturedProductOrder(order: string[], products: Product[]) {
  const featuredIds = new Set(products.filter((product) => product.featured).map((product) => product.id));
  const cleaned = order.filter((id) => featuredIds.has(id));
  for (const product of products) {
    if (product.featured && !cleaned.includes(product.id)) {
      cleaned.push(product.id);
    }
  }
  return cleaned;
}

export function sortFeaturedProducts(products: Product[], order: string[]) {
  const featured = products.filter((product) => product.featured);
  const orderIndex = new Map(order.map((id, index) => [id, index]));

  return [...featured].sort((a, b) => {
    const aIndex = orderIndex.get(a.id);
    const bIndex = orderIndex.get(b.id);
    if (aIndex !== undefined && bIndex !== undefined) return aIndex - bIndex;
    if (aIndex !== undefined) return -1;
    if (bIndex !== undefined) return 1;
    return a.name.localeCompare(b.name);
  });
}

export function moveFeaturedProduct(order: string[], id: string, direction: "up" | "down") {
  const index = order.indexOf(id);
  if (index < 0) return order;

  const next = [...order];
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= next.length) return next;

  [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  return next;
}

export function removeFeaturedProductFromOrder(order: string[], id: string) {
  return order.filter((entry) => entry !== id);
}
