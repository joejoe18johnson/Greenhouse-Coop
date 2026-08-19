import type { OrderStatus } from "@/types";
import type { PaymentPlan } from "@/lib/order-deposit";

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
  Completed: "Order collected — thank you for shopping with Greenhouse Co-Op.",
  Refunded: "This order was refunded.",
};

export function customerTimelineNote(status: OrderStatus, note?: string) {
  return note?.trim() || CUSTOMER_TIMELINE_NOTES[status];
}

export function customerStatusHeadline(status: OrderStatus | string, paymentPlan: PaymentPlan = "deposit") {
  if (status === "Paid" && paymentPlan === "full") {
    return "Payment verified";
  }
  if (status in CUSTOMER_STATUS_HEADLINE) {
    return CUSTOMER_STATUS_HEADLINE[status as OrderStatus];
  }
  return String(status);
}

export function customerStatusDescription(status: OrderStatus, paymentPlan: PaymentPlan = "deposit") {
  if (status === "Payment Pending" && paymentPlan === "full") {
    return "Your order is placed. Transfer the full order total to Greenhouse Co-Op and send your proof on WhatsApp with your reference number.";
  }
  if (status === "Paid" && paymentPlan === "full") {
    return "Your full payment was verified and your order is secured. Nothing further is due to Greenhouse Co-Op at pickup.";
  }
  return CUSTOMER_STATUS_DESCRIPTION[status];
}
