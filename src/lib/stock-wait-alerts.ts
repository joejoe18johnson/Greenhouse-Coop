import { getProducts, getStockWaitRequests } from "@/lib/store";
import { getItem, setItem } from "@/lib/storage";
import { isInStock } from "@/lib/product-badges";
import type { StockWaitRequest, User } from "@/types";

export interface StockWaitAlert {
  id: string;
  productId: string;
  productName: string;
  headline: string;
  message: string;
}

function seenKey(userId: string) {
  return `stockWaitAlertSeen:${userId}`;
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 7) return `501${digits}`;
  return digits;
}

function matchesUser(entry: StockWaitRequest, user: Pick<User, "id" | "phone">) {
  if (entry.userId && entry.userId === user.id) return true;
  return normalizePhone(entry.phone) === normalizePhone(user.phone);
}

export function getStockWaitAlertsForUser(user: Pick<User, "id" | "phone">): StockWaitAlert[] {
  const seen = getItem<string[]>(seenKey(user.id), []);
  const products = getProducts();

  return getStockWaitRequests()
    .filter((entry) => entry.status === "pending")
    .filter((entry) => matchesUser(entry, user))
    .filter((entry) => !seen.includes(entry.id))
    .filter((entry) => {
      const product = products.find((p) => p.id === entry.productId);
      return product ? isInStock(product) : false;
    })
    .map((entry) => ({
      id: entry.id,
      productId: entry.productId,
      productName: entry.productName,
      headline: `${entry.productName} is back in stock`,
      message: `${entry.productName} is available again at Green House. Shop now before it sells out.`,
    }));
}

export function markStockWaitAlertSeen(userId: string, waitRequestId: string) {
  const key = seenKey(userId);
  const seen = getItem<string[]>(key, []);
  if (seen.includes(waitRequestId)) return;
  setItem(key, [...seen, waitRequestId]);
}

export function markAllStockWaitAlertsSeen(userId: string, waitRequestIds: string[]) {
  const key = seenKey(userId);
  const seen = new Set(getItem<string[]>(key, []));
  for (const id of waitRequestIds) seen.add(id);
  setItem(key, Array.from(seen));
}
