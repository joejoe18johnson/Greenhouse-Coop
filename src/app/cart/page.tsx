"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Minus, Package, Plus, ShoppingBag, Sprout, Trash2 } from "lucide-react";
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
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="page-title inline-flex items-center gap-3">
        <ShoppingBag className="h-8 w-8 shrink-0 text-forest sm:h-10 sm:w-10" />
        Cart
      </h1>
      {items.length > 0 && (
        <p className="mt-3 inline-flex items-start gap-2 text-sm text-ink/60">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
          <span>
            Items in your cart are held for 72 hours
            {holdUntil ? (
              <>
                {" "}
                (until{" "}
                <span className="keep-case">
                  {holdUntil.toLocaleDateString()} {holdUntil.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </span>
                ).
              </>
            ) : (
              "."
            )}{" "}
            After that the cart resets.
          </span>
        </p>
      )}
      {items.length === 0 ? (
        <div className="mt-12 rounded-[28px] bg-white/70 p-12 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-forest/30" />
          <p className="mt-4 text-ink/60">Your cart is empty.</p>
          <Button className="mt-6" asChild>
            <Link href="/shop">
              <Sprout className="h-4 w-4" />
              Shop trees
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="rounded-[24px] bg-white/80 p-4">
                <div className="flex items-start gap-4">
                  <div className="relative h-20 w-20 shrink-0">
                    <Image src={product.fruitImage} alt={product.name} fill className="object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${product.id}`} className="font-semibold text-forest">
                      {product.name}
                    </Link>
                    <p className="text-sm text-ink/50">{product.category}</p>
                    <p className="text-sm font-medium">{formatBZD(product.price)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-forest/10 pt-4">
                  <div className="flex items-center rounded-full border border-forest/10">
                    <button className="grid h-11 w-11 place-items-center" onClick={() => setQty(product.id, quantity - 1)} aria-label="Decrease quantity">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <button className="grid h-11 w-11 place-items-center" onClick={() => setQty(product.id, quantity + 1)} aria-label="Increase quantity">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button className="grid h-11 w-11 place-items-center text-ink/40 hover:text-red-600" onClick={() => remove(product.id)} aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
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
              <span className="inline-flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                Suggested box
              </span>
              <span>{box.label}</span>
            </div>
            <p className="mt-4 text-xs text-cream/60">
              Collect at the Belmopan Bus Terminal, or choose delivery at checkout. Local delivery {formatBZD(shipping.localDelivery.fee)} to Belmopan, Roaring Creek, and Camalote.
              Free over {formatBZD(shipping.localDelivery.freeThreshold)}. Couriers are office-to-office — you pay shipping at their office; we show approximate rates at checkout.
            </p>
            <Button variant="citrus" className="mt-6 w-full" asChild>
              <Link href="/checkout">
                Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
