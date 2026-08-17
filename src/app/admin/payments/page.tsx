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
    <div className="min-w-0">
      <h1 className="page-title font-semibold">Payments</h1>
      <p className="mt-2 text-sm text-ink/55">Confirm bank transfers from WhatsApp, then an invoice is issued automatically.</p>
      <div className="mt-6 space-y-3">
        {orders.map((o) => (
          <Link key={o.id} href={`/admin/orders/${o.id}`} className="block rounded-[24px] bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-forest keep-case">{o.reference}</p>
                <p className="text-sm text-ink/50">
                  {o.shipping.firstName} {o.shipping.lastName} ·{" "}
                  <span className="keep-case">{o.shipping.phone} · {o.shipping.email}</span>
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:text-right">
                <StatusBadge status={o.status} />
                <p>{formatBZD(o.total)}</p>
              </div>
            </div>
          </Link>
        ))}
        {orders.length === 0 && <p className="text-ink/50">No payments waiting.</p>}
      </div>
    </div>
  );
}
