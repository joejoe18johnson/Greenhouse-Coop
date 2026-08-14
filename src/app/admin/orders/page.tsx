"use client";

import Link from "next/link";
import { getOrders } from "@/lib/store";
import { formatBZD } from "@/lib/utils";

export default function AdminOrdersPage() {
  const orders = getOrders();
  return (
    <div>
      <h1 className="font-display text-4xl text-forest-dark">Orders</h1>
      <div className="mt-6 overflow-x-auto rounded-[24px] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-ink/45">
            <tr>
              <th className="p-4">Reference</th>
              <th className="p-4">Status</th>
              <th className="p-4">Total</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-forest/5">
                <td className="p-4">
                  <Link className="font-medium text-forest" href={`/admin/orders/${o.id}`}>{o.reference}</Link>
                </td>
                <td className="p-4">{o.status}</td>
                <td className="p-4">{formatBZD(o.total)}</td>
                <td className="p-4">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-6 text-ink/50">No orders yet.</p>}
      </div>
    </div>
  );
}
