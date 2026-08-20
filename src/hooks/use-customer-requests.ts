"use client";

import { useCallback, useEffect, useState } from "react";
import { getCustomerRequests, refreshCustomerRequestsFromRemote } from "@/lib/store";
import { pendingCustomerRequests } from "@/lib/customer-requests";
import { useStore } from "@/context/store-context";
import { useStoreSync } from "@/hooks/use-store-sync";
import type { CustomerRequest } from "@/types";

export function useCustomerRequests() {
  const { ready } = useStore();
  const [requests, setRequests] = useState<CustomerRequest[]>([]);

  const refresh = useCallback(() => {
    setRequests(getCustomerRequests());
  }, []);

  const pullRemote = useCallback(async () => {
    await refreshCustomerRequestsFromRemote();
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
    pending: pendingCustomerRequests(requests),
    refresh: pullRemote,
  };
}
