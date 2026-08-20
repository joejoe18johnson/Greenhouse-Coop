"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Sprout, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useStore } from "@/context/store-context";
import {
  getStockWaitAlertsForUser,
  markStockWaitAlertSeen,
  type StockWaitAlert,
} from "@/lib/stock-wait-alerts";
import { STORE_UPDATED_EVENT } from "@/lib/store-events";
import { cn } from "@/lib/utils";

type ToastItem = StockWaitAlert & { toastId: string };

export function StockWaitAlertToasts() {
  const pathname = usePathname();
  const { user, session, ready } = useAuth();
  const { ready: storeReady } = useStore();
  const isCustomer = ready && storeReady && session?.role === "customer" && user;
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback(
    (toastId: string, waitRequestId: string) => {
      if (user) markStockWaitAlertSeen(user.id, waitRequestId);
      setToasts((current) => current.filter((entry) => entry.toastId !== toastId));
    },
    [user]
  );

  const refreshAlerts = useCallback(() => {
    if (!isCustomer || !user) return;
    const alerts = getStockWaitAlertsForUser(user);
    setToasts((current) => {
      const openIds = new Set(current.map((entry) => entry.id));
      const merged = [
        ...current,
        ...alerts
          .filter((alert) => !openIds.has(alert.id))
          .map((alert) => ({ ...alert, toastId: alert.id })),
      ];
      return merged.slice(0, 3);
    });
  }, [isCustomer, user]);

  useEffect(() => {
    refreshAlerts();
  }, [refreshAlerts]);

  useEffect(() => {
    if (!isCustomer) return;
    const onUpdate = () => refreshAlerts();
    window.addEventListener(STORE_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(STORE_UPDATED_EVENT, onUpdate);
  }, [isCustomer, refreshAlerts]);

  useEffect(() => {
    if (!toasts.length) return;

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        dismiss(toast.toastId, toast.id);
      }, 9000)
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [toasts, dismiss]);

  if (!isCustomer || !toasts.length || pathname.startsWith("/admin") || pathname === "/checkout") {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-[max(1rem,env(safe-area-inset-right))] top-[max(5rem,env(safe-area-inset-top))] z-50 flex w-[min(100vw-2rem,340px)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.toastId}
          className="pointer-events-auto rounded-[18px] border border-leaf/25 bg-white/95 p-3.5 shadow-float backdrop-blur-sm"
          role="status"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-leaf/15 text-forest">
              <Sprout className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-forest">{toast.headline}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink/65">{toast.message}</p>
              <Link
                href={`/product/${toast.productId}`}
                onClick={() => dismiss(toast.toastId, toast.id)}
                className="mt-2 inline-flex text-xs font-medium text-forest underline"
              >
                View tree
              </Link>
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismiss(toast.toastId, toast.id)}
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink/45 transition hover:bg-forest/5 hover:text-forest"
              )}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
