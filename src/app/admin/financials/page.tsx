"use client";

import Link from "next/link";
import { useState } from "react";
import { BarChart3, Package, Sprout, Truck, Wallet } from "lucide-react";
import { getOrders } from "@/lib/store";
import { summarizeFinancials } from "@/lib/financials";
import { formatBZD } from "@/lib/utils";

export default function AdminFinancialsPage() {
  const [, setTick] = useState(0);
  const summary = summarizeFinancials(getOrders());

  function refresh() {
    setTick((n) => n + 1);
  }

  return (
    <div className="min-w-0">
      <h1 className="page-title font-semibold">Financials</h1>
      <p className="mt-2 text-sm text-ink/55">
        Confirmed revenue from real orders only. Test and demo orders stay in the database but are excluded here.
      </p>

      {summary.excludedCount > 0 && (
        <p className="mt-3 rounded-2xl bg-citrus/10 px-4 py-3 text-sm text-ink/70">
          {summary.excludedCount} paid test/demo order{summary.excludedCount === 1 ? "" : "s"} excluded from these totals.
          Toggle per order under <Link href="/admin/orders" className="font-medium text-forest underline">Orders</Link>.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[24px] bg-white p-5 shadow-card">
          <Wallet className="h-5 w-5 text-leaf" />
          <p className="mt-3 text-xs text-ink/45">Total revenue</p>
          <p className="mt-2 text-2xl font-semibold text-forest">{formatBZD(summary.totalRevenue)}</p>
          <p className="mt-1 text-xs text-ink/50">{summary.orderCount} confirmed invoice{summary.orderCount === 1 ? "" : "s"}</p>
        </div>
        <div className="rounded-[24px] bg-white p-5 shadow-card">
          <Sprout className="h-5 w-5 text-leaf" />
          <p className="mt-3 text-xs text-ink/45">Plant sales</p>
          <p className="mt-2 text-2xl font-semibold text-forest">{formatBZD(summary.plantRevenue)}</p>
        </div>
        <div className="rounded-[24px] bg-white p-5 shadow-card">
          <Truck className="h-5 w-5 text-leaf" />
          <p className="mt-3 text-xs text-ink/45">Shipping & boxes</p>
          <p className="mt-2 text-2xl font-semibold text-forest">{formatBZD(summary.shippingRevenue)}</p>
        </div>
        <div className="rounded-[24px] bg-white p-5 shadow-card">
          <BarChart3 className="h-5 w-5 text-leaf" />
          <p className="mt-3 text-xs text-ink/45">Gross profit</p>
          <p className="mt-2 text-2xl font-semibold text-forest">{formatBZD(summary.grossProfit)}</p>
          <p className="mt-1 text-xs text-ink/50">COGS {formatBZD(summary.totalCogs)}</p>
        </div>
      </div>

      <section className="mt-8 rounded-[24px] bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-semibold text-forest">
            <Package className="h-4 w-4" />
            Profit by invoice
          </h2>
          <button type="button" onClick={refresh} className="text-sm text-forest underline">
            Refresh
          </button>
        </div>
        <p className="mt-1 text-xs text-ink/50">
          Nursery cost (left column on supplier list) × qty = COGS. Shipping revenue is delivery + box fees.
        </p>

        {summary.invoices.length === 0 ? (
          <p className="mt-6 text-sm text-ink/50">No confirmed revenue yet.</p>
        ) : (
          <>
            <div className="mt-6 space-y-3 md:hidden">
              {summary.invoices.map((row) => (
                <Link
                  key={row.order.id}
                  href={`/admin/orders/${row.order.id}`}
                  className="block rounded-2xl border border-forest/8 p-4 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-forest keep-case">{row.order.reference}</p>
                      <p className="text-xs text-ink/50 keep-case">{row.order.invoiceNumber}</p>
                      <p className="mt-1">
                        {row.order.shipping.firstName} {row.order.shipping.lastName}
                      </p>
                    </div>
                    <p className="font-semibold text-forest">{formatBZD(row.grossProfit)}</p>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-ink/60">
                    <div>
                      <dt>Plants</dt>
                      <dd className="font-medium text-ink">{formatBZD(row.plantRevenue)}</dd>
                    </div>
                    <div>
                      <dt>Shipping</dt>
                      <dd className="font-medium text-ink">{formatBZD(row.shippingRevenue)}</dd>
                    </div>
                    <div>
                      <dt>COGS</dt>
                      <dd className="font-medium text-ink">
                        {formatBZD(row.cogs)}
                        {row.cogsUnknown && " *"}
                      </dd>
                    </div>
                    <div>
                      <dt>Total</dt>
                      <dd className="font-medium text-ink">{formatBZD(row.totalRevenue)}</dd>
                    </div>
                  </dl>
                </Link>
              ))}
            </div>

            <div className="mt-6 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs text-ink/45">
                  <tr>
                    <th className="pb-2 pr-3">Invoice</th>
                    <th className="pb-2 pr-3">Customer</th>
                    <th className="pb-2 pr-3 text-right">Plants</th>
                    <th className="pb-2 pr-3 text-right">Shipping</th>
                    <th className="pb-2 pr-3 text-right">Revenue</th>
                    <th className="pb-2 pr-3 text-right">COGS</th>
                    <th className="pb-2 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.invoices.map((row) => (
                    <tr key={row.order.id} className="border-t border-forest/5">
                      <td className="py-3 pr-3">
                        <Link href={`/admin/orders/${row.order.id}`} className="font-medium text-forest keep-case">
                          {row.order.reference}
                        </Link>
                        <p className="text-xs text-ink/45 keep-case">{row.order.invoiceNumber}</p>
                      </td>
                      <td className="py-3 pr-3">
                        {row.order.shipping.firstName} {row.order.shipping.lastName}
                        <p className="text-xs text-ink/45">
                          {new Date(row.order.createdAt).toLocaleDateString("en-BZ")}
                        </p>
                      </td>
                      <td className="py-3 pr-3 text-right tabular-nums">{formatBZD(row.plantRevenue)}</td>
                      <td className="py-3 pr-3 text-right tabular-nums">{formatBZD(row.shippingRevenue)}</td>
                      <td className="py-3 pr-3 text-right tabular-nums">{formatBZD(row.totalRevenue)}</td>
                      <td className="py-3 pr-3 text-right tabular-nums">
                        {formatBZD(row.cogs)}
                        {row.cogsUnknown && <span className="text-ink/40"> *</span>}
                      </td>
                      <td className="py-3 text-right font-semibold tabular-nums text-forest">
                        {formatBZD(row.grossProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {summary.invoices.some((row) => row.cogsUnknown) && (
              <p className="mt-3 text-xs text-ink/45">* Some line items missing nursery cost — profit may be understated.</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
