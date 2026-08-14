"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, Search } from "lucide-react";
import { DownloadCatalogButton } from "@/components/catalog/download-catalog-button";
import { ProductCard } from "@/components/product/product-card";
import { FilterPills } from "@/components/ui/filter-pills";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/use-products";
import { CATEGORIES } from "@/lib/constants";
import { PROP_ICONS, categoryIcon } from "@/lib/icons";

const PROP_TYPES = ["Grafted", "Air-Layered", "Seedling"] as const;

export default function ShopPage() {
  const products = useProducts();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("All");
  const [prop, setProp] = useState("All");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const categoryOptions = useMemo(() => {
    const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<string, number>;
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return [
      { value: "All", label: "All", count: products.length, icon: LayoutGrid },
      ...CATEGORIES.filter((c) => counts[c] > 0).map((c) => ({
        value: c,
        label: c,
        count: counts[c],
        icon: categoryIcon(c),
      })),
    ];
  }, [products]);

  const propOptions = useMemo(() => {
    return [
      { value: "All", label: "All types", count: products.length, icon: LayoutGrid },
      ...PROP_TYPES.map((type) => ({
        value: type,
        label: type,
        count: products.filter((p) => p.propagationType === type).length,
        icon: PROP_ICONS[type],
      })),
    ];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = query.toLowerCase();
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchesCat = category === "All" || p.category === category;
      const matchesProp = prop === "All" || p.propagationType === prop;
      return matchesQuery && matchesCat && matchesProp;
    });
  }, [products, query, category, prop]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs text-leaf">Shop</p>
          <h1 className="mt-2 font-display text-5xl text-forest-dark">Fruit trees</h1>
          <p className="mt-3 max-w-xl text-ink/65">
            Fruit is shown first. Hover or tap a card to see the tree at its current nursery size.
          </p>
        </div>
        <DownloadCatalogButton variant="outline" />
      </div>

      <div className="mt-10 space-y-8">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/50" />
          <Input
            placeholder="Search varieties…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11"
          />
        </div>

        <FilterPills
          label="Category"
          value={category}
          onChange={setCategory}
          options={categoryOptions}
        />

        <FilterPills
          label="Propagation"
          value={prop}
          onChange={setProp}
          options={propOptions}
        />
      </div>

      <p className="mt-8 text-sm text-ink/50">{filtered.length} varieties</p>
      <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i % 8} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="mt-12 text-center text-ink/50">
          <Search className="mx-auto h-10 w-10 text-forest/30" />
          <p className="mt-3">No trees match these filters.</p>
        </div>
      )}
    </div>
  );
}
