"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { getOrders } from "@/lib/store";
import { formatBZD } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const orders = getOrders().filter(
    (o) => o.status === "Payment Review" || o.status === "Payment Pending"
  );
  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-forest-dark">Payments</h1>
      <p className="mt-2 text-sm text-ink/55">Confirm bank transfers from WhatsApp, then an invoice is issued automatically.</p>
      <div className="mt-6 space-y-3">
        {orders.map((o) => (
          <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between rounded-[24px] bg-white p-5">
            <div>
              <p className="font-semibold text-forest keep-case">{o.reference}</p>
              <p className="text-sm text-ink/50">
                {o.shipping.firstName} {o.shipping.lastName} ·{" "}
                <span className="keep-case">{o.shipping.phone} · {o.shipping.email}</span>
              </p>
            </div>
            <div className="text-right">
              <StatusBadge status={o.status} />
              <p className="mt-2">{formatBZD(o.total)}</p>
            </div>
          </Link>
        ))}
        {orders.length === 0 && <p className="text-ink/50">No payments waiting.</p>}
      </div>
    </div>
  );
}
