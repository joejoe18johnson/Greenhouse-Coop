import { CART_HOLD_MS, STORAGE_KEYS } from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage";
import type { CartItem, StoredCart } from "@/types";

export function readPersistedCart(): StoredCart {
  const raw = getItem<StoredCart | CartItem[]>(STORAGE_KEYS.cart, {
    items: [],
    updatedAt: new Date().toISOString(),
  });

  const stored: StoredCart = Array.isArray(raw)
    ? { items: raw, updatedAt: new Date().toISOString() }
    : {
        items: raw.items ?? [],
        updatedAt: raw.updatedAt ?? new Date().toISOString(),
      };

  if (stored.items.length && Date.now() - new Date(stored.updatedAt).getTime() > CART_HOLD_MS) {
    const empty = { items: [] as CartItem[], updatedAt: new Date().toISOString() };
    writePersistedCart(empty);
    return empty;
  }

  return stored;
}

export function writePersistedCart(cart: StoredCart) {
  setItem(STORAGE_KEYS.cart, cart);
}

export function mergeCartItems(...groups: CartItem[][]): CartItem[] {
  const quantities = new Map<string, number>();
  for (const group of groups) {
    for (const item of group) {
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    }
  }
  return [...quantities.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}
