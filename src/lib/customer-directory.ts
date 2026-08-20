import { getOrders, getUsers } from "@/lib/store";

export interface CustomerDirectoryEntry {
  key: string;
  name: string;
  phone: string;
  email?: string;
  town?: string;
  district?: string;
  userId?: string;
  orderCount: number;
  hasAccount: boolean;
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase() || "";
}

function entryKey(email?: string, phone?: string, userId?: string) {
  if (userId) return `user:${userId}`;
  const mail = normalizeEmail(email);
  if (mail) return `email:${mail}`;
  const digits = normalizePhone(phone || "");
  if (digits) return `phone:${digits}`;
  return `unknown:${Math.random().toString(36).slice(2)}`;
}

export function getCustomerDirectory(): CustomerDirectoryEntry[] {
  const map = new Map<string, CustomerDirectoryEntry>();

  for (const user of getUsers().filter((u) => u.role === "customer")) {
    const address = user.addresses[0];
    const key = entryKey(user.email, user.phone, user.id);
    map.set(key, {
      key,
      name: `${user.firstName} ${user.lastName}`.trim(),
      phone: user.phone,
      email: user.email,
      town: address?.town,
      district: address?.district,
      userId: user.id,
      orderCount: getOrders().filter((o) => o.userId === user.id).length,
      hasAccount: true,
    });
  }

  for (const order of getOrders()) {
    const shipping = order.shipping;
    const user = getUsers().find((u) => u.id === order.userId);
    const email = shipping.email || user?.email;
    const phone = shipping.phone || user?.phone || "";
    const key = entryKey(email, phone, order.userId);

    const existing = map.get(key);
    if (existing) {
      existing.orderCount += 1;
      if (!existing.town && shipping.town) existing.town = shipping.town;
      if (!existing.district && shipping.district) existing.district = shipping.district;
      continue;
    }

    map.set(key, {
      key,
      name: `${shipping.firstName} ${shipping.lastName}`.trim(),
      phone,
      email,
      town: shipping.town,
      district: shipping.district,
      userId: order.userId,
      orderCount: 1,
      hasAccount: Boolean(user && user.role === "customer"),
    });
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}
