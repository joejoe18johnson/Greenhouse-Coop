"use client";

import { useState } from "react";
import { Banknote, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateOrder, updateOrderStatus } from "@/lib/store";
import {
  formatAmountDueNow,
  formatOrderBalance,
  formatOrderDeposit,
  getPaymentPlan,
  isCashOnDelivery,
  orderAmountDueNow,
} from "@/lib/order-deposit";
import { formatBZD } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

export function AdminOrderPaymentPanel({
  order,
  onSaved,
  onError,
}: {
  order: Order;
  onSaved: () => void;
  onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");

  const isCod = isCashOnDelivery(order.payment);
  const plan = getPaymentPlan(order.payment);
  const dueNow = orderAmountDueNow(order.total, order.payment);
  const awaitingBank =
    !isCod && (order.status === "Payment Pending" || order.status === "Payment Review");
  const codAwaitingCash = isCod && order.status === "Processing";

  if (!awaitingBank && !codAwaitingCash) {
    return null;
  }

  async function transition(status: OrderStatus, note?: string) {
    setBusy(true);
    onError("");
    try {
      await updateOrderStatus(order.id, status, note);
      onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not update payment status.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmPaymentReceived() {
    const amountLabel = formatAmountDueNow(order.total, order.payment);
    const message =
      plan === "full"
        ? `Mark ${amountLabel} as received for order ${order.reference}? The customer will see payment confirmed and you can start fulfillment.`
        : `Mark the ${formatOrderDeposit(order.total)} deposit as received for order ${order.reference}? Balance ${formatOrderBalance(order.total)} stays due at pickup.`;

    if (!window.confirm(message)) return;
    await transition("Paid", "Payment confirmed. Invoice issued.");
  }

  async function markProofReceived() {
    if (order.status !== "Payment Pending") return;
    await transition("Payment Review", "Deposit proof received on WhatsApp — verifying transfer.");
  }

  async function rejectProof() {
    const note =
      reason.trim() ||
      "We could not verify your deposit. Please contact us or resubmit proof on WhatsApp.";
    setBusy(true);
    onError("");
    try {
      updateOrder({
        ...order,
        payment: { ...order.payment, rejectionReason: reason.trim() || undefined },
      });
      await updateOrderStatus(order.id, "Payment Pending", note);
      onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not reject payment.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmCodCashReceived() {
    if (
      !window.confirm(
        `Confirm you collected ${formatBZD(order.total)} in cash for order ${order.reference}?`
      )
    ) {
      return;
    }
    await transition("Paid", "Cash payment received at handoff.");
  }

  return (
    <div className="mt-6 rounded-[24px] border-2 border-citrus/35 bg-white p-5 print:hidden">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-forest">
            <Banknote className="h-4 w-4 shrink-0" />
            {awaitingBank ? "Confirm payment" : "Cash on delivery"}
          </p>
          <p className="mt-1 text-sm text-ink/60">
            {awaitingBank
              ? plan === "full"
                ? `Expecting ${formatBZD(dueNow)} in full via bank transfer.`
                : `Expecting ${formatOrderDeposit(order.total)} deposit · ${formatOrderBalance(order.total)} due at pickup.`
              : `Collect ${formatBZD(order.total)} in cash when this order is handed off.`}
          </p>
        </div>
        <span className="rounded-full bg-citrus/15 px-3 py-1 text-xs font-semibold text-citrus">
          {order.status}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {awaitingBank && (
          <>
            <Button disabled={busy} onClick={() => void confirmPaymentReceived()}>
              <CheckCircle2 className="h-4 w-4" />
              Confirm payment received
            </Button>
            {order.status === "Payment Pending" && (
              <Button variant="outline" disabled={busy} onClick={() => void markProofReceived()}>
                <MessageCircle className="h-4 w-4" />
                Proof received on WhatsApp
              </Button>
            )}
          </>
        )}
        {codAwaitingCash && (
          <Button disabled={busy} onClick={() => void confirmCodCashReceived()}>
            <CheckCircle2 className="h-4 w-4" />
            Cash collected
          </Button>
        )}
      </div>

      {awaitingBank && order.status === "Payment Review" && (
        <p className="mt-3 text-xs text-ink/50">
          Customer proof is on WhatsApp — confirm when the transfer matches reference{" "}
          <span className="keep-case font-medium text-forest">{order.reference}</span>.
        </p>
      )}

      {awaitingBank && (
        <div className="mt-5 border-t border-forest/10 pt-4">
          <p className="text-xs font-semibold text-ink/45">Reject or request new proof</p>
          <Textarea
            className="mt-2"
            placeholder="Rejection reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button
            variant="outline"
            className="mt-3 border-red-200 text-red-700 hover:bg-red-50"
            disabled={busy}
            onClick={() => void rejectProof()}
          >
            Reject payment proof
          </Button>
        </div>
      )}
    </div>
  );
}
