"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCarousel } from "@/components/product/product-carousel";
import { useFeaturedProducts } from "@/hooks/use-featured-products";

export function SellingFast() {
  const featured = useFeaturedProducts();

  if (!featured.length) return null;

  const names = featured.slice(0, 4).map((product) => product.name);
  const summary =
    names.length >= 2
      ? `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`
      : names[0] ?? "nursery favorites";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 md:pb-12 md:pt-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-leaf">Featured</p>
          <h2 className="mt-2 font-display text-3xl text-forest-dark sm:text-4xl">
            Hand-picked trees from the nursery.
          </h2>
          <p className="mt-3 max-w-xl text-ink/65">
            {summary} {featured.length > 1 ? "are" : "is"} highlighted this season — browse the featured
            selection below or shop the full catalog.
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
