"use client";

import Link from "next/link";
import { getOrders, getProducts, getUsers } from "@/lib/store";
import { formatBZD } from "@/lib/utils";

export default function AdminHomePage() {
  const orders = getOrders();
  const products = getProducts();
  const customers = getUsers().filter((u) => u.role === "customer");
  const revenue = orders.filter((o) => ["Paid", "Processing", "Shipped", "Completed"].includes(o.status)).reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "Payment Review" || o.status === "Payment Pending").length;

  const stats = [
    { label: "Orders", value: String(orders.length) },
    { label: "Revenue (paid+)", value: formatBZD(revenue) },
    { label: "Payments to review", value: String(pending) },
    { label: "Products", value: String(products.length) },
    { label: "Customers", value: String(customers.length) },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl text-forest-dark">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[24px] bg-white p-5 shadow-card">
            <p className="text-xs uppercase tracking-[0.14em] text-ink/45">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold text-forest">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-[24px] bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-forest">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-forest">View all</Link>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          {orders.slice(0, 6).map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex justify-between rounded-xl p-3 hover:bg-cream">
              <span>{o.reference}</span>
              <span>{o.status}</span>
              <span>{formatBZD(o.total)}</span>
            </Link>
          ))}
          {orders.length === 0 && <p className="text-ink/50">No orders yet.</p>}
        </div>
      </div>
    </div>
  );
}
