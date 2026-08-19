const ICON = "/logos/favicons/android-chrome-192x192.png";

export function browserNotificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getBrowserNotificationPermission(): NotificationPermission | "unsupported" {
  if (!browserNotificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestBrowserNotificationPermission() {
  if (!browserNotificationsSupported()) return "unsupported" as const;
  if (Notification.permission === "granted") return "granted" as const;
  if (Notification.permission === "denied") return "denied" as const;
  return Notification.requestPermission();
}

export function showBrowserNotification(title: string, options?: NotificationOptions) {
  if (!browserNotificationsSupported() || Notification.permission !== "granted") return;

  try {
    const notification = new Notification(title, {
      icon: ICON,
      badge: ICON,
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      if (options?.data && typeof options.data === "object" && "href" in options.data) {
        const href = (options.data as { href?: string }).href;
        if (href) window.location.href = href;
      }
      notification.close();
    };
  } catch {
    // Some mobile browsers block unless from a direct user gesture.
  }
}
