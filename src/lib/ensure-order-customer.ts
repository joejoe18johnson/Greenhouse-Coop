import { splitCustomerName } from "@/lib/split-customer-name";
import { createUser, getUsers } from "@/lib/store-local";
import type { AdminOrderCustomerInput } from "@/lib/admin-order";
import { generateId } from "@/lib/utils";

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function walkInEmail(phone: string) {
  const digits = normalizePhone(phone);
  return `customer+${digits || generateId("guest")}@orders.greenhousecoop.local`;
}

export function findCustomerUserId(customer: AdminOrderCustomerInput) {
  if (customer.userId) {
    const linked = getUsers().find((user) => user.id === customer.userId && user.role === "customer");
    if (linked) return linked.id;
  }

  const phone = normalizePhone(customer.phone);
  const email = customer.email?.trim().toLowerCase();

  return getUsers()
    .filter((user) => user.role === "customer")
    .find((user) => {
      if (email && user.email.toLowerCase() === email) return true;
      if (phone && normalizePhone(user.phone) === phone) return true;
      return false;
    })?.id;
}

/** Local/demo backend — create a lightweight customer record when needed. */
export function ensureOrderCustomerLocal(customer: AdminOrderCustomerInput) {
  const existing = findCustomerUserId(customer);
  if (existing) return existing;

  const { firstName, lastName } = splitCustomerName(customer.customerName);
  const created = createUser({
    firstName,
    lastName,
    email: customer.email?.trim() || walkInEmail(customer.phone),
    phone: customer.phone.trim(),
    addresses:
      customer.fullAddress.trim() ?
        [
          {
            id: generateId("addr"),
            label: "Primary",
            district: customer.district,
            town: customer.town,
            village: customer.village?.trim() || "",
            fullAddress: customer.fullAddress.trim(),
            isDefault: true,
          },
        ]
      : [],
  });

  return created.id;
}
