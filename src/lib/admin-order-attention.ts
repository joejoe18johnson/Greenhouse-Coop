import { isFulfillmentActive } from "@/lib/admin-fulfillment";
import type { Order, OrderStatus } from "@/types";

/** New bank orders and anything in the fulfillment pipeline. */
export function orderNeedsAdminAttention(order: Order) {
  if (order.status === "Payment Pending" || order.status === "Payment Review") return true;
  return isFulfillmentActive(order);
}

export function ordersNeedingAdminAttention(orders: Order[]) {
  return orders.filter(orderNeedsAdminAttention);
}

/** WhatsApp proof received — confirm transfer on Payments or the order page. */
export function orderNeedsPaymentReview(order: Order) {
  return order.status === "Payment Review";
}

export function sortOrdersNewestFirst(orders: Order[]) {
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function isNewPaymentPending(order: Order) {
  return order.status === "Payment Pending";
}

export function orderAttentionLabel(status: OrderStatus | string) {
  if (status === "Payment Pending") return "New order";
  if (status === "Payment Review") return "Review payment";
  return "Fulfillment";
}
