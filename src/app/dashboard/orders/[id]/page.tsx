"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InventoryNotice } from "@/components/product/inventory-notice";
import { DownloadInvoiceButton } from "@/components/invoice/download-invoice-button";
import { OrderInvoice } from "@/components/invoice/order-invoice";
import { StatusBadge } from "@/components/ui/status-badge";
import { OrderStatusBanner } from "@/components/orders/order-status-banner";
import { useAuth } from "@/hooks/use-auth";
import { getBankDetails, getOrders } from "@/lib/store";
import { customerStatusHeadline } from "@/lib/order-status-messages";
import { formatBZD } from "@/lib/utils";
import { whatsappPaymentLink } from "@/data/faq";
import { WhatsAppIcon } from "@/components/support/whatsapp-icon";
import { PAYMENT_NOTICE, COURIER_ESTIMATE_NOTICE } from "@/lib/constants";
import { markNotificationsRead } from "@/lib/customer-notifications";
import { STORE_UPDATED_EVENT } from "@/lib/store-events";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, ready } = useAuth();
  const router = useRouter();
  const order = getOrders().find((o) => o.id === id);
  const bank = getBankDetails();

  useEffect(() => {
    if (!user || !order || order.userId !== user.id) return;
    markNotificationsRead(user.id, [order.id]);
    window.dispatchEvent(new Event(STORE_UPDATED_EVENT));
  }, [user, order?.id, order?.updatedAt]);

  if (!ready) return null;
  if (!user) {
    router.push("/login");
    return null;
  }

  if (!order || (order.userId !== user.id && user.role !== "admin")) {
    return <div className="px-6 py-20 text-center">Order not found.</div>;
  }

  const invoiceReady = ["Paid", "Processing", "Shipped", "Completed"].includes(order.status);
  const awaitingPay = order.status === "Payment Pending" || order.status === "Payment Review";
  const courierEstimate =
    order.courierEstimate ?? (order as typeof order & { courierFee?: number }).courierFee ?? 0;

  const invoiceId = `order-invoice-${order.id}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Button variant="ghost" className="print:hidden" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>
      <p className="mt-4 text-xs text-leaf print:hidden">Order tracking</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-display text-4xl font-semibold text-forest-dark keep-case">{order.reference}</h1>
          <p className="mt-2 flex items-center gap-2 text-ink/55">
            <StatusBadge status={order.status} />
            <span className="keep-case">{order.invoiceNumber}</span>
          </p>
        </div>
        {invoiceReady && (
          <DownloadInvoiceButton
            targetId={invoiceId}
            filename={`${order.invoiceNumber}.pdf`}
          />
        )}
      </div>

      {order.status === "Payment Review" && <OrderStatusBanner status={order.status} />}

      {awaitingPay && order.status === "Payment Pending" && (
        <div className="mt-8 rounded-[28px] bg-citrus/10 p-5 text-sm print:hidden">
          <p className="font-semibold text-forest">Next step: send proof on WhatsApp</p>
          <p className="mt-2">Your order is placed. Transfer <strong>{formatBZD(order.total)}</strong> to Greenhouse Co-Op, then send the screenshot here with reference <strong className="keep-case">{order.reference}</strong>.</p>
          {courierEstimate > 0 && (
            <p className="mt-2 text-ink/70">
              Approx. {formatBZD(courierEstimate)} at {order.shipping.courierName || "the courier"} is paid separately when you collect — not in this transfer.
            </p>
          )}
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
      )}

      {!awaitingPay && <OrderStatusBanner status={order.status} />}

      {order.shipping.method === "courier" && courierEstimate > 0 && !awaitingPay && (
        <p className="mt-6 rounded-2xl bg-leaf/10 px-4 py-3 text-sm text-forest print:hidden">
          Approx. {formatBZD(courierEstimate)} at {order.shipping.courierName || "courier"} when you collect. {COURIER_ESTIMATE_NOTICE}
        </p>
      )}
      {order.customerNotes && (
        <div className="mt-6 rounded-2xl bg-white/80 p-5 print:hidden">
          <p className="flex items-center gap-2 text-sm font-semibold text-forest">
            <MessageSquare className="h-4 w-4" />
            Your order notes
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink/70">{order.customerNotes}</p>
        </div>
      )}
      <ol className="mt-8 space-y-3 print:hidden">
        {order.timeline.map((event, i) => (
          <li key={i} className="rounded-2xl bg-white/80 p-4">
            <p className="font-medium text-forest">{customerStatusHeadline(event.status)}</p>
            <p className="text-xs text-ink/50">{new Date(event.at).toLocaleString()}</p>
            {event.note && <p className="text-sm text-ink/65">{event.note}</p>}
          </li>
        ))}
      </ol>

      <div className="mt-8">
        {invoiceReady ? (
          <OrderInvoice id={invoiceId} order={order} customer={user} bank={bank} />
        ) : (
          <p className="rounded-[24px] bg-white/80 p-6 text-sm text-ink/60 print:hidden">
            An invoice is created automatically when Greenhouse Co-Op confirms your payment.
          </p>
        )}
      </div>
      <InventoryNotice className="mt-6 print:hidden" />
    </div>
  );
}
