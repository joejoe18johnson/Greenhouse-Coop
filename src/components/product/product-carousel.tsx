"use client";

import { ProductCard } from "@/components/product/product-card";
import { ScrollCarousel } from "@/components/ui/scroll-carousel";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const MOBILE_ITEM =
  "w-[min(82vw,18.5rem)] snap-center sm:w-[min(calc(50%-0.75rem),20rem)] sm:snap-start lg:w-[min(calc(33.333%-1rem),20rem)]";

export function ProductCarousel({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  if (products.length === 0) return null;

  return (
    <ScrollCarousel
      className={cn(className)}
      bleed
      prevLabel="Previous trees"
      nextLabel="Next trees"
      trackClassName="px-[max(1rem,calc((100%-min(82vw,18.5rem))/2))] sm:px-0"
      itemClassName={MOBILE_ITEM}
    >
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={Math.min(i, 3)} inCarousel />
      ))}
    </ScrollCarousel>
  );
}
