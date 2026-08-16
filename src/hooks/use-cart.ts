"use client";

import { useStore } from "@/context/store-context";
import { getCart, getCartUpdatedAt, getProduct } from "@/lib/store";
import { CART_HOLD_MS } from "@/lib/constants";
import { isInStock } from "@/lib/product-badges";
import type { CartItem, Product } from "@/types";

export function useCart() {
  const { cart, setCart } = useStore();

  const items = cart
    .map((item) => {
      const product = getProduct(item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean) as (CartItem & { product: Product })[];

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const updatedAt = getCartUpdatedAt();
  const expiresAt = updatedAt ? new Date(updatedAt).getTime() + CART_HOLD_MS : null;

  function add(productId: string, quantity = 1) {
    const product = getProduct(productId);
    if (!product || !isInStock(product)) return;
    const next = [...cart];
    const existing = next.find((i) => i.productId === productId);
    if (existing) existing.quantity += quantity;
    else next.push({ productId, quantity });
    setCart(next);
  }

  function setQty(productId: string, quantity: number) {
    if (quantity <= 0) {
      setCart(cart.filter((i) => i.productId !== productId));
      return;
    }
    setCart(cart.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
  }

  function remove(productId: string) {
    setCart(cart.filter((i) => i.productId !== productId));
  }

  function clear() {
    setCart([]);
  }

  return { items, count, subtotal, expiresAt, add, setQty, remove, clear };
}
