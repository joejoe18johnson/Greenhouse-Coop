"use client";

import Link from "next/link";
import {
  Banknote,
  ClipboardList,
  PackageCheck,
  Sprout,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { getOrders, getProducts, getUsers } from "@/lib/store";
import { formatBZD } from "@/lib/utils";
import { ORDER_STATUSES, SHORT_SUPPLY_IDS } from "@/lib/constants";
import type { LucideIcon } from "lucide-react";
import type { OrderStatus } from "@/types";

export default function AdminHomePage() {
  const orders = getOrders();
  const products = getProducts();
  const customers = getUsers().filter((u) => u.role === "customer");
  const confirmed = ["Paid", "Processing", "Shipped", "Completed"];
  const revenue = orders.filter((o) => confirmed.includes(o.status)).reduce((s, o) => s + o.total, 0);
  const pendingPay = orders.filter((o) => o.status === "Payment Review" || o.status === "Payment Pending");
  const toFulfill = orders.filter((o) => o.status === "Paid" || o.status === "Processing");
  const sent = orders.filter((o) => o.status === "Shipped" || o.status === "Completed");
  const shortSupply = products.filter((p) => (SHORT_SUPPLY_IDS as readonly string[]).includes(p.id));

  const stats: { label: string; value: string; icon: LucideIcon; href: string }[] = [
    { label: "Orders", value: String(orders.length), icon: ClipboardList, href: "/admin/orders" },
    { label: "Revenue (confirmed)", value: formatBZD(revenue), icon: Wallet, href: "/admin/orders" },
    { label: "Awaiting payment", value: String(pendingPay.length), icon: Banknote, href: "/admin/payments" },
    { label: "To fulfill", value: String(toFulfill.length), icon: PackageCheck, href: "/admin/orders" },
    { label: "Customers", value: String(customers.length), icon: Users, href: "/admin/customers" },
    { label: "Catalog", value: String(products.length), icon: Sprout, href: "/admin/products" },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-forest-dark">Dashboard</h1>
      <p className="mt-2 text-sm text-ink/55">Orders, payments, customers, and fulfillment in one place.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-[24px] bg-white p-5 shadow-card transition hover:-translate-y-0.5">
            <s.icon className="h-5 w-5 text-leaf" />
            <p className="mt-3 text-xs uppercase tracking-[0.14em] text-ink/45">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold text-forest">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-semibold text-forest">Pipeline</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {ORDER_STATUSES.map((status) => {
            const count = orders.filter((o) => o.status === status).length;
            return (
              <div key={status} className="rounded-2xl bg-white p-4">
                <StatusBadge status={status as OrderStatus} />
                <p className="mt-3 text-2xl font-semibold text-forest-dark">{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[24px] bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-forest">Needs attention</h2>
            <Link href="/admin/payments" className="text-sm text-forest">Payments</Link>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {pendingPay.slice(0, 6).map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between rounded-xl p-3 hover:bg-cream">
                <span>
                  <span className="font-medium text-forest">{o.reference}</span>
                  <span className="mt-0.5 block text-xs text-ink/50">
                    {o.shipping.firstName} {o.shipping.lastName} · {o.shipping.phone}
                  </span>
                </span>
                <span className="text-right">
                  <StatusBadge status={o.status} />
                  <span className="mt-1 block">{formatBZD(o.total)}</span>
                </span>
              </Link>
            ))}
            {pendingPay.length === 0 && <p className="text-ink/50">No payments waiting.</p>}
          </div>
        </section>

        <section className="rounded-[24px] bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-forest">
              <Truck className="h-4 w-4" /> Fulfillment
            </h2>
            <Link href="/admin/orders" className="text-sm text-forest">Orders</Link>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {[...toFulfill, ...sent.filter((o) => o.status === "Shipped")].slice(0, 6).map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between rounded-xl p-3 hover:bg-cream">
                <span>
                  <span className="font-medium text-forest">{o.reference}</span>
                  <span className="mt-0.5 block text-xs text-ink/50">
                    {o.shipping.firstName} {o.shipping.lastName} · {o.shipping.town}
                  </span>
                </span>
                <StatusBadge status={o.status} />
              </Link>
            ))}
            {toFulfill.length === 0 && sent.filter((o) => o.status === "Shipped").length === 0 && (
              <p className="text-ink/50">Nothing to fulfill right now.</p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-[24px] bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-forest">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-forest">View all</Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.12em] text-ink/45">
              <tr>
                <th className="pb-2 pr-3">Reference</th>
                <th className="pb-2 pr-3">Customer</th>
                <th className="pb-2 pr-3">Fulfillment</th>
                <th className="pb-2 pr-3">Status</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((o) => (
                <tr key={o.id} className="border-t border-forest/5">
                  <td className="py-3 pr-3">
                    <Link className="font-medium text-forest" href={`/admin/orders/${o.id}`}>{o.reference}</Link>
                  </td>
                  <td className="py-3 pr-3">{o.shipping.firstName} {o.shipping.lastName}</td>
                  <td className="py-3 pr-3 capitalize">{o.shipping.method}</td>
                  <td className="py-3 pr-3"><StatusBadge status={o.status} /></td>
                  <td className="py-3 text-right">{formatBZD(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {shortSupply.length > 0 && (
        <p className="mt-6 text-sm text-ink/55">
          Always short supply: {shortSupply.map((p) => p.name).join(", ")}.
        </p>
      )}
    </div>
  );
}
