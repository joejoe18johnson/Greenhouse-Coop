"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { cn } from "@/lib/utils";

export function NavSearch({
  className,
  onNavigate,
  compact = false,
  tone = "default",
}: {
  className?: string;
  onNavigate?: () => void;
  compact?: boolean;
  tone?: "default" | "light";
}) {
  const products = useProducts();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.propagationType.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [products, query]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function goToShop(value = query) {
    const q = value.trim();
    setOpen(false);
    onNavigate?.();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToShop();
        }}
      >
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-forest/50",
            compact ? "left-3 h-3.5 w-3.5" : "left-3.5 h-4 w-4"
          )}
        />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search trees…"
          className={cn(
            "w-full rounded-full border pl-10 pr-4 shadow-sm focus:outline-none focus:ring-2",
            tone === "light"
              ? "border-white/25 bg-white/95 text-ink placeholder:text-ink/45 focus:ring-white/40"
              : "border-forest/15 bg-white/80 text-ink placeholder:text-ink/40 focus:ring-forest/40",
            compact ? "h-9 text-sm pl-9" : "h-11 text-base md:text-sm"
          )}
        />
      </form>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-forest/10 bg-cream shadow-float">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink/50">No trees match “{query}”.</p>
          ) : (
            <ul>
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/product/${product.id}`}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                      onNavigate?.();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-forest/5"
                  >
                    <span className="relative h-10 w-10 shrink-0">
                      <Image src={product.fruitImage} alt="" fill className="object-contain" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-forest">{product.name}</span>
                      <span className="text-xs text-ink/50">{product.category}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => goToShop()}
            className="w-full border-t border-forest/10 px-4 py-2.5 text-left text-xs font-semibold text-forest hover:bg-forest/5"
          >
            View all results
          </button>
        </div>
      )}
    </div>
  );
}
