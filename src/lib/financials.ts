import { DEMO_CUSTOMER_EMAIL, TEST_ORDER_REFERENCES } from "@/lib/constants";
import productCosts from "@/data/product-costs.json";
import type { Order, OrderStatus } from "@/types";

/** Paid-through-completed orders count toward revenue unless excluded. */
export const FINANCIALS_STATUSES: OrderStatus[] = [
  "Paid",
  "Processing",
  "Shipped",
  "Completed",
];

const DEMO_EMAILS = new Set([
  DEMO_CUSTOMER_EMAIL.toLowerCase(),
  "maya@greenhousebz.com",
  "customer@greenhousebz.com",
]);

const TEST_REFERENCES = new Set(TEST_ORDER_REFERENCES.map((ref) => ref.toUpperCase()));

const DEMO_USER_PREFIX = "user_demo_";

const costsById = productCosts as Record<string, number>;

export function getProductCost(productId: string): number | null {
  const cost = costsById[productId];
  return typeof cost === "number" ? cost : null;
}

export function isKnownTestOrder(order: Order) {
  return TEST_REFERENCES.has(order.reference.toUpperCase());
}

export function isDemoOrder(order: Order) {
  if (order.userId.startsWith(DEMO_USER_PREFIX)) return true;
  if (DEMO_EMAILS.has(order.shipping.email.toLowerCase())) return true;
  return false;
}

export function isTestOrder(order: Order) {
  return isKnownTestOrder(order) || isDemoOrder(order) || Boolean(order.excludeFromFinancials);
}

export function orderCountsInFinancials(order: Order) {
  if (isTestOrder(order)) return false;
  return FINANCIALS_STATUSES.includes(order.status);
}

export function orderPlantRevenue(order: Order) {
  return order.subtotal;
}

export function orderShippingRevenue(order: Order) {
  return order.deliveryFee + order.boxFee;
}

export function orderCogs(order: Order) {
  let total = 0;
  let hasUnknown = false;

  for (const item of order.items) {
    const unitCost = getProductCost(item.productId);
    if (unitCost === null) {
      hasUnknown = true;
      continue;
    }
    total += unitCost * item.quantity;
  }

  return { total, hasUnknown };
}

export interface InvoiceFinancials {
  order: Order;
  plantRevenue: number;
  shippingRevenue: number;
  totalRevenue: number;
  cogs: number;
  cogsUnknown: boolean;
  grossProfit: number;
}

export function invoiceFinancials(order: Order): InvoiceFinancials {
  const plantRevenue = orderPlantRevenue(order);
  const shippingRevenue = orderShippingRevenue(order);
  const { total: cogs, hasUnknown } = orderCogs(order);
  const totalRevenue = plantRevenue + shippingRevenue;
  const grossProfit = totalRevenue - cogs;

  return {
    order,
    plantRevenue,
    shippingRevenue,
    totalRevenue,
    cogs,
    cogsUnknown: hasUnknown,
    grossProfit,
  };
}

export function financialOrders(orders: Order[]) {
  return orders.filter(orderCountsInFinancials);
}

export function summarizeFinancials(orders: Order[]) {
  const eligible = financialOrders(orders).map(invoiceFinancials);

  return {
    orderCount: eligible.length,
    totalRevenue: eligible.reduce((sum, row) => sum + row.totalRevenue, 0),
    plantRevenue: eligible.reduce((sum, row) => sum + row.plantRevenue, 0),
    shippingRevenue: eligible.reduce((sum, row) => sum + row.shippingRevenue, 0),
    totalCogs: eligible.reduce((sum, row) => sum + row.cogs, 0),
    grossProfit: eligible.reduce((sum, row) => sum + row.grossProfit, 0),
    invoices: eligible.sort(
      (a, b) => new Date(b.order.createdAt).getTime() - new Date(a.order.createdAt).getTime()
    ),
    excludedCount: orders.filter((o) => !orderCountsInFinancials(o) && FINANCIALS_STATUSES.includes(o.status)).length,
  };
}
