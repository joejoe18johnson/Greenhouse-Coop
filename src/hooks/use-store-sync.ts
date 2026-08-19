"use client";

import { useEffect } from "react";
import { useStore } from "@/context/store-context";
import { STORE_UPDATED_EVENT } from "@/lib/store-events";
import { subscribe } from "@/lib/storage";

/** Re-run `onUpdate` when the store hydrates or catalog/settings change (same or other tab). */
export function useStoreSync(onUpdate: () => void) {
  const { ready } = useStore();

  useEffect(() => {
    if (!ready) return;
    onUpdate();
  }, [ready, onUpdate]);

  useEffect(() => {
    window.addEventListener(STORE_UPDATED_EVENT, onUpdate);
    const unsubStorage = subscribe(onUpdate);
    return () => {
      window.removeEventListener(STORE_UPDATED_EVENT, onUpdate);
      unsubStorage();
    };
  }, [onUpdate]);
}
