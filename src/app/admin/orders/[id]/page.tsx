"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Mail, MapPin, Phone, Printer, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { OrderInvoice } from "@/components/invoice/order-invoice";
import { ORDER_STATUSES } from "@/lib/constants";
import { getBankDetails, getOrders, getUsers, updateOrder, updateOrderStatus } from "@/lib/store";
import { fulfillmentLabel } from "@/lib/shipping";
import { formatBZD } from "@/lib/utils";
import { COURIER_ESTIMATE_NOTICE } from "@/lib/constants";
import type { OrderStatus } from "@/types";

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setTick] = useState(0);
  const order = getOrders().find((o) => o.id === id);
  const customer = order ? getUsers().find((u) => u.id === order.userId) : null;
  const bank = getBankDetails();
  const [reason, setReason] = useState("");

  if (!order) return <p>Order not found.</p>;

  function refresh() {
    setTick((n) => n + 1);
  }

  const invoiceReady = ["Paid", "Processing", "Shipped", "Completed"].includes(order.status);
  const courierEstimate =
    order.courierEstimate ?? (order as typeof order & { courierFee?: number }).courierFee ?? 0;

  return (
    <div>
      <Button variant="ghost" className="print:hidden" asChild>
        <Link href="/admin/orders">
          <ArrowLeft className="h-4 w-4" />
          Orders
        </Link>
      </Button>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-display text-4xl font-semibold text-forest-dark keep-case">{order.reference}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-ink/50">
            <StatusBadge status={order.status} />
            <span className="keep-case">{order.invoiceNumber}</span> · {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {order.status === "Payment Pending" || order.status === "Payment Review" ? (
            <Button onClick={() => { updateOrderStatus(order.id, "Paid", "Payment confirmed. Invoice issued."); refresh(); }}>
              Confirm payment
            </Button>
          ) : null}
          {order.status === "Paid" && (
            <Button onClick={() => { updateOrderStatus(order.id, "Processing", "Order confirmed for fulfillment."); refresh(); }}>
              Fulfill order
            </Button>
          )}
          {order.status === "Processing" && (
            <Button onClick={() => { updateOrderStatus(order.id, "Shipped", "Order sent."); refresh(); }}>
              Mark as sent
            </Button>
          )}
          {order.status === "Shipped" && (
            <Button onClick={() => { updateOrderStatus(order.id, "Completed", "Order completed."); refresh(); }}>
              Complete
            </Button>
          )}
          {invoiceReady && (
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print invoice
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 print:hidden">
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

      <div className="mt-8 grid gap-6 lg:grid-cols-2 print:hidden">
        <div className="rounded-[24px] bg-white p-6 text-sm">
          <h2 className="flex items-center gap-2 font-semibold text-forest">
            <UserRound className="h-4 w-4" /> Customer
          </h2>
          <p className="mt-3 text-base font-medium text-forest-dark">
            {order.shipping.firstName} {order.shipping.lastName}
          </p>
          <p className="mt-2 flex items-center gap-2 text-ink/70 keep-case">
            <Mail className="h-4 w-4 text-leaf" /> {order.shipping.email}
          </p>
          <p className="mt-1 flex items-center gap-2 text-ink/70 keep-case">
            <Phone className="h-4 w-4 text-leaf" /> {order.shipping.phone}
          </p>
          {customer && (
            <p className="mt-3 text-xs text-ink/45">
              Account created {new Date(customer.createdAt).toLocaleDateString()} · {customer.role}
            </p>
          )}
          {customer?.addresses?.length ? (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-ink/40">Saved addresses</p>
              {customer.addresses.map((a) => (
                <p key={a.id} className="text-ink/65">
                  {a.label}: {a.fullAddress}, {a.town}, {a.district}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-[24px] bg-white p-6 text-sm">
          <h2 className="flex items-center gap-2 font-semibold text-forest">
            <MapPin className="h-4 w-4" /> Fulfillment
          </h2>
          <p className="mt-3 font-medium">{fulfillmentLabel(order.shipping)}</p>
          <p className="mt-2">{order.shipping.fullAddress}</p>
          {order.shipping.method !== "pickup" && (
            <p>{order.shipping.village ? `${order.shipping.village}, ` : ""}{order.shipping.town}, {order.shipping.district}</p>
          )}
          {order.shipping.method === "courier" && (
            <>
              <p className="mt-1 text-ink/60">Collect at the courier office in their area (office-to-office).</p>
              {courierEstimate > 0 && (
                <p className="mt-2 rounded-xl bg-citrus/10 px-3 py-2 text-ink/70">
                  Approx. {formatBZD(courierEstimate)} at {order.shipping.courierName || "courier"} — customer pays at courier, not on this invoice.
                </p>
              )}
            </>
          )}
          {order.shipping.method !== "pickup" && (
            <p className="mt-2">Box: {order.boxRecommendation.label}</p>
          )}
          <ul className="mt-4 space-y-1">
            {order.items.map((i) => (
              <li key={i.productId}>{i.name} × {i.quantity} — {formatBZD(i.price * i.quantity)}</li>
            ))}
            {order.deliveryFee > 0 && <li>Local delivery — {formatBZD(order.deliveryFee)}</li>}
            {order.boxFee > 0 && <li>Box — {formatBZD(order.boxFee)}</li>}
          </ul>
          <p className="mt-4 font-semibold">Total due {formatBZD(order.total)}</p>
          {courierEstimate > 0 && (
            <p className="mt-2 text-sm text-ink/55">
              + Approx. {formatBZD(courierEstimate)} at courier ({COURIER_ESTIMATE_NOTICE})
            </p>
          )}
        </div>

        <div className="rounded-[24px] bg-white p-6">
          <h2 className="font-semibold text-forest">Payment</h2>
          <p className="mt-3 text-sm text-ink/70">
            Bank transfer · proof on WhatsApp with reference <span className="keep-case">{order.reference}</span>
            {customer?.phone ? <> · <span className="keep-case">{customer.phone}</span></> : ""}.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => { updateOrderStatus(order.id, "Paid", "Payment confirmed. Invoice issued."); refresh(); }}>
              Confirm payment
            </Button>
            <Button variant="outline" onClick={() => {
              updateOrder({ ...order, status: "Payment Pending", payment: { ...order.payment, rejectionReason: reason } });
              updateOrderStatus(order.id, "Payment Pending", reason || "Payment rejected");
              refresh();
            }}>Reject</Button>
          </div>
          <Textarea className="mt-3" placeholder="Rejection reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        <div className="rounded-[24px] bg-white p-6">
          <h2 className="font-semibold text-forest">Timeline</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {order.timeline.map((event, i) => (
              <li key={i} className="rounded-xl bg-cream/80 p-3">
                <p className="font-medium text-forest">{event.status}</p>
                <p className="text-xs text-ink/45">{new Date(event.at).toLocaleString()}</p>
                {event.note && <p className="text-ink/65">{event.note}</p>}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {invoiceReady && (
        <div className="mt-8">
          <h2 className="mb-4 font-semibold text-forest print:hidden">Invoice</h2>
          <OrderInvoice order={order} customer={customer} bank={bank} />
        </div>
      )}
    </div>
  );
}
