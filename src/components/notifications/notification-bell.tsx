"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomerNotifications } from "@/hooks/use-customer-notifications";
import type { CustomerNotification } from "@/lib/customer-notifications";
import { cn } from "@/lib/utils";

function NotificationPanel({
  notifications,
  onClose,
  onMarkAllRead,
  onSelect,
}: {
  notifications: CustomerNotification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onSelect: (notification: CustomerNotification) => void;
}) {
  return (
    <div className="rounded-[24px] border border-forest/10 bg-white shadow-float">
      <div className="flex items-center justify-between border-b border-forest/10 px-4 py-3">
        <p className="text-sm font-semibold text-forest">Notifications</p>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="rounded-full px-2.5 py-1 text-[11px] font-medium text-forest hover:bg-forest/5"
            >
              Mark all read
            </button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Close notifications">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-ink/50">No new updates right now.</p>
      ) : (
        <ul className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <button
                type="button"
                onClick={() => onSelect(notification)}
                className="w-full rounded-2xl px-3 py-3 text-left transition hover:bg-forest/5"
              >
                <p className="text-sm font-semibold text-forest">{notification.headline}</p>
                <p className="mt-1 text-xs text-ink/55 keep-case">Order {notification.reference}</p>
                <p className="mt-1 line-clamp-2 text-sm text-ink/65">{notification.message}</p>
                <p className="mt-2 text-[11px] text-ink/40">
                  {new Date(notification.at).toLocaleString()}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const { notifications, unreadCount, markRead, markAllRead } = useCustomerNotifications(userId);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function handleSelect(notification: CustomerNotification) {
    markRead([notification.orderId]);
    setOpen(false);
    router.push(`/dashboard/orders/${notification.orderId}`);
  }

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={unreadCount ? `${unreadCount} unread notifications` : "Notifications"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(open && "bg-forest/10")}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-citrus px-1 text-[10px] font-bold text-ink">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-forest-deep/20 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-x-4 top-[calc(var(--site-header-offset,5rem)+0.5rem)] z-50 md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 md:w-[min(100vw-2rem,360px)]">
            <NotificationPanel
              notifications={notifications}
              onClose={() => setOpen(false)}
              onMarkAllRead={() => {
                markAllRead();
                setOpen(false);
              }}
              onSelect={handleSelect}
            />
          </div>
        </>
      )}
    </div>
  );
}

export function NotificationBellLink({
  userId,
  onNavigate,
}: {
  userId: string;
  onNavigate?: () => void;
}) {
  const { unreadCount } = useCustomerNotifications(userId);

  return (
    <Link
      href="/dashboard"
      onClick={onNavigate}
      className="inline-flex items-center gap-3 text-lg font-medium text-forest/80"
    >
      <span className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-citrus px-1 text-[9px] font-bold text-ink">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </span>
      Notifications
    </Link>
  );
}
