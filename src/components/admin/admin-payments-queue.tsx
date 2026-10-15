"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { getOrders, updateOrderStatus } from "@/lib/store";
import { formatAmountDueNow, getPaymentPlan } from "@/lib/order-deposit";
import { formatBZD } from "@/lib/utils";
import type { Order } from "@/types";

export function AdminPaymentsQueue() {
  const [, setTick] = useState(0);
  const orders = getOrders();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function confirmPayment(order: Order) {
    const due = formatAmountDueNow(order.total, order.payment);
    if (
      !window.confirm(
        `Confirm ${due} received for order ${order.reference}? This marks the order Paid and unlocks fulfillment.`
      )
    ) {
      return;
    }
    setBusyId(order.id);
    setError("");
    try {
      await updateOrderStatus(order.id, "Paid", "Payment confirmed. Invoice issued.");
      setTick((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm payment.");
    } finally {
      setBusyId(null);
    }
  }

  const pending = orders.filter(
    (o) => o.status === "Payment Review" || o.status === "Payment Pending"
  );

  return (
    <div className="mt-6 space-y-3">
      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {pending.map((o) => (
        <div key={o.id} className="rounded-[24px] bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href={`/admin/orders/${o.id}`} className="min-w-0 flex-1">
              <p className="font-semibold text-forest keep-case">{o.reference}</p>
              <p className="text-sm text-ink/50">
                {o.shipping.firstName} {o.shipping.lastName} ·{" "}
                <span className="keep-case">
                  {o.shipping.phone} · {o.shipping.email}
                </span>
              </p>
            </Link>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <div className="text-right">
                <StatusBadge status={o.status} />
                <p className="mt-1">{formatAmountDueNow(o.total, o.payment)} due</p>
                <p className="text-xs text-ink/45">
                  {formatBZD(o.total)} total · {getPaymentPlan(o.payment) === "full" ? "full pay" : "deposit"}
                </p>
              </div>
              <Button
                size="sm"
                disabled={busyId === o.id}
                onClick={() => void confirmPayment(o)}
              >
                <CheckCircle2 className="h-4 w-4" />
                {busyId === o.id ? "Saving…" : "Confirm payment"}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/orders/${o.id}`}>Open order</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
      {pending.length === 0 && <p className="text-ink/50">No payments waiting.</p>}
    </div>
  );
}
