import type { StockWaitRequest, StockWaitStatus } from "@/types";

export function pendingStockWaitRequests(requests: StockWaitRequest[]) {
  return requests
    .filter((entry) => entry.status === "pending")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function formatStockWaitPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 7) return `+501 ${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length === 11 && digits.startsWith("501")) {
    return `+501 ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone.trim();
}

export function stockWaitTelHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 7) return `tel:+501${digits}`;
  if (digits.length === 11 && digits.startsWith("501")) return `tel:+${digits}`;
  if (digits.startsWith("501")) return `tel:+${digits}`;
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function stockWaitWhatsAppHref(phone: string, productName: string) {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.length === 7 ? `501${digits}` : digits;
  const message = encodeURIComponent(
    `Hi ${productName.trim()} is back in stock at Green House — still interested?`
  );
  return `https://wa.me/${normalized}?text=${message}`;
}

export function isDuplicateStockWait(
  requests: StockWaitRequest[],
  productId: string,
  phone: string
) {
  const normalized = phone.replace(/\D/g, "");
  return requests.some(
    (entry) =>
      entry.status === "pending" &&
      entry.productId === productId &&
      entry.phone.replace(/\D/g, "") === normalized
  );
}

export function updateStockWaitStatus(
  requests: StockWaitRequest[],
  id: string,
  status: StockWaitStatus
) {
  const now = new Date().toISOString();
  return requests.map((entry) =>
    entry.id === id ? { ...entry, status, updatedAt: now } : entry
  );
}
