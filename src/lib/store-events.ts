export const STORE_UPDATED_EVENT = "greenhouse-store-updated";

export function notifyStoreUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORE_UPDATED_EVENT));
  }
}
