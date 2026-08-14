"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InventoryNotice } from "@/components/product/inventory-notice";
import { FruitPlantSwap } from "@/components/product/fruit-plant-swap";
import { ProductCard } from "@/components/product/product-card";
import { useCart } from "@/hooks/use-cart";
import { useProducts } from "@/hooks/use-products";
import { formatBZD } from "@/lib/utils";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const products = useProducts();
  const product = products.find((p) => p.id === id);
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [view, setView] = useState<"fruit" | "plant">("fruit");

  const related = useMemo(
    () => products.filter((p) => p.category === product?.category && p.id !== product?.id).slice(0, 4),
    [products, product]
  );

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl text-forest">Tree not found</h1>
        <Button className="mt-6" asChild>
          <Link href="/shop">Back to shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="relative mx-auto h-[420px] w-full max-w-md md:h-[520px]">
            <FruitPlantSwap
              fruitImage={product.fruitImage}
              plantImage={product.plantImage}
              alt={product.name}
              className="h-full w-full"
              sizes="(min-width: 1024px) 480px, 90vw"
              priority
              forceView={view}
            />
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <Button size="sm" variant={view === "fruit" ? "default" : "outline"} onClick={() => setView("fruit")}>
              Fruit
            </Button>
            <Button size="sm" variant={view === "plant" ? "default" : "outline"} onClick={() => setView("plant")}>
              Tree size
            </Button>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-leaf">{product.category}</p>
          <h1 className="mt-2 font-display text-5xl text-forest-dark">{product.name}</h1>
          <p className="mt-4 text-3xl font-semibold text-forest">{formatBZD(product.price)}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge>{product.propagationType}</Badge>
            <Badge className="bg-cream-dark text-ink/70">{product.size}</Badge>
            {product.certified && <Badge>Certified</Badge>}
            {product.limitedSupply && <Badge className="bg-citrus/20 text-citrus">Limited supply</Badge>}
          </div>
          <p className="mt-6 leading-relaxed text-ink/70">{product.description}</p>
          <div className="mt-6 rounded-[24px] bg-forest-deep p-6 text-cream">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-lime-bright">Flavor Profile</p>
            <p className="mt-3 leading-relaxed text-cream/85">{product.flavorProfile}</p>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-forest/15 bg-white">
              <button className="h-11 w-11" onClick={() => setQty((n) => Math.max(1, n - 1))}>−</button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button className="h-11 w-11" onClick={() => setQty((n) => n + 1)}>+</button>
            </div>
            <Button size="lg" onClick={() => add(product.id, qty)}>
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" onClick={() => { add(product.id, qty); router.push("/cart"); }}>
              Buy now
            </Button>
          </div>
          <InventoryNotice className="mt-8" />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-3xl text-forest-dark">More in {product.category}</h2>
          <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
