"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductCarousel({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    setCanPrev(el.scrollLeft > 12);
    setCanNext(el.scrollLeft < max - 12);
    const first = el.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 24 : el.clientWidth;
    const total = step > 0 ? Math.max(1, Math.ceil(max / step) + 1) : 1;
    setPages(total);
    setPage(Math.min(total - 1, Math.max(0, Math.round(el.scrollLeft / step))));
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update, products]);

  // Vertical wheel/trackpad scroll should move the page — not shift carousel content.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      window.scrollBy({ top: e.deltaY, left: 0, behavior: "auto" });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [products]);

  function scrollByPage(dir: -1 | 1) {
    const el = scroller.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const amount = first ? first.offsetWidth + 24 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  function goTo(index: number) {
    const el = scroller.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 24 : el.clientWidth;
    el.scrollTo({ left: index * step, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  const showControls = canPrev || canNext || pages > 1;

  return (
    <div className={cn(className)}>
      <div className="relative">
        <div
          ref={scroller}
          className="flex items-start snap-x snap-mandatory gap-6 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth pb-2 [scrollbar-width:none] [touch-action:pan-y] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product, i) => (
            <div
              key={product.id}
              className="h-auto w-[min(100%,20rem)] shrink-0 snap-start sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
            >
              <ProductCard product={product} index={Math.min(i, 3)} />
            </div>
          ))}
        </div>

        {showControls && (
          <>
            <Button
              type="button"
              variant="cream"
              size="icon"
              aria-label="Previous trees"
              disabled={!canPrev}
              onClick={() => scrollByPage(-1)}
              className="absolute -left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 shadow-lg sm:inline-flex lg:-left-5"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="cream"
              size="icon"
              aria-label="Next trees"
              disabled={!canNext}
              onClick={() => scrollByPage(1)}
              className="absolute -right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 shadow-lg sm:inline-flex lg:-right-5"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {showControls && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous trees"
            disabled={!canPrev}
            onClick={() => scrollByPage(-1)}
            className="sm:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to page ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === page ? "w-6 bg-forest" : "w-1.5 bg-forest/25 hover:bg-forest/50"
                )}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next trees"
            disabled={!canNext}
            onClick={() => scrollByPage(1)}
            className="sm:hidden"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
