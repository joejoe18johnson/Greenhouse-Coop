import { FINANCIALS_STATUSES, isTestOrder } from "@/lib/financials";
import type { Order } from "@/types";

export const LOYALTY_SPEND_THRESHOLD = 200;
export const LOYALTY_DISCOUNT_RATE = 0.1;
export const LOYALTY_DISCOUNT_LABEL = "Exclusive customer discount (10%)";

/** Pre-discount order value — counts toward the loyalty threshold. */
export function getOrderGrossTotal(order: Order) {
  return order.subtotal + order.deliveryFee + order.boxFee;
}

export function getCustomerLifetimeSpend(
  userId: string,
  orders: Order[],
  options?: { excludeOrderId?: string }
): number {
  return orders
    .filter((order) => order.userId === userId)
    .filter((order) => order.id !== options?.excludeOrderId)
    .filter((order) => !isTestOrder(order))
    .filter((order) => FINANCIALS_STATUSES.includes(order.status))
    .reduce((sum, order) => sum + getOrderGrossTotal(order), 0);
}

/** True when confirmed lifetime spend reaches $200 — discount applies on the next order. */
export function isLoyaltyDiscountEligible(
  userId: string,
  orders: Order[],
  options?: { excludeOrderId?: string }
): boolean {
  return getCustomerLifetimeSpend(userId, orders, options) >= LOYALTY_SPEND_THRESHOLD;
}

/** Eligible from past orders, or this checkout alone is $200+ before discount. */
export function isLoyaltyDiscountEligibleForCheckout(
  userId: string,
  orders: Order[],
  currentBaseTotal: number,
  options?: { excludeOrderId?: string }
) {
  if (currentBaseTotal >= LOYALTY_SPEND_THRESHOLD) return true;
  return isLoyaltyDiscountEligible(userId, orders, options);
}

/** 10% off, rounded down to whole BZD (e.g. $18.55 → $18). */
export function applyLoyaltyDiscountToTotal(baseTotal: number, eligible: boolean) {
  if (!eligible || baseTotal <= 0) {
    return { total: baseTotal, loyaltyDiscount: 0 };
  }

  const discounted = baseTotal * (1 - LOYALTY_DISCOUNT_RATE);
  const total = Math.floor(discounted);
  const loyaltyDiscount = Math.round((baseTotal - total) * 100) / 100;

  return { total, loyaltyDiscount };
}

export function loyaltySpendRemaining(lifetimeSpend: number) {
  if (lifetimeSpend >= LOYALTY_SPEND_THRESHOLD) return 0;
  return Math.max(0, LOYALTY_SPEND_THRESHOLD - lifetimeSpend);
}

export function loyaltyStorageKeys(userId: string) {
  return {
    unlockedSeen: `loyaltyUnlockedSeen_${userId}`,
    promoSeen: `loyaltyPromoSeen_${userId}`,
  };
}
