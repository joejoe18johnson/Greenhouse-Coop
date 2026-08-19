"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ensureAdminNotificationBaseline,
  getAdminNotifications,
  markAdminNotificationsRead,
  markAllAdminNotificationsRead,
  type AdminNotification,
} from "@/lib/admin-notifications";
import { STORE_UPDATED_EVENT } from "@/lib/store-events";

export function useAdminNotifications(adminId: string | undefined) {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    if (!adminId) return;
    ensureAdminNotificationBaseline(adminId);
    refresh();
  }, [adminId, refresh]);

  useEffect(() => {
    if (!adminId) return;

    window.addEventListener(STORE_UPDATED_EVENT, refresh);

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    const interval = window.setInterval(refresh, 45000);

    return () => {
      window.removeEventListener(STORE_UPDATED_EVENT, refresh);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(interval);
    };
  }, [adminId, refresh]);

  const notifications = useMemo(
    () => (adminId ? getAdminNotifications(adminId) : []),
    [adminId, tick]
  );

  const markRead = useCallback(
    (entries: AdminNotification[]) => {
      if (!adminId || !entries.length) return;
      markAdminNotificationsRead(adminId, entries);
      refresh();
    },
    [adminId, refresh]
  );

  const markAllRead = useCallback(() => {
    if (!adminId) return;
    markAllAdminNotificationsRead(adminId);
    refresh();
  }, [adminId, refresh]);

  return {
    notifications,
    unreadCount: notifications.length,
    markRead,
    markAllRead,
    refresh,
  };
}
