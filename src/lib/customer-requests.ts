import type { CustomerRequest, CustomerRequestStatus } from "@/types";

export const CUSTOMER_REQUEST_STATUS_LABEL: Record<CustomerRequestStatus, string> = {
  pending: "Pending check",
  checking: "Checking nursery",
  found: "Available",
  notified: "Customer notified",
  closed: "Closed",
};

export function pendingCustomerRequests(requests: CustomerRequest[]) {
  return requests
    .filter((r) => r.status === "pending" || r.status === "checking")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updateCustomerRequestStatus(
  requests: CustomerRequest[],
  id: string,
  status: CustomerRequestStatus
) {
  const now = new Date().toISOString();
  return requests.map((entry) =>
    entry.id === id ? { ...entry, status, updatedAt: now } : entry
  );
}

export {
  formatStockWaitPhone as formatCustomerRequestPhone,
  stockWaitTelHref as customerRequestTelHref,
} from "@/lib/stock-wait-requests";

export function customerRequestWhatsAppHref(phone: string, productNames: string[]) {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.length === 7 ? `501${digits}` : digits;
  const list = productNames.length === 1 ? productNames[0] : productNames.join(", ");
  const message = encodeURIComponent(
    `Hi from Green House — we checked on ${list}. Let us know if you'd still like to order.`
  );
  return `https://wa.me/${normalized}?text=${message}`;
}
