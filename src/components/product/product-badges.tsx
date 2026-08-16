import { Ban, Flame, Gem } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { badgeClassName, isInStock, productBadges } from "@/lib/product-badges";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductBadges({
  product,
  className,
  overlay,
}: {
  product: Product;
  className?: string;
  overlay?: boolean;
}) {
  const badges = productBadges(product);
  const outOfStock = !isInStock(product);
  const otherBadges = badges.filter((b) => b.kind !== "out-of-stock");

  if (badges.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        overlay && "absolute inset-x-0 top-0 z-10",
        !overlay && "flex-row flex-wrap",
        className
      )}
    >
      {outOfStock && (
        <div
          className={cn(
            overlay
              ? "flex w-full items-center justify-center gap-2 bg-red-600 px-4 py-2.5 text-center shadow-lg"
              : "inline-flex"
          )}
        >
          <Badge
            className={cn(
              "inline-flex items-center gap-2 border-0 font-bold uppercase tracking-wide",
              overlay
                ? "bg-transparent px-0 py-0 text-sm text-white shadow-none"
                : "rounded-full bg-red-600 px-4 py-2 text-xs text-white shadow-lg ring-2 ring-red-700/40"
            )}
          >
            <Ban className={cn(overlay ? "h-4 w-4" : "h-3.5 w-3.5")} />
            Out of Stock
          </Badge>
        </div>
      )}

      {otherBadges.length > 0 && (
        <div
          className={cn(
            "flex flex-wrap gap-2",
            overlay && "px-4 pt-2",
            outOfStock && overlay && "pt-1"
          )}
        >
          {otherBadges.map((badge) => (
            <Badge
              key={badge.kind}
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-semibold shadow-md",
                badgeClassName(badge.kind)
              )}
            >
              {badge.kind === "short-supply" && <Flame className="h-3.5 w-3.5" />}
              {badge.kind === "very-rare" && <Gem className="h-3.5 w-3.5" />}
              {badge.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
