import { getOrders } from "@/lib/store";
import { getItem, setItem } from "@/lib/storage";
import {
  customerStatusDescription,
  customerStatusHeadline,
} from "@/lib/order-status-messages";
import type { OrderStatus } from "@/types";

export interface CustomerNotification {
  id: string;
  orderId: string;
  reference: string;
  status: OrderStatus;
  headline: string;
  message: string;
  at: string;
}

function readStateKey(userId: string) {
  return `notificationRead:${userId}`;
}

function initKey(userId: string) {
  return `notificationReadInit:${userId}`;
}

export function getNotificationReadState(userId: string): Record<string, string> {
  return getItem(readStateKey(userId), {});
}

/** Marks existing orders as seen so only future fulfillment updates notify. */
export function ensureNotificationBaseline(userId: string) {
  if (getItem(initKey(userId), false)) return;

  const baseline: Record<string, string> = {};
  for (const order of getOrders().filter((entry) => entry.userId === userId)) {
    baseline[order.id] = order.updatedAt;
  }
  setItem(readStateKey(userId), baseline);
  setItem(initKey(userId), true);
}

export function getCustomerNotifications(userId: string): CustomerNotification[] {
  const readState = getNotificationReadState(userId);
  const notifications: CustomerNotification[] = [];

  for (const order of getOrders().filter((entry) => entry.userId === userId)) {
    const latest = order.timeline.at(-1);
    if (!latest) continue;

    const readAt = readState[order.id];
    if (readAt && new Date(latest.at) <= new Date(readAt)) continue;

    const status = latest.status as OrderStatus;

    notifications.push({
      id: `${order.id}-${latest.at}`,
      orderId: order.id,
      reference: order.reference,
      status,
      headline: customerStatusHeadline(status),
      message: latest.note || customerStatusDescription(status),
      at: latest.at,
    });
  }

  return notifications.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
}

export function markNotificationsRead(userId: string, orderIds: string[]) {
  const readState = getNotificationReadState(userId);
  const orders = getOrders();

  for (const orderId of orderIds) {
    const order = orders.find((entry) => entry.id === orderId);
    if (order) readState[orderId] = order.updatedAt;
  }

  setItem(readStateKey(userId), readState);
}

export function markAllNotificationsRead(userId: string) {
  markNotificationsRead(
    userId,
    getOrders()
      .filter((order) => order.userId === userId)
      .map((order) => order.id)
  );
}
