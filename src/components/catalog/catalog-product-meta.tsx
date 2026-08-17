import { isInStock, productBadges } from "@/lib/product-badges";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function CatalogProductMeta({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const badges = productBadges(product);
  const statusLabels = badges.map((b) => b.label);
  const meta = [product.propagationType, product.size, product.certified ? "Certified" : ""].filter(Boolean);

  if (statusLabels.length === 0 && meta.length === 0) return null;

  return (
    <div className={cn("space-y-1 text-xs leading-relaxed", className)}>
      {statusLabels.length > 0 && (
        <p className={cn(!isInStock(product) ? "text-red-600" : "text-ink/55")}>
          {statusLabels.join(" · ")}
        </p>
      )}
      <p className="text-ink/50">{meta.join(" · ")}</p>
    </div>
  );
}
