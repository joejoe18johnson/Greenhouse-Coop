"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminInvoicePricing } from "@/components/admin/admin-invoice-pricing";
import { useCouriers } from "@/hooks/use-couriers";
import { useIdsRates } from "@/hooks/use-ids-rates";
import { useProducts } from "@/hooks/use-products";
import { useShippingSettings } from "@/hooks/use-shipping-settings";
import {
  buildAdminOrderDiscountInput,
  buildAdminOrderEditPreview,
} from "@/lib/admin-order";
import { getOrders, updateAdminOrder } from "@/lib/store";
import { formatBZD } from "@/lib/utils";
import type { Order } from "@/types";

export function AdminOrderDiscountPanel({
  order,
  onSaved,
}: {
  order: Order;
  onSaved: () => void;
}) {
  const products = useProducts();
  const shipping = useShippingSettings();
  const couriers = useCouriers().filter((c) => c.active);
  const idsRates = useIdsRates();

  const [invoiceDiscount, setInvoiceDiscount] = useState(order.invoiceDiscount ?? 0);
  const [invoiceDiscountNote, setInvoiceDiscountNote] = useState(order.invoiceDiscountNote ?? "");
  const [loyaltyDiscountWaived, setLoyaltyDiscountWaived] = useState(order.loyaltyDiscountWaived ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setInvoiceDiscount(order.invoiceDiscount ?? 0);
    setInvoiceDiscountNote(order.invoiceDiscountNote ?? "");
    setLoyaltyDiscountWaived(order.loyaltyDiscountWaived ?? false);
  }, [order.id, order.updatedAt, order.invoiceDiscount, order.invoiceDiscountNote, order.loyaltyDiscountWaived]);

  const preview = useMemo(() => {
    try {
      const input = buildAdminOrderDiscountInput(order, {
        invoiceDiscount,
        invoiceDiscountNote,
        loyaltyDiscountWaived,
      });
      return buildAdminOrderEditPreview({
        existing: order,
        input,
        products,
        shipping,
        couriers,
        idsRates,
        orders: getOrders(),
      });
    } catch {
      return null;
    }
  }, [order, invoiceDiscount, invoiceDiscountNote, loyaltyDiscountWaived, products, shipping, couriers, idsRates]);

  const dirty =
    invoiceDiscount !== (order.invoiceDiscount ?? 0) ||
    invoiceDiscountNote !== (order.invoiceDiscountNote ?? "") ||
    loyaltyDiscountWaived !== (order.loyaltyDiscountWaived ?? false);

  async function save() {
    setError("");
    setSaving(true);
    try {
      const input = buildAdminOrderDiscountInput(order, {
        invoiceDiscount,
        invoiceDiscountNote,
        loyaltyDiscountWaived,
      });
      await updateAdminOrder(order.id, input);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save discount.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[24px] bg-white p-6 print:hidden">
      <AdminInvoicePricing
        compact
        invoiceDiscount={invoiceDiscount}
        invoiceDiscountNote={invoiceDiscountNote}
        loyaltyDiscountWaived={loyaltyDiscountWaived}
        onInvoiceDiscountChange={setInvoiceDiscount}
        onInvoiceDiscountNoteChange={setInvoiceDiscountNote}
        onLoyaltyDiscountWaivedChange={setLoyaltyDiscountWaived}
      />
      {preview && (
        <p className="mt-4 text-sm text-ink/60">
          New order total:{" "}
          <strong className="text-forest tabular-nums">{formatBZD(preview.total)}</strong>
          {preview.total !== order.total && (
            <span className="text-ink/45">
              {" "}
              (was {formatBZD(order.total)})
            </span>
          )}
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" disabled={!dirty || saving} onClick={() => void save()}>
          {saving ? "Saving…" : "Save discounts"}
        </Button>
        {dirty && (
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => {
              setInvoiceDiscount(order.invoiceDiscount ?? 0);
              setInvoiceDiscountNote(order.invoiceDiscountNote ?? "");
              setLoyaltyDiscountWaived(order.loyaltyDiscountWaived ?? false);
              setError("");
            }}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
