"use client";

import { useCallback, useEffect, useState } from "react";
import { getStockWaitRequests, refreshStockWaitRequestsFromRemote } from "@/lib/store";
import { pendingStockWaitRequests } from "@/lib/stock-wait-requests";
import { useStore } from "@/context/store-context";
import { useStoreSync } from "@/hooks/use-store-sync";
import type { StockWaitRequest } from "@/types";

export function useStockWaitRequests() {
  const { ready } = useStore();
  const [requests, setRequests] = useState<StockWaitRequest[]>([]);

  const refresh = useCallback(() => {
    setRequests(getStockWaitRequests());
  }, []);

  const pullRemote = useCallback(async () => {
    await refreshStockWaitRequestsFromRemote();
    refresh();
  }, [refresh]);

  useStoreSync(refresh);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!ready) return;
    void pullRemote();
  }, [ready, pullRemote]);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setInterval(() => {
      void pullRemote();
    }, 45000);
    return () => window.clearInterval(timer);
  }, [ready, pullRemote]);

  return {
    requests,
    pending: pendingStockWaitRequests(requests),
    refresh: pullRemote,
  };
}
