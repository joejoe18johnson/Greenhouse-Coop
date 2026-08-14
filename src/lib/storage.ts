const PREFIX = "ghco.v1.";

export function isBrowser() {
  return typeof window !== "undefined";
}

export function getItem<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function removeItem(key: string) {
  if (!isBrowser()) return;
  window.localStorage.removeItem(PREFIX + key);
}

export function subscribe(handler: (event: StorageEvent) => void) {
  if (!isBrowser()) return () => undefined;
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

/**
 * Future adapters (Supabase, etc.) should implement this same shape.
 * Repositories call getItem/setItem so swapping persistence is a single layer.
 */
export const localStore = { getItem, setItem, removeItem };
