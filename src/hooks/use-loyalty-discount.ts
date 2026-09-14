"use client";

import { useCallback, useMemo, useState } from "react";
import { getOrders } from "@/lib/store";
import {
  getCustomerLifetimeSpend,
  isLoyaltyDiscountEligible,
  LOYALTY_SPEND_THRESHOLD,
  loyaltySpendRemaining,
} from "@/lib/loyalty-discount";
import { useStore } from "@/context/store-context";
import { useStoreSync } from "@/hooks/use-store-sync";

export function useLoyaltyDiscount(userId?: string) {
  const { ready } = useStore();
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useStoreSync(refresh);

  return useMemo(() => {
    void tick;
    if (!ready || !userId) {
      return {
        eligible: false,
        lifetimeSpend: 0,
        remaining: LOYALTY_SPEND_THRESHOLD,
        threshold: LOYALTY_SPEND_THRESHOLD,
      };
    }

    const orders = getOrders();
    const lifetimeSpend = getCustomerLifetimeSpend(userId, orders);

    return {
      eligible: isLoyaltyDiscountEligible(userId, orders),
      lifetimeSpend,
      remaining: loyaltySpendRemaining(lifetimeSpend),
      threshold: LOYALTY_SPEND_THRESHOLD,
    };
  }, [ready, userId, tick]);
}
