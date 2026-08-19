"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function readGap(el: HTMLElement) {
  const styles = getComputedStyle(el);
  const gap = parseFloat(styles.columnGap || styles.gap || "0");
  return Number.isFinite(gap) ? gap : 0;
}

const TRACK_CLASS =
  "flex items-stretch overflow-x-auto overflow-y-hidden overscroll-x-contain [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] snap-x snap-mandatory scroll-smooth [scroll-behavior:smooth] [&::-webkit-scrollbar]:hidden";

export function ScrollCarousel({
  children,
  className,
  trackClassName,
  itemClassName,
  showControls = true,
  desktopArrows = true,
  mobileControls = true,
  prevLabel = "Previous slide",
  nextLabel = "Next slide",
  bleed = false,
}: {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  itemClassName?: string;
  showControls?: boolean;
  desktopArrows?: boolean;
  mobileControls?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  bleed?: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  const items = Array.isArray(children) ? children : [children];
  const hasControls = showControls && items.length > 1;

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
    el.addEventListener("scrollend", update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    Array.from(el.children).forEach((child) => ro.observe(child));
    return () => {
      el.removeEventListener("scroll", update);
      el.removeEventListener("scrollend", update);
      ro.disconnect();
    };
  }, [update, children]);

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
  }, [children]);

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
    const target = el.scrollLeft + dir * scrollStep();
    el.scrollTo({ left: target, behavior: "smooth" });
  }

  function goTo(index: number) {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: index * scrollStep(), behavior: "smooth" });
  }

  return (
    <div className={cn("min-w-0 overflow-visible", bleed && "-mx-2 sm:mx-0", className)}>
      <div className="relative min-w-0 overflow-visible py-2">
        <div
          ref={scroller}
          className={cn(
            TRACK_CLASS,
            "gap-4 py-3 sm:gap-6",
            trackClassName
          )}
        >
          {items.map((child, i) => (
            <div key={i} className={cn("h-auto shrink-0 snap-always snap-center self-stretch", itemClassName)}>
              {child}
            </div>
          ))}
        </div>

        {hasControls && desktopArrows && (
          <>
            <Button
              type="button"
              variant="cream"
              size="icon"
              aria-label={prevLabel}
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
              aria-label={nextLabel}
              disabled={!canNext}
              onClick={() => scrollByPage(1)}
              className="absolute -right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 shadow-lg sm:inline-flex lg:-right-5"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {hasControls && mobileControls && (
        <div className="mt-5 sm:hidden">
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={prevLabel}
              disabled={!canPrev}
              onClick={() => scrollByPage(-1)}
              className="h-10 w-10 shrink-0 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex min-w-0 flex-1 items-center justify-center gap-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === page ? "true" : undefined}
                  onClick={() => goTo(i)}
                  className="flex h-9 w-7 shrink-0 items-center justify-center rounded-full active:bg-forest/10"
                >
                  <span
                    className={cn(
                      "block rounded-full transition-[width,background-color,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      i === page ? "h-2 w-6 bg-forest opacity-100" : "h-2 w-2 bg-forest/30 opacity-80"
                    )}
                  />
                </button>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={nextLabel}
              disabled={!canNext}
              onClick={() => scrollByPage(1)}
              className="h-10 w-10 shrink-0 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <p
            className="mt-2 text-center text-[11px] font-medium tabular-nums tracking-wide text-ink/45 transition-opacity duration-300"
            aria-live="polite"
          >
            {page + 1} of {pages}
          </p>
        </div>
      )}
    </div>
  );
}

/** Lightweight horizontal strip — swipeable, no pagination */
export function ScrollStrip({
  children,
  className,
  bleed = false,
}: {
  children: ReactNode;
  className?: string;
  bleed?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto overflow-y-visible overscroll-x-contain scroll-smooth py-1 [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        bleed && "-mx-4 px-4 sm:mx-0 sm:px-0",
        className
      )}
    >
      {children}
    </div>
  );
}
