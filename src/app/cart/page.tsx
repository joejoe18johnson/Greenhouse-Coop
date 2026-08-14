"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { InventoryNotice } from "@/components/product/inventory-notice";
import { useCart } from "@/hooks/use-cart";
import { formatBZD } from "@/lib/utils";
import shipping from "@/data/shipping.json";
import { recommendBox } from "@/lib/shipping";

export default function CartPage() {
  const { items, subtotal, expiresAt, setQty, remove } = useCart();
  const plantCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const box = recommendBox(plantCount, shipping.boxes);
  const holdUntil = expiresAt ? new Date(expiresAt) : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-5xl text-forest-dark">Cart</h1>
      {items.length > 0 && (
        <p className="mt-3 text-sm text-ink/60">
          Items in your cart are held for 72 hours
          {holdUntil ? ` (until ${holdUntil.toLocaleString()}).` : "."} After that the cart resets.
        </p>
      )}
      {items.length === 0 ? (
        <div className="mt-12 rounded-[28px] bg-white/70 p-12 text-center">
          <p className="text-ink/60">Your cart is empty.</p>
          <Button className="mt-6" asChild>
            <Link href="/shop">Shop trees</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-4 rounded-[24px] bg-white/80 p-4">
                <div className="relative h-20 w-20 shrink-0">
                  <Image src={product.fruitImage} alt={product.name} fill className="object-contain" />
                </div>
                <div className="flex-1">
                  <Link href={`/product/${product.id}`} className="font-semibold text-forest">
                    {product.name}
                  </Link>
                  <p className="text-sm text-ink/50">{product.category}</p>
                  <p className="text-sm font-medium">{formatBZD(product.price)}</p>
                </div>
                <div className="flex items-center rounded-full border border-forest/10">
                  <button className="h-9 w-9" onClick={() => setQty(product.id, quantity - 1)}>−</button>
                  <span className="w-6 text-center text-sm">{quantity}</span>
                  <button className="h-9 w-9" onClick={() => setQty(product.id, quantity + 1)}>+</button>
                </div>
                <button className="text-sm text-ink/40 hover:text-red-600" onClick={() => remove(product.id)}>
                  Remove
                </button>
              </div>
            ))}
            <InventoryNotice />
          </div>
          <aside className="h-fit rounded-[28px] bg-forest-dark p-6 text-cream">
            <h2 className="font-display text-2xl">Summary</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatBZD(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm text-cream/70">
              <span>Suggested box</span>
              <span>{box.label}</span>
            </div>
            <p className="mt-4 text-xs text-cream/60">
              Collect at the nursery, or choose delivery at checkout. Local delivery {formatBZD(shipping.localDelivery.fee)} to Belmopan, Roaring Creek, and Camalote.
              Free over {formatBZD(shipping.localDelivery.freeThreshold)}. Couriers are usually office-to-office.
            </p>
            <Button variant="citrus" className="mt-6 w-full" asChild>
              <Link href="/checkout">Checkout</Link>
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
