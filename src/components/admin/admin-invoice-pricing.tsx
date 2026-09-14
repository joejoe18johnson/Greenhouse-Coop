"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";

export function AdminInvoicePricing({
  invoiceDiscount,
  invoiceDiscountNote,
  onInvoiceDiscountChange,
  onInvoiceDiscountNoteChange,
}: {
  invoiceDiscount: number;
  invoiceDiscountNote: string;
  onInvoiceDiscountChange: (value: number) => void;
  onInvoiceDiscountNoteChange: (value: string) => void;
}) {
  return (
    <section className="rounded-[28px] bg-white p-6">
      <h2 className="font-display text-2xl text-forest">Invoice adjustment</h2>
      <p className="mt-2 text-sm text-ink/55">
        Optional flat discount on top of line prices — shown on the customer invoice.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Extra discount (BZD)</Label>
          <NumberInput
            className="mt-1"
            value={invoiceDiscount}
            min={0}
            onChange={onInvoiceDiscountChange}
          />
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
    </section>
  );
}
