import {
  orderNeedsAdminAttention,
  orderNeedsPaymentReview,
} from "@/lib/admin-order-attention";
import { getOrders, getProducts, getCustomerRequests } from "@/lib/store";
import { SHORT_SUPPLY_IDS } from "@/lib/constants";
import { pendingCustomerRequests } from "@/lib/customer-requests";

export interface AdminCounts {
  payments: number;
  orders: number;
  products: number;
  overview: number;
  requests: number;
}

export function getAdminCounts(): AdminCounts {
  const orders = getOrders();
  const products = getProducts();

  const payments = orders.filter(orderNeedsPaymentReview).length;
  const ordersAttention = orders.filter(orderNeedsAdminAttention).length;
  const outOfStock = products.filter(
    (product) => product.inStock === false && (SHORT_SUPPLY_IDS as readonly string[]).includes(product.id)
  ).length;

  return {
    payments,
    orders: ordersAttention,
    products: outOfStock,
    overview: ordersAttention,
    requests: pendingCustomerRequests(getCustomerRequests()).length,
  };
}
