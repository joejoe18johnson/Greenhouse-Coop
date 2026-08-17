"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { getOrders } from "@/lib/store";
import { formatBZD } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";
import type { OrderStatus } from "@/types";

export default function AdminOrdersPage() {
  const orders = getOrders();
  const [status, setStatus] = useState<string>("All");

  const filtered = useMemo(
    () => (status === "All" ? orders : orders.filter((o) => o.status === status)),
    [orders, status]
  );

  return (
    <div className="min-w-0">
      <h1 className="page-title font-semibold">Orders</h1>
      <p className="mt-2 text-sm text-ink/55">{orders.length} total · filter by stage</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["All", ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-2 text-xs font-semibold ${
              status === s ? "bg-forest text-cream" : "bg-white text-forest"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3 md:hidden">
        {filtered.map((o) => (
          <Link
            key={o.id}
            href={`/admin/orders/${o.id}`}
            className="block rounded-[24px] bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-forest keep-case">{o.reference}</p>
                <p className="mt-1 text-xs text-ink/45">{new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <StatusBadge status={o.status as OrderStatus} />
            </div>
            <p className="mt-3 text-sm">
              {o.shipping.firstName} {o.shipping.lastName}
            </p>
            <p className="text-xs text-ink/50 keep-case">{o.shipping.phone}</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="capitalize text-ink/60">{o.shipping.method}</span>
              <span className="font-semibold text-forest">{formatBZD(o.total)}</span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-ink/50">No orders in this stage.</p>}
      </div>

      <div className="mt-6 hidden overflow-x-auto rounded-[24px] bg-white md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs text-ink/45">
            <tr>
              <th className="p-4">Reference</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Fulfillment</th>
              <th className="p-4">Status</th>
              <th className="p-4">Invoice</th>
              <th className="p-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-forest/5">
                <td className="p-4">
                  <Link className="font-medium text-forest keep-case" href={`/admin/orders/${o.id}`}>{o.reference}</Link>
                  <p className="text-xs text-ink/40">{new Date(o.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="p-4">
                  {o.shipping.firstName} {o.shipping.lastName}
                  <p className="text-xs text-ink/45">{o.shipping.town}</p>
                </td>
                <td className="p-4 keep-case">
                  {o.shipping.phone}
                  <p className="text-xs text-ink/45">{o.shipping.email}</p>
                </td>
                <td className="p-4 capitalize">{o.shipping.method}</td>
                <td className="p-4"><StatusBadge status={o.status as OrderStatus} /></td>
                <td className="p-4 keep-case">{o.invoiceNumber}</td>
                <td className="p-4 text-right">{formatBZD(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-ink/50">No orders in this stage.</p>}
      </div>
    </div>
  );
}
