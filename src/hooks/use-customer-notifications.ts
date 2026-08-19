"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ensureNotificationBaseline,
  getCustomerNotifications,
  markAllNotificationsRead,
  markNotificationsRead,
} from "@/lib/customer-notifications";
import { STORE_UPDATED_EVENT } from "@/lib/store-events";

export function useCustomerNotifications(userId: string | undefined) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!userId) return;
    ensureNotificationBaseline(userId);
  }, [userId]);

  useEffect(() => {
    const refresh = () => setTick((value) => value + 1);
    window.addEventListener(STORE_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(STORE_UPDATED_EVENT, refresh);
  }, []);

  const notifications = useMemo(
    () => (userId ? getCustomerNotifications(userId) : []),
    [userId, tick]
  );

  const markRead = useCallback(
    (orderIds: string[]) => {
      if (!userId) return;
      markNotificationsRead(userId, orderIds);
      setTick((value) => value + 1);
    },
    [userId]
  );

  const markAllRead = useCallback(() => {
    if (!userId) return;
    markAllNotificationsRead(userId);
    setTick((value) => value + 1);
  }, [userId]);

  return {
    notifications,
    unreadCount: notifications.length,
    markRead,
    markAllRead,
  };
}
