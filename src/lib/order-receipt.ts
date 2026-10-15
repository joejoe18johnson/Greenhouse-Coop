import type { OrderStatus } from "@/types";

const CONFIRMED_STATUSES: OrderStatus[] = ["Paid", "Processing", "Shipped", "Completed"];

export function orderPaymentConfirmed(status: OrderStatus | string) {
  return CONFIRMED_STATUSES.includes(status as OrderStatus);
}

/** Receipt / invoice PDF is available (including Payment Pending — for phone-in orders). */
export function orderShowsReceipt(status: OrderStatus | string) {
  return status !== "Cancelled" && status !== "Refunded";
}

export function receiptDocumentTitle(status: OrderStatus | string) {
  return orderPaymentConfirmed(status) ? "Invoice" : "Order receipt";
}

export function receiptDownloadLabel(status: OrderStatus | string) {
  return orderPaymentConfirmed(status) ? "Download invoice" : "Download receipt";
}
