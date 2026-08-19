import { Logo } from "@/components/brand/logo";
import { BookOpen } from "lucide-react";
import { CatalogProductMeta } from "@/components/catalog/catalog-product-meta";
import { InventoryNotice } from "@/components/product/inventory-notice";
import { BRAND, CATEGORIES } from "@/lib/constants";
import { HOVER_IMAGE_REFERENCE_NOTICE } from "@/lib/product-images";
import { categoryIcon } from "@/lib/icons";
import { isInStock } from "@/lib/product-badges";
import { formatBZD } from "@/lib/utils";
import type { Product } from "@/types";

function CatalogPdfEntry({ product }: { product: Product }) {
  const available = isInStock(product);

  return (
    <article
      className={`catalog-card flex gap-3 rounded-2xl border bg-white/90 p-3 shadow-sm ${
        available ? "border-forest/10" : "border-red-200/80"
      }`}
    >
      <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center">
        {/* Native img — Next/Image lazy-loads off-screen entries and breaks PDF export */}
        <img
          src={product.fruitImage}
          alt={product.name}
          loading="eager"
          decoding="sync"
          className={`max-h-full max-w-full object-contain ${!available ? "opacity-55 saturate-50" : ""}`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight text-forest-dark">{product.name}</h3>
          <p className="shrink-0 text-sm font-semibold tabular-nums text-forest">{formatBZD(product.price)}</p>
        </div>
        <CatalogProductMeta product={product} className="mt-1.5 text-[10px]" />
        {product.flavorProfile ? (
          <p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-ink/60">{product.flavorProfile}</p>
        ) : null}
      </div>
    </article>
  );
}

function CategorySection({ category, items }: { category: string; items: Product[] }) {
  const Icon = categoryIcon(category);

  return (
    <section className="catalog-section">
      <div className="catalog-section-head mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-forest/10 text-forest">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-2xl font-semibold text-forest-dark">{category}</h2>
          <p className="text-xs text-ink/50">{items.length} varieties</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 print:grid-cols-2">
        {items.map((product) => (
          <CatalogPdfEntry key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function CatalogDocument({
  products,
  generatedAt = new Date(),
}: {
  products: Product[];
  generatedAt?: Date;
}) {
  const grouped = CATEGORIES.map((category) => ({
    category,
    items: products.filter((p) => p.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <article
      className="catalog-document mx-auto w-full max-w-[7.5in] text-ink"
      data-catalog-ready={products.length > 0 ? "true" : undefined}
    >
      {/* Header — mirrors /catalog page */}
      <header className="catalog-cover">
        <p className="inline-flex items-center gap-2 text-xs text-leaf">
          <BookOpen className="h-3.5 w-3.5" />
          Catalog
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-forest-dark">Variety guide</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/65">
          Every tree in the GreenHouse Co-Op nursery, grouped by type. This is a variety guide — not live
          inventory. Order online at {BRAND.website} for current availability.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-forest/10 bg-white/80 px-4 py-3 text-xs text-ink/60">
          <Logo variant="horizontal" iconSize={36} wordmarkVisibility="always" />
          <div className="h-8 w-px bg-forest/10" />
          <p>{BRAND.location}</p>
          <p className="keep-case">{BRAND.email}</p>
          <p>
            Updated {generatedAt.toLocaleDateString("en-BZ", { month: "long", year: "numeric" })} ·{" "}
            {products.length} varieties
          </p>
        </div>

        <InventoryNotice className="mt-6 text-xs" />
        <p className="mt-3 text-[10px] leading-relaxed text-ink/45">{HOVER_IMAGE_REFERENCE_NOTICE}</p>
      </header>

      {/* Category grids — same layout as /catalog */}
      <div className="mt-10 space-y-10">
        {grouped.map((group) => (
          <CategorySection key={group.category} category={group.category} items={group.items} />
        ))}
      </div>

      <footer className="catalog-footer mt-10 rounded-[24px] border border-forest/10 bg-white/80 px-5 py-5 text-sm leading-relaxed text-ink/70">
        <p className="font-display text-lg font-semibold text-forest-dark">Order online</p>
        <p className="mt-2">
          Place your order at <strong className="text-forest">{BRAND.website}</strong>, pay by bank
          transfer with your reference number, and send proof on WhatsApp. Collect at the Belmopan Bus
          Terminal, local delivery nearby, or nationwide courier.
        </p>
        <p className="mt-4 text-xs text-ink/45">
          © {generatedAt.getFullYear()} {BRAND.name} · {BRAND.tagline}
        </p>
      </footer>
    </article>
  );
}
