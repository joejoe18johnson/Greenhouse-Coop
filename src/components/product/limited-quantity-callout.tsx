import { Clock } from "lucide-react";
import { limitedQuantityLabel, productQuantityCap } from "@/lib/product-quantity";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function LimitedQuantityCallout({
  product,
  prominent = false,
  className,
}: {
  product: Product;
  prominent?: boolean;
  className?: string;
}) {
  const label = limitedQuantityLabel(product);
  const cap = productQuantityCap(product);
  if (!label) return null;

  if (prominent && cap !== undefined && cap > 0) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border-2 border-citrus/70 bg-gradient-to-r from-citrus/30 via-citrus/20 to-citrus/30 px-4 py-3 shadow-sm",
          className
        )}
      >
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-citrus text-ink shadow-md">
          <span className="font-display text-2xl font-bold leading-none tabular-nums">{cap}</span>
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide">left</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-forest/75">
            <Clock className="h-3.5 w-3.5 text-citrus" />
            Limited nursery stock
          </p>
          <p className="mt-0.5 text-sm font-semibold leading-snug text-forest">
            {label} — add to cart before they&apos;re gone
          </p>
        </div>
      </div>
    );
  }

  return (
    <p
      className={cn(
        "rounded-2xl border border-citrus/40 bg-citrus/10 px-4 py-3 text-sm font-medium text-forest",
        className
      )}
    >
      {label}
      {cap !== undefined && cap > 0 ? " — order soon before they're gone." : "."}
    </p>
  );
}
