"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/context/store-context";
import { STORE_UPDATED_EVENT } from "@/lib/store-events";
import { subscribe } from "@/lib/storage";

/** Re-run `onUpdate` when the store hydrates or catalog/settings change (same or other tab). */
export function useStoreSync(onUpdate: () => void) {
  const { ready } = useStore();
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!ready) return;
    onUpdateRef.current();
  }, [ready]);

  useEffect(() => {
    const handler = () => onUpdateRef.current();
    window.addEventListener(STORE_UPDATED_EVENT, handler);
    const unsubStorage = subscribe(handler);
    return () => {
      window.removeEventListener(STORE_UPDATED_EVENT, handler);
      unsubStorage();
    };
  }, []);
}
