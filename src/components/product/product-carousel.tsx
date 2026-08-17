"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

function readGap(el: HTMLElement) {
  const styles = getComputedStyle(el);
  const gap = parseFloat(styles.columnGap || styles.gap || "0");
  return Number.isFinite(gap) ? gap : 0;
}

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
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < max - 8);
    const first = el.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + readGap(el) : el.clientWidth;
    const total = step > 0 ? Math.max(1, Math.ceil(max / step) + 1) : 1;
    setPages(total);
    setPage(step > 0 ? Math.min(total - 1, Math.max(0, Math.round(el.scrollLeft / step))) : 0);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    Array.from(el.children).forEach((child) => ro.observe(child));
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update, products]);

  // Desktop only: let vertical wheel scroll the page, not the carousel strip.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      window.scrollBy({ top: e.deltaY, left: 0, behavior: "auto" });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [products]);

  function scrollStep() {
    const el = scroller.current;
    if (!el) return 0;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return el.clientWidth * 0.9;
    return first.offsetWidth + readGap(el);
  }

  function scrollByPage(dir: -1 | 1) {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * scrollStep(), behavior: "smooth" });
  }

  function goTo(index: number) {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: index * scrollStep(), behavior: "smooth" });
  }

  if (products.length === 0) return null;

  const showControls = products.length > 1;

  return (
    <div className={cn("min-w-0", className)}>
      <div className="relative min-w-0">
        <div
          ref={scroller}
          className="flex items-start gap-4 overflow-x-auto overflow-y-visible overscroll-x-contain scroll-smooth px-[max(1rem,calc((100%-min(82vw,18.5rem))/2))] pb-1 [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] snap-x snap-mandatory sm:gap-6 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product, i) => (
            <div
              key={product.id}
              className="h-auto w-[min(82vw,18.5rem)] shrink-0 snap-center sm:w-[min(calc(50%-0.75rem),20rem)] sm:snap-start lg:w-[min(calc(33.333%-1rem),20rem)]"
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
        <div className="mt-5 flex items-center justify-center gap-3 sm:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous trees"
            disabled={!canPrev}
            onClick={() => scrollByPage(-1)}
            className="h-10 w-10 shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex min-w-0 items-center gap-1 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === page ? "true" : undefined}
                onClick={() => goTo(i)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full active:bg-forest/10"
              >
                <span
                  className={cn(
                    "block rounded-full transition-all duration-200",
                    i === page ? "h-2 w-5 bg-forest" : "h-2 w-2 bg-forest/25"
                  )}
                />
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next trees"
            disabled={!canNext}
            onClick={() => scrollByPage(1)}
            className="h-10 w-10 shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
