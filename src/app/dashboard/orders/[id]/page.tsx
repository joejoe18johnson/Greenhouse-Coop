"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InventoryNotice } from "@/components/product/inventory-notice";
import { useAuth } from "@/hooks/use-auth";
import { getBankDetails, getOrders } from "@/lib/store";
import { fulfillmentLabel } from "@/lib/shipping";
import { formatBZD } from "@/lib/utils";
import { PAYMENT_NOTICE } from "@/lib/constants";
import { whatsappPaymentLink } from "@/data/faq";
import { WhatsAppIcon } from "@/components/support/whatsapp-icon";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, ready } = useAuth();
  const router = useRouter();
  const order = getOrders().find((o) => o.id === id);
  const bank = getBankDetails();

  if (!ready) return null;
  if (!user) {
    router.push("/login");
    return null;
  }
  if (!order || (order.userId !== user.id && user.role !== "admin")) {
    return <div className="px-6 py-20 text-center">Order not found.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Button variant="ghost" asChild><Link href="/dashboard">← Back</Link></Button>
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-leaf">Order tracking</p>
      <h1 className="mt-2 font-display text-4xl text-forest-dark">{order.reference}</h1>
      <p className="mt-2 text-ink/55">{order.invoiceNumber} · {order.status}</p>

      <div className="mt-8 rounded-[28px] bg-citrus/10 p-5 text-sm">
        <p className="font-semibold text-forest">Next step: send proof on WhatsApp</p>
        <p className="mt-2">Your order is placed. Transfer the total, then send the screenshot here with reference <strong>{order.reference}</strong>.</p>
        <p className="mt-2">{PAYMENT_NOTICE}</p>
        <a
          href={whatsappPaymentLink(order.reference, formatBZD(order.total))}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebe5d]"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Send proof on WhatsApp
        </a>
        <p className="mt-2 text-xs text-ink/50">Attach your transfer screenshot in the chat. Do not upload files on this site.</p>
      </div>

      <ol className="mt-8 space-y-3">
        {order.timeline.map((event, i) => (
          <li key={i} className="rounded-2xl bg-white/80 p-4">
            <p className="font-medium text-forest">{event.status}</p>
            <p className="text-xs text-ink/50">{new Date(event.at).toLocaleString()}</p>
            {event.note && <p className="text-sm text-ink/65">{event.note}</p>}
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-[28px] bg-white/80 p-6">
        <h2 className="font-display text-2xl text-forest">Invoice {order.invoiceNumber}</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.productId} className="flex justify-between">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatBZD(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-forest/10 pt-4 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatBZD(order.subtotal)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{order.shipping.method === "pickup" ? "Collect" : formatBZD(order.deliveryFee)}</span></div>
          {order.courierFee > 0 && <div className="flex justify-between"><span>Courier</span><span>{formatBZD(order.courierFee)}</span></div>}
          {order.shipping.method !== "pickup" && (
            <div className="flex justify-between"><span>Box {order.boxRecommendation.label}</span><span>{formatBZD(order.boxFee)}</span></div>
          )}
          <div className="flex justify-between font-semibold"><span>Total</span><span>{formatBZD(order.total)}</span></div>
        </div>
        <p className="mt-4 text-sm text-ink/60">
          {order.shipping.method === "pickup"
            ? fulfillmentLabel(order.shipping)
            : `Ship to ${order.shipping.fullAddress}, ${order.shipping.town}, ${order.shipping.district} · ${fulfillmentLabel(order.shipping)}`}
          {order.shipping.method === "courier"
            ? ". Collect at the courier office in your area."
            : ""}
        </p>
        <p className="mt-3 text-sm">Pay to {bank.accountName} · {bank.bankName} · {bank.accountNumber}</p>
        <Button className="mt-6" variant="outline" onClick={() => window.print()}>Print invoice</Button>
      </div>
      <InventoryNotice className="mt-6" />
    </div>
  );
}
