"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminNotifications } from "@/hooks/use-admin-notifications";
import type { AdminNotification } from "@/lib/admin-notifications";
import { cn } from "@/lib/utils";

function NotificationPanel({
  notifications,
  onClose,
  onMarkAllRead,
  onSelect,
}: {
  notifications: AdminNotification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onSelect: (notification: AdminNotification) => void;
}) {
  return (
    <div className="rounded-[24px] border border-forest/10 bg-white shadow-float">
      <div className="flex items-center justify-between border-b border-forest/10 px-4 py-3">
        <p className="text-sm font-semibold text-forest">Admin alerts</p>
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
        <p className="px-4 py-8 text-center text-sm text-ink/50">No new orders or customers right now.</p>
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
                {notification.reference && (
                  <p className="mt-1 text-xs text-ink/55 keep-case">Order {notification.reference}</p>
                )}
                <p className="mt-1 line-clamp-3 text-sm text-ink/65">{notification.message}</p>
                <p className="mt-2 text-[11px] text-ink/40">{new Date(notification.at).toLocaleString()}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminNotificationBell({ adminId }: { adminId: string }) {
  const router = useRouter();
  const { notifications, unreadCount, markRead, markAllRead } = useAdminNotifications(adminId);
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

  function handleSelect(notification: AdminNotification) {
    markRead([notification]);
    setOpen(false);
    router.push(notification.href);
  }

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={unreadCount ? `${unreadCount} unread admin alerts` : "Admin alerts"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn("text-forest", open && "bg-forest/10")}
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
            className="fixed inset-0 z-40 bg-forest-deep/20"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="fixed z-50 top-20 w-[min(calc(100vw-2rem),380px)] left-4 md:left-[17rem] md:max-w-[380px]">
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
