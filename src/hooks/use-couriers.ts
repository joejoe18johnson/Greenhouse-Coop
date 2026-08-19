"use client";

import { useCallback, useEffect, useState } from "react";
import { getCouriers } from "@/lib/store";
import { useStore } from "@/context/store-context";
import { useStoreSync } from "@/hooks/use-store-sync";
import type { Courier } from "@/types";
import couriersSeed from "@/data/couriers.json";

export function useCouriers() {
  const { ready } = useStore();
  const [couriers, setCouriers] = useState<Courier[]>(couriersSeed as Courier[]);

  const refresh = useCallback(() => {
    setCouriers(getCouriers());
  }, []);

  useStoreSync(refresh);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (ready) refresh();
  }, [ready, refresh]);

  return couriers;
}
