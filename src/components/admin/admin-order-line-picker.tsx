"use client";

import { Minus, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { formatBZD } from "@/lib/utils";
import type { Product } from "@/types";

type LineQty = Record<string, number>;
type LinePrices = Record<string, number | undefined>;

export function AdminOrderLinePicker({
  products,
  quantities,
  linePrices,
  productQuery,
  onProductQueryChange,
  onQuantityChange,
  onLinePriceChange,
}: {
  products: Product[];
  quantities: LineQty;
  linePrices: LinePrices;
  productQuery: string;
  onProductQueryChange: (value: string) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  onLinePriceChange: (productId: string, price: number) => void;
}) {
  const filteredProducts = [...products]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((product) => {
      const q = productQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        product.name.toLowerCase().includes(q) || product.category.toLowerCase().includes(q)
      );
    });

  return (
    <section className="rounded-[28px] bg-white p-6">
      <h2 className="font-display text-2xl text-forest">Trees &amp; pricing</h2>
      <p className="mt-2 text-sm text-ink/55">
        Set quantities and override unit prices for this invoice — useful for large or wholesale orders.
      </p>
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
        <Input
          className="pl-9"
          placeholder="Search catalog"
          value={productQuery}
          onChange={(e) => onProductQueryChange(e.target.value)}
        />
      </div>
      <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {filteredProducts.map((product) => {
          const qty = quantities[product.id] ?? 0;
          const unitPrice = linePrices[product.id] ?? product.price;
          const customPrice = qty > 0 && unitPrice !== product.price;

          return (
            <div
              key={product.id}
              className="rounded-[18px] border border-forest/8 bg-cream/30 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-forest">{product.name}</p>
                  <p className="text-xs text-ink/45">
                    {product.category} · Catalog {formatBZD(product.price)}
                    {customPrice && (
                      <span className="ml-2 font-medium text-citrus">
                        · Invoice {formatBZD(unitPrice)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onQuantityChange(product.id, qty - 1)}
                    aria-label={`Decrease ${product.name}`}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onQuantityChange(product.id, qty + 1)}
                    aria-label={`Increase ${product.name}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {qty > 0 && (
                <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-forest/8 pt-3">
                  <div>
                    <Label className="text-xs text-ink/55">Unit price on invoice (BZD)</Label>
                    <NumberInput
                      className="mt-1 w-28"
                      value={unitPrice}
                      min={0}
                      allowDecimal
                      onChange={(price) => onLinePriceChange(product.id, price)}
                    />
                  </div>
                  <p className="text-xs text-ink/45">
                    Line total: <span className="font-medium text-forest">{formatBZD(unitPrice * qty)}</span>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
