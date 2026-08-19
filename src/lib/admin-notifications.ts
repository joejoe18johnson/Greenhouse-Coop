import { getOrders, getUsers } from "@/lib/store";
import { getItem, setItem } from "@/lib/storage";
import { formatBZD } from "@/lib/utils";
import type { Order, OrderStatus, User } from "@/types";

export type AdminNotificationKind = "order" | "customer";

export interface AdminNotification {
  id: string;
  kind: AdminNotificationKind;
  headline: string;
  message: string;
  at: string;
  href: string;
  orderId?: string;
  reference?: string;
  customerId?: string;
}

function readStateKey(adminId: string) {
  return `adminNotificationRead:${adminId}`;
}

function initKey(adminId: string) {
  return `adminNotificationInit:${adminId}`;
}

export function pushPromptDismissedKey(adminId: string) {
  return `adminPushPromptDismissed:${adminId}`;
}

export function adminPushEnabledKey(adminId: string) {
  return `adminPushEnabled:${adminId}`;
}

export function isAdminPushEnabled(adminId: string) {
  return getItem(adminPushEnabledKey(adminId), false);
}

export function setAdminPushEnabled(adminId: string, enabled: boolean) {
  setItem(adminPushEnabledKey(adminId), enabled);
}

function orderHeadline(status: OrderStatus | string, order: Order) {
  switch (status) {
    case "Payment Pending":
      return "New order placed";
    case "Payment Review":
      return "Payment proof to review";
    case "Paid":
      return "Payment verified";
    case "Processing":
      return "Order ready to prepare";
    case "Shipped":
      return "Order shipped or ready";
    case "Completed":
      return "Order completed";
    case "Refunded":
      return "Order refunded";
    default:
      return `Order update · ${order.reference}`;
  }
}

function orderMessage(status: OrderStatus | string, order: Order, note?: string) {
  if (note?.trim()) return note.trim();

  const customer = getUsers().find((u) => u.id === order.userId);
  const name = customer ? `${customer.firstName} ${customer.lastName}` : "Customer";
  const fulfillment =
    order.shipping.method === "pickup"
      ? "pickup"
      : order.shipping.method === "local"
        ? `local delivery · ${order.shipping.town}`
        : `courier · ${order.shipping.town}`;

  switch (status) {
    case "Payment Pending":
      return `${name} placed order ${order.reference} · ${formatBZD(order.total)} · ${fulfillment}`;
    case "Payment Review":
      return `${name} submitted payment for ${order.reference} — review in Payments`;
    case "Paid":
      return `${order.reference} is paid (${formatBZD(order.total)}) · move to fulfillment`;
    default:
      return `${order.reference} · ${name} · ${fulfillment}`;
  }
}

function customerMessage(user: User) {
  return `${user.firstName} ${user.lastName} signed up · ${user.email}`;
}

/** Marks existing orders and customers as seen — only future activity notifies. */
export function ensureAdminNotificationBaseline(adminId: string) {
  if (getItem(initKey(adminId), false)) return;

  const baseline: Record<string, string> = {};

  for (const order of getOrders()) {
    const latest = order.timeline.at(-1);
    if (latest) baseline[`order:${order.id}`] = latest.at;
  }

  for (const user of getUsers().filter((entry) => entry.role === "customer")) {
    baseline[`customer:${user.id}`] = user.createdAt;
  }

  setItem(readStateKey(adminId), baseline);
  setItem(initKey(adminId), true);
}

export function getAdminNotifications(adminId: string): AdminNotification[] {
  const readState = getItem<Record<string, string>>(readStateKey(adminId), {});
  const notifications: AdminNotification[] = [];

  for (const order of getOrders()) {
    for (const event of order.timeline) {
      const readAt = readState[`order:${order.id}`];
      if (readAt && new Date(event.at) <= new Date(readAt)) continue;

      const status = event.status as OrderStatus;

      notifications.push({
        id: `order-${order.id}-${event.at}`,
        kind: "order",
        headline: orderHeadline(status, order),
        message: orderMessage(status, order, event.note),
        at: event.at,
        href: status === "Payment Pending" || status === "Payment Review" ? "/admin/payments" : `/admin/orders/${order.id}`,
        orderId: order.id,
        reference: order.reference,
      });
    }
  }

  for (const user of getUsers().filter((entry) => entry.role === "customer")) {
    const readAt = readState[`customer:${user.id}`];
    if (readAt && new Date(user.createdAt) <= new Date(readAt)) continue;

    notifications.push({
      id: `customer-${user.id}`,
      kind: "customer",
      headline: "New customer account",
      message: customerMessage(user),
      at: user.createdAt,
      href: "/admin/customers",
      customerId: user.id,
    });
  }

  return notifications.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function markAdminNotificationsRead(adminId: string, ids: AdminNotification[]) {
  const readState = getItem<Record<string, string>>(readStateKey(adminId), {});

  for (const entry of ids) {
    if (entry.kind === "order" && entry.orderId) {
      readState[`order:${entry.orderId}`] = entry.at;
    }
    if (entry.kind === "customer" && entry.customerId) {
      readState[`customer:${entry.customerId}`] = entry.at;
    }
  }

  setItem(readStateKey(adminId), readState);
}

export function markAllAdminNotificationsRead(adminId: string) {
  markAdminNotificationsRead(adminId, getAdminNotifications(adminId));
}

export function markAdminOrderNotificationsRead(adminId: string, orderId: string) {
  const order = getOrders().find((entry) => entry.id === orderId);
  if (!order) return;

  const latest = order.timeline.at(-1);
  if (!latest) return;

  markAdminNotificationsRead(adminId, [
    {
      id: `order-${order.id}-${latest.at}`,
      kind: "order",
      headline: "",
      message: "",
      at: latest.at,
      href: `/admin/orders/${order.id}`,
      orderId: order.id,
      reference: order.reference,
    },
  ]);
}
