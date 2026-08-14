"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getCart,
  getSession,
  hydrateStore,
  saveCart,
  setSession as persistSession,
} from "@/lib/store";
import type { CartItem, Session } from "@/types";

interface StoreContextValue {
  ready: boolean;
  session: Session | null;
  cart: CartItem[];
  setSession: (session: Session | null) => void;
  setCart: (cart: CartItem[]) => void;
  refresh: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSessionState] = useState<Session | null>(null);
  const [cart, setCartState] = useState<CartItem[]>([]);

  useEffect(() => {
    hydrateStore().then(() => {
      setSessionState(getSession());
      setCartState(getCart());
      setReady(true);
    });
  }, []);

  const setSession = useCallback((next: Session | null) => {
    persistSession(next);
    setSessionState(next);
  }, []);

  const setCart = useCallback((next: CartItem[]) => {
    saveCart(next);
    setCartState(next);
  }, []);

  const refresh = useCallback(() => {
    setSessionState(getSession());
    setCartState(getCart());
  }, []);

  const value = useMemo(
    () => ({ ready, session, cart, setSession, setCart, refresh }),
    [ready, session, cart, setSession, setCart, refresh]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
