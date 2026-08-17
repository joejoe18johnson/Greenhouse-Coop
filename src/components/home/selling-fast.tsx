"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCarousel } from "@/components/product/product-carousel";
import { useProducts } from "@/hooks/use-products";
import { FAST_SELLER_IDS } from "@/lib/constants";

export function SellingFast() {
  const products = useProducts();
  const featured = FAST_SELLER_IDS.map((id) => products.find((p) => p.id === id)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p)
  );

  if (!featured.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 md:pb-12 md:pt-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-leaf">Selling fast</p>
          <h2 className="mt-2 font-display text-3xl text-forest-dark sm:text-4xl">
            Popular trees that go quickly.
          </h2>
          <p className="mt-3 max-w-xl text-ink/65">
            Mangosteen, strawberry, Cuban guava, blood orange, Hass Black, and Valencia orange are nursery
            favorites. Mangosteen and strawberries are always in short supply — order while they last.
          </p>
        </div>
        <Button variant="outline" asChild className="w-full shrink-0 sm:w-auto">
          <Link href="/shop">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <ProductCarousel products={featured} />
    </section>
  );
}
