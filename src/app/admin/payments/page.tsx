"use client";

import Link from "next/link";
import { getOrders } from "@/lib/store";
import { formatBZD } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const orders = getOrders().filter((o) => o.status === "Payment Review" || o.status === "Payment Pending" || o.payment.proofDataUrl);
  return (
    <div>
      <h1 className="font-display text-4xl text-forest-dark">Payments</h1>
      <div className="mt-6 space-y-3">
        {orders.map((o) => (
          <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between rounded-[24px] bg-white p-5">
            <div>
              <p className="font-semibold text-forest">{o.reference}</p>
              <p className="text-sm text-ink/50">Proof via WhatsApp · {o.status}</p>
            </div>
            <p>{formatBZD(o.total)}</p>
          </Link>
        ))}
        {orders.length === 0 && <p className="text-ink/50">No payment activity yet.</p>}
      </div>
    </div>
  );
}
