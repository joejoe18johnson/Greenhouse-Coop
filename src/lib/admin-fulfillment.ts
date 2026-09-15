import type { Order, OrderStatus } from "@/types";

export type FulfillmentStep = {
  status: OrderStatus;
  label: string;
  actionLabel: string;
};

/** Simple 3-step fulfillment — same for every order once payment is cleared. */
export const FULFILLMENT_STEPS: FulfillmentStep[] = [
  { status: "Processing", label: "Preparing", actionLabel: "Start preparing" },
  { status: "Shipped", label: "Sent", actionLabel: "Mark as sent" },
  { status: "Completed", label: "Complete", actionLabel: "Mark complete" },
];

const FRIENDLY_STATUS: Partial<Record<OrderStatus, string>> = {
  Processing: "Preparing",
  Shipped: "Sent",
  Completed: "Complete",
};

export function fulfillmentStatusLabel(status: OrderStatus | string) {
  return FRIENDLY_STATUS[status as OrderStatus] ?? status;
}

export function canShowFulfillmentStepper(order: Order) {
  return (["Paid", "Processing", "Shipped", "Completed"] as OrderStatus[]).includes(order.status);
}

export function fulfillmentStepIndex(order: Order): number {
  if (order.status === "Completed") return 2;
  if (order.status === "Shipped") return 1;
  if (order.status === "Processing") return 0;
  return -1;
}

export function nextFulfillmentStatus(order: Order): OrderStatus | null {
  if (order.status === "Paid") return "Processing";
  if (order.status === "Processing") return "Shipped";
  if (order.status === "Shipped") return "Completed";
  return null;
}

export function nextFulfillmentAction(order: Order): FulfillmentStep | null {
  const nextStatus = nextFulfillmentStatus(order);
  if (!nextStatus) return null;

  if (order.status === "Paid") {
    return { status: "Processing", label: "Preparing", actionLabel: "Start preparing" };
  }
  if (order.status === "Processing") {
    return { status: "Shipped", label: "Sent", actionLabel: "Mark as sent" };
  }
  if (order.status === "Shipped") {
    return { status: "Completed", label: "Complete", actionLabel: "Mark complete" };
  }
  return null;
}

export function isFulfillmentComplete(order: Order) {
  return order.status === "Completed";
}

export function isFulfillmentActive(order: Order) {
  return (["Paid", "Processing", "Shipped"] as OrderStatus[]).includes(order.status);
}

export function isFulfillmentTerminal(order: Order) {
  return (["Completed", "Cancelled", "Refunded"] as OrderStatus[]).includes(order.status);
}
