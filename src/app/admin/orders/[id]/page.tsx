"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_STATUSES } from "@/lib/constants";
import { getOrders, getUsers, updateOrder, updateOrderStatus } from "@/lib/store";
import { fulfillmentLabel } from "@/lib/shipping";
import { formatBZD } from "@/lib/utils";
import type { OrderStatus } from "@/types";

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setTick] = useState(0);
  const order = getOrders().find((o) => o.id === id);
  const customer = order ? getUsers().find((u) => u.id === order.userId) : null;
  const [reason, setReason] = useState("");

  if (!order) return <p>Order not found.</p>;

  function refresh() {
    setTick((n) => n + 1);
  }

  return (
    <div>
      <Button variant="ghost" asChild><Link href="/admin/orders">← Orders</Link></Button>
      <h1 className="mt-4 font-display text-4xl text-forest-dark">{order.reference}</h1>
      <p className="text-ink/50">{order.status} · {customer?.firstName} {customer?.lastName} · {customer?.email}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {ORDER_STATUSES.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={order.status === status ? "default" : "outline"}
            onClick={() => { updateOrderStatus(order.id, status as OrderStatus, `Status set to ${status}`); refresh(); }}
          >
            {status}
          </Button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] bg-white p-6">
          <h2 className="font-semibold text-forest">Payment proof</h2>
          <p className="mt-3 text-sm text-ink/70">
            Customers send transfer screenshots on WhatsApp with their reference number. Check WhatsApp for {order.reference}
            {customer?.phone ? ` · ${customer.phone}` : ""}.
          </p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => { updateOrderStatus(order.id, "Paid", "Payment approved"); refresh(); }}>Approve payment</Button>
            <Button variant="outline" onClick={() => {
              updateOrder({ ...order, status: "Payment Pending", payment: { ...order.payment, rejectionReason: reason } });
              updateOrderStatus(order.id, "Payment Pending", reason || "Payment rejected");
              refresh();
            }}>Reject</Button>
          </div>
          <Textarea className="mt-3" placeholder="Rejection reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <div className="rounded-[24px] bg-white p-6 text-sm">
          <h2 className="font-semibold text-forest">Fulfillment</h2>
          <p className="mt-3">{order.shipping.fullAddress}</p>
          {order.shipping.method !== "pickup" && (
            <p>{order.shipping.town}, {order.shipping.district}</p>
          )}
          <p className="mt-2">{fulfillmentLabel(order.shipping)}</p>
          {order.shipping.method === "courier" && (
            <p className="mt-1 text-ink/60">Collect at the courier office in their area (office-to-office).</p>
          )}
          {order.shipping.method !== "pickup" && (
            <p className="mt-2">Box: {order.boxRecommendation.label}</p>
          )}
          <ul className="mt-4 space-y-1">
            {order.items.map((i) => (
              <li key={i.productId}>{i.name} × {i.quantity} — {formatBZD(i.price * i.quantity)}</li>
            ))}
          </ul>
          <p className="mt-4 font-semibold">Total {formatBZD(order.total)}</p>
        </div>
      </div>
    </div>
  );
}
