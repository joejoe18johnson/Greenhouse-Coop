"use client";

import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isAdminPushEnabled,
  pushPromptDismissedKey,
  setAdminPushEnabled,
} from "@/lib/admin-notifications";
import { getItem, setItem } from "@/lib/storage";
import {
  browserNotificationsSupported,
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
} from "@/lib/browser-notifications";

export function AdminPushNotificationPrompt({ adminId }: { adminId: string }) {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!browserNotificationsSupported()) return;

    const permission = getBrowserNotificationPermission();
    if (permission === "granted") {
      setAdminPushEnabled(adminId, true);
      return;
    }

    if (isAdminPushEnabled(adminId) || getItem(pushPromptDismissedKey(adminId), false)) {
      return;
    }

    setVisible(true);
    setDenied(permission === "denied");
  }, [adminId]);

  if (!visible) return null;

  async function enableNotifications() {
    setBusy(true);
    const permission = await requestBrowserNotificationPermission();
    setBusy(false);

    if (permission === "granted") {
      setAdminPushEnabled(adminId, true);
      setVisible(false);
      return;
    }

    setDenied(true);
  }

  function dismiss() {
    setItem(pushPromptDismissedKey(adminId), true);
    setVisible(false);
  }

  return (
    <div className="mb-6 rounded-2xl border border-forest/15 bg-white p-4 shadow-sm print:hidden">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-citrus/20 text-forest">
          <BellRing className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-forest">Turn on admin alerts</p>
          <p className="mt-1 text-sm text-ink/65">
            Get notified when customers sign up, place orders, or move through checkout — even if this tab is in the
            background.
          </p>
          {denied && (
            <p className="mt-2 text-sm text-ink/55">
              Notifications are blocked in your browser. Allow them in site settings to receive push alerts.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {!denied && (
              <Button type="button" variant="citrus" size="sm" disabled={busy} onClick={enableNotifications}>
                {busy ? "Enabling…" : "Enable notifications"}
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={dismiss}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink/40 hover:bg-forest/5 hover:text-forest"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
