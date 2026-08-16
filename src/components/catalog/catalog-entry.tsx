import Image from "next/image";
import Link from "next/link";
import { Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductBadges } from "@/components/product/product-badges";
import { isInStock } from "@/lib/product-badges";
import { formatBZD } from "@/lib/utils";
import type { Product } from "@/types";

export function CatalogEntry({ product }: { product: Product }) {
  const available = isInStock(product);

  return (
    <Link
      href={`/product/${product.id}`}
      className={`group flex gap-4 rounded-2xl border bg-white/80 p-3 transition hover:-translate-y-0.5 hover:shadow-card ${
        available
          ? "border-forest/10 hover:border-leaf/50"
          : "border-red-200/80 hover:border-red-300"
      }`}
    >
      <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
        <Image
          src={product.fruitImage}
          alt={product.name}
          fill
          className={`object-contain ${!available ? "opacity-55 saturate-50" : ""}`}
          sizes="96px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-semibold text-forest-dark group-hover:text-forest">{product.name}</h3>
          <p className="shrink-0 font-semibold text-forest">{formatBZD(product.price)}</p>
        </div>
        <div className="mt-2">
          <ProductBadges product={product} />
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink/55">
          <Badge>{product.propagationType}</Badge>
          <span className="inline-flex items-center gap-1">
            <Ruler className="h-3 w-3" />
            {product.size}
          </span>
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/60">{product.flavorProfile}</p>
      </div>
    </Link>
  );
}
