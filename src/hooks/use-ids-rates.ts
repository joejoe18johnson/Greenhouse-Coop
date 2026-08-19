"use client";

import { useCallback, useEffect, useState } from "react";
import { getIdsRates } from "@/lib/store";
import { useStore } from "@/context/store-context";
import { useStoreSync } from "@/hooks/use-store-sync";
import type { IdsRates } from "@/types";
import idsRatesSeed from "@/data/ids-rates.json";

export function useIdsRates() {
  const { ready } = useStore();
  const [rates, setRates] = useState<IdsRates>(idsRatesSeed as IdsRates);

  const refresh = useCallback(() => {
    setRates(getIdsRates());
  }, []);

  useStoreSync(refresh);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (ready) refresh();
  }, [ready, refresh]);

  return rates;
}
