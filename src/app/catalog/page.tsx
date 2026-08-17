"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DownloadCatalogButton } from "@/components/catalog/download-catalog-button";
import { CatalogEntry } from "@/components/catalog/catalog-entry";
import { InventoryNotice } from "@/components/product/inventory-notice";
import { useProducts } from "@/hooks/use-products";
import { CATEGORIES } from "@/lib/constants";
import { categoryIcon } from "@/lib/icons";
import { ScrollStrip } from "@/components/ui/scroll-carousel";
import { slugify } from "@/lib/utils";

export default function CatalogPage() {
  const products = useProducts();
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = products.filter((p) => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.propagationType.toLowerCase().includes(q) ||
        p.flavorProfile.toLowerCase().includes(q)
      );
    });
    return CATEGORIES.map((category) => ({
      category,
      items: filtered.filter((p) => p.category === category),
    })).filter((group) => group.items.length > 0);
  }, [products, query]);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: "Greenhouse Co-Op Catalog",
        text: "Premium fruit trees for Belize gardens.",
        url,
      });
      return;
    }
    await navigator.clipboard.writeText(url);
    alert("Catalog link copied.");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs text-leaf">
            <BookOpen className="h-3.5 w-3.5" />
            Catalog
          </p>
          <h1 className="page-title mt-2 font-semibold">Variety guide</h1>
          <p className="mt-3 max-w-xl text-ink/65">
            Browse every tree in the catalog by type. This is a variety guide — not live inventory. Download the PDF if you want a copy to keep or share offline.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <DownloadCatalogButton />
          <Button variant="outline" onClick={share}>
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      <InventoryNotice className="mt-8" />

      <div className="relative mt-8 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/50" />
        <Input
          placeholder="Search varieties…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-11"
        />
      </div>

      {grouped.length > 0 && (
        <div className="sticky top-24 z-20 mt-8 bg-cream/90 py-3 backdrop-blur">
          <ScrollStrip bleed>
            {grouped.map((group) => {
              const Icon = categoryIcon(group.category);
              return (
                <a
                  key={group.category}
                  href={`#${slugify(group.category)}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-forest/15 bg-white/80 px-3 py-2 text-xs font-medium text-forest hover:border-forest/40 hover:bg-forest hover:text-cream"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {group.category}
                  <span className="text-[10px] opacity-70">{group.items.length}</span>
                </a>
              );
            })}
          </ScrollStrip>
        </div>
      )}

      <div className="mt-8 space-y-14">
        {grouped.map((group) => {
          const Icon = categoryIcon(group.category);
          return (
            <section key={group.category} id={slugify(group.category)} className="scroll-mt-36">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-forest/10 text-forest">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-3xl font-semibold text-forest-dark">{group.category}</h2>
                  <p className="text-sm text-ink/50">{group.items.length} varieties</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {group.items.map((product) => (
                  <CatalogEntry key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {grouped.length === 0 && (
        <p className="mt-16 text-center text-ink/50">No varieties match that search.</p>
      )}

      <div className="mt-16 rounded-[28px] bg-forest-dark p-8 text-center text-cream">
        <p className="font-display text-2xl font-semibold">Want the printable version?</p>
        <p className="mt-2 text-sm text-cream/70">Download the PDF catalog to keep or share offline.</p>
        <div className="mt-5 flex justify-center">
          <DownloadCatalogButton variant="cream" />
        </div>
      </div>
    </div>
  );
}
