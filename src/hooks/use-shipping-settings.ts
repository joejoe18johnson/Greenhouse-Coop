"use client";

import { useCallback, useEffect, useState } from "react";
import { getShippingSettings } from "@/lib/store";
import { useStore } from "@/context/store-context";
import { useStoreSync } from "@/hooks/use-store-sync";
import type { ShippingSettings } from "@/types";
import shippingSeed from "@/data/shipping.json";

export function useShippingSettings() {
  const { ready } = useStore();
  const [settings, setSettings] = useState<ShippingSettings>(shippingSeed as ShippingSettings);

  const refresh = useCallback(() => {
    setSettings(getShippingSettings());
  }, []);

  useStoreSync(refresh);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (ready) refresh();
  }, [ready, refresh]);

  return settings;
}
