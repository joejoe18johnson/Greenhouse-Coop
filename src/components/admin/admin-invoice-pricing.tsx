"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { LOYALTY_DISCOUNT_LABEL } from "@/lib/loyalty-discount";

export function AdminInvoicePricing({
  invoiceDiscount,
  invoiceDiscountNote,
  loyaltyDiscountWaived = false,
  onInvoiceDiscountChange,
  onInvoiceDiscountNoteChange,
  onLoyaltyDiscountWaivedChange,
  compact = false,
}: {
  invoiceDiscount: number;
  invoiceDiscountNote: string;
  loyaltyDiscountWaived?: boolean;
  onInvoiceDiscountChange: (value: number) => void;
  onInvoiceDiscountNoteChange: (value: string) => void;
  onLoyaltyDiscountWaivedChange?: (value: boolean) => void;
  compact?: boolean;
}) {
  const shell = compact ? "space-y-4" : "rounded-[28px] bg-white p-6";

  return (
    <section className={shell}>
      {!compact && (
        <>
          <h2 className="font-display text-2xl text-forest">Discounts</h2>
          <p className="mt-2 text-sm text-ink/55">
            Add a flat discount on the invoice, or turn off the automatic loyalty discount for this order.
          </p>
        </>
      )}

      <div className={`grid gap-4 sm:grid-cols-2 ${compact ? "" : "mt-4"}`}>
        <div>
          <Label>Extra discount (BZD)</Label>
          <NumberInput
            className="mt-1"
            value={invoiceDiscount}
            min={0}
            onChange={onInvoiceDiscountChange}
          />
          {invoiceDiscount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 h-auto px-0 text-xs text-red-600 hover:bg-transparent hover:text-red-700"
              onClick={() => {
                onInvoiceDiscountChange(0);
                onInvoiceDiscountNoteChange("");
              }}
            >
              Remove extra discount
            </Button>
          )}
        </div>
        <div>
          <Label>Label on invoice</Label>
          <Input
            className="mt-1"
            value={invoiceDiscountNote}
            onChange={(e) => onInvoiceDiscountNoteChange(e.target.value)}
            placeholder="e.g. Volume discount — large order"
            disabled={invoiceDiscount <= 0}
          />
        </div>
      </div>

      {onLoyaltyDiscountWaivedChange && (
        <div className="mt-4 rounded-2xl border border-forest/10 bg-cream/50 p-4">
          <Checkbox
            checked={loyaltyDiscountWaived}
            onChange={onLoyaltyDiscountWaivedChange}
            label={
              <span className="text-sm text-ink/75">
                Remove <strong>{LOYALTY_DISCOUNT_LABEL}</strong> from this order
              </span>
            }
          />
          <p className="mt-2 text-xs text-ink/45">
            When checked, the customer will not receive the automatic 10% loyalty discount on this invoice, even if
            they qualify.
          </p>
        </div>
      )}
    </section>
  );
}
