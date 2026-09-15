import { isCashOnDelivery } from "@/lib/order-deposit";
import type { Order, OrderStatus } from "@/types";

export type FulfillmentStep = {
  status: OrderStatus;
  label: string;
  actionLabel: string;
};

const BANK_STEPS: FulfillmentStep[] = [
  { status: "Payment Review", label: "Review payment", actionLabel: "Confirm payment" },
  { status: "Paid", label: "Paid", actionLabel: "Start preparing" },
  { status: "Processing", label: "Preparing", actionLabel: "Mark as sent" },
  { status: "Shipped", label: "Sent", actionLabel: "Mark complete" },
  { status: "Completed", label: "Complete", actionLabel: "Complete" },
];

const COD_STEPS: FulfillmentStep[] = [
  { status: "Processing", label: "Preparing", actionLabel: "Mark as sent" },
  { status: "Shipped", label: "Sent", actionLabel: "Mark complete" },
  { status: "Completed", label: "Complete", actionLabel: "Complete" },
];

/** Payment Pending is grouped with review — not shown as its own step. */
export function statusForFulfillmentStepper(status: OrderStatus): OrderStatus {
  if (status === "Payment Pending") return "Payment Review";
  return status;
}

export function fulfillmentStepsForOrder(order: Order): FulfillmentStep[] {
  return isCashOnDelivery(order.payment) ? COD_STEPS : BANK_STEPS;
}

export function fulfillmentStepIndex(order: Order): number {
  const steps = fulfillmentStepsForOrder(order);
  const normalized = statusForFulfillmentStepper(order.status);
  return steps.findIndex((step) => step.status === normalized);
}

export function nextFulfillmentStatus(order: Order): OrderStatus | null {
  const steps = fulfillmentStepsForOrder(order);
  const index = fulfillmentStepIndex(order);
  if (index < 0 || index >= steps.length - 1) return null;
  return steps[index + 1].status;
}

export function nextFulfillmentAction(order: Order): FulfillmentStep | null {
  const steps = fulfillmentStepsForOrder(order);
  const index = fulfillmentStepIndex(order);
  if (index < 0 || index >= steps.length - 1) return null;
  const current = steps[index];
  const upcoming = steps[index + 1];
  return {
    status: upcoming.status,
    label: upcoming.label,
    actionLabel: current.actionLabel,
  };
}

export function isFulfillmentComplete(order: Order) {
  return order.status === "Completed";
}

export function isFulfillmentTerminal(order: Order) {
  return ["Completed", "Cancelled", "Refunded"].includes(order.status);
}
