"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import {
  isAdminPushEnabled,
  type AdminNotification,
} from "@/lib/admin-notifications";
import { showBrowserNotification } from "@/lib/browser-notifications";
import { useAdminNotifications } from "@/hooks/use-admin-notifications";
import { cn } from "@/lib/utils";

type ToastItem = AdminNotification & { toastId: string };

export function AdminNotificationToasts({ adminId }: { adminId: string }) {
  const { notifications, markRead } = useAdminNotifications(adminId);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seenRef = useRef<Set<string>>(new Set());
  const readyRef = useRef(false);

  useEffect(() => {
    const currentIds = new Set(notifications.map((entry) => entry.id));

    if (!readyRef.current) {
      readyRef.current = true;
      seenRef.current = currentIds;
      return;
    }

    const fresh = notifications.filter((entry) => !seenRef.current.has(entry.id));
    if (fresh.length) {
      setToasts((current) =>
        [...fresh.map((entry) => ({ ...entry, toastId: entry.id })), ...current].slice(0, 4)
      );

      if (isAdminPushEnabled(adminId)) {
        for (const entry of fresh.slice(0, 3)) {
          showBrowserNotification(entry.headline, {
            body: entry.message,
            tag: entry.id,
            data: { href: entry.href },
          });
        }
      }
    }

    seenRef.current = currentIds;
  }, [notifications, adminId]);

  useEffect(() => {
    if (!toasts.length) return;

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        setToasts((current) => current.filter((entry) => entry.toastId !== toast.toastId));
      }, 9000)
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [toasts]);

  if (!toasts.length) return null;

  function dismiss(toastId: string) {
    setToasts((current) => current.filter((entry) => entry.toastId !== toastId));
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(100vw-2rem,400px)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.toastId}
          className="pointer-events-auto rounded-[20px] border border-forest/10 bg-white/95 p-4 shadow-float backdrop-blur-sm"
          role="status"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-citrus/20 text-forest">
              <Bell className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-forest">{toast.headline}</p>
              {toast.reference && (
                <p className="mt-0.5 text-xs text-ink/50 keep-case">Order {toast.reference}</p>
              )}
              <p className="mt-1 text-sm text-ink/70">{toast.message}</p>
              <Link
                href={toast.href}
                onClick={() => {
                  markRead([toast]);
                  dismiss(toast.toastId);
                }}
                className="mt-3 inline-flex text-sm font-medium text-forest underline"
              >
                {toast.kind === "customer" ? "View customers" : "Open in admin"}
              </Link>
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismiss(toast.toastId)}
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink/45 transition hover:bg-forest/5 hover:text-forest"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
