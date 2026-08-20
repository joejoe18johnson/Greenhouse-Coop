import type { OrderStatus } from "@/types";
import {
  getPaymentPlan,
  isCashOnDelivery,
  type PaymentContext,
} from "@/lib/order-deposit";

export const CUSTOMER_STATUS_HEADLINE: Record<OrderStatus, string> = {
  "Payment Pending": "Awaiting your payment",
  "Payment Review": "Payment under review",
  Paid: "Deposit verified",
  Processing: "Preparing your order",
  Shipped: "Ready for pickup or in transit",
  Completed: "Order complete",
  Refunded: "Order refunded",
};

export const CUSTOMER_STATUS_DESCRIPTION: Record<OrderStatus, string> = {
  "Payment Pending":
    "Your order is placed. Transfer your 50% deposit to Greenhouse Co-Op and send your proof on WhatsApp with your reference number.",
  "Payment Review":
    "We received your payment proof and are verifying it. You will see an update here once payment is confirmed.",
  Paid: "Your deposit was verified and your order is secured. The remaining balance is due when you collect your trees.",
  Processing: "Your trees are being prepared for pickup or courier. We will notify you when they are on the way.",
  Shipped:
    "Your order has been sent or is ready at the pickup point. Check your fulfillment details below for collection instructions.",
  Completed: "Thank you — your order has been collected. We hope your new trees thrive in your garden.",
  Refunded: "This order was refunded. Contact us on WhatsApp if you have any questions.",
};

export const CUSTOMER_TIMELINE_NOTES: Record<OrderStatus, string> = {
  "Payment Pending": "Order placed. Transfer your 50% deposit and send proof on WhatsApp with your reference.",
  "Payment Review": "Deposit proof received — we are verifying your transfer.",
  Paid: "Deposit verified. Your order is secured — balance due at pickup.",
  Processing: "Your order is being prepared for pickup or courier.",
  Shipped: "Your order is on its way or ready at the pickup point.",
  Completed: "Order collected — thank you for shopping with Green House Co-Op.",
  Refunded: "This order was refunded.",
};

const COD_STATUS_HEADLINE: Partial<Record<OrderStatus, string>> = {
  Processing: "Order confirmed — cash on delivery",
  Shipped: "On the way — have cash ready",
  Paid: "Cash payment received",
  Completed: "Order complete",
};

const COD_STATUS_DESCRIPTION: Partial<Record<OrderStatus, string>> = {
  Processing:
    "Your order is confirmed. Pay the full order total in cash when we deliver or when you collect. No deposit required.",
  Shipped:
    "Your order is on its way or ready for collection. Please have the full order total in cash ready at handoff.",
  Paid: "We received your cash payment. Thank you.",
  Completed: "Thank you — your order has been collected. We hope your new trees thrive in your garden.",
};

const COD_TIMELINE_NOTES: Partial<Record<OrderStatus, string>> = {
  Processing: "Order placed — pay the full total in cash at delivery or collection.",
  Shipped: "Your order is on its way. Have cash ready for the full amount.",
  Paid: "Cash payment received.",
  Completed: "Order collected — thank you for shopping with Green House Co-Op.",
};

export function customerTimelineNote(status: OrderStatus, note?: string, payment?: PaymentContext) {
  if (note?.trim()) return note.trim();
  if (isCashOnDelivery(payment)) {
    return COD_TIMELINE_NOTES[status] ?? CUSTOMER_TIMELINE_NOTES[status];
  }
  return CUSTOMER_TIMELINE_NOTES[status];
}

export function customerStatusHeadline(status: OrderStatus | string, payment?: PaymentContext) {
  if (isCashOnDelivery(payment) && status in COD_STATUS_HEADLINE) {
    return COD_STATUS_HEADLINE[status as OrderStatus]!;
  }
  const plan = getPaymentPlan(payment);
  if (status === "Paid" && plan === "full") {
    return "Payment verified";
  }
  if (status in CUSTOMER_STATUS_HEADLINE) {
    return CUSTOMER_STATUS_HEADLINE[status as OrderStatus];
  }
  return String(status);
}

export function customerStatusDescription(status: OrderStatus, payment?: PaymentContext) {
  if (isCashOnDelivery(payment) && status in COD_STATUS_DESCRIPTION) {
    return COD_STATUS_DESCRIPTION[status]!;
  }
  const plan = getPaymentPlan(payment);
  if (status === "Payment Pending" && plan === "full") {
    return "Your order is placed. Transfer the full order total to Greenhouse Co-Op and send your proof on WhatsApp with your reference number.";
  }
  if (status === "Paid" && plan === "full") {
    return "Your full payment was verified and your order is secured. Nothing further is due to Greenhouse Co-Op at pickup.";
  }
  return CUSTOMER_STATUS_DESCRIPTION[status];
}
