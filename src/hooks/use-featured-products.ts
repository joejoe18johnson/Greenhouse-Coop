"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getFeaturedProductOrder } from "@/lib/store";
import { sortFeaturedProducts } from "@/lib/featured-products";
import { useProducts } from "@/hooks/use-products";
import { useStore } from "@/context/store-context";
import { useStoreSync } from "@/hooks/use-store-sync";

export function useFeaturedProducts() {
  const { ready } = useStore();
  const catalog = useProducts();
  const [order, setOrder] = useState<string[]>([]);

  const refresh = useCallback(() => {
    setOrder(getFeaturedProductOrder());
  }, []);

  useStoreSync(refresh);

  useEffect(() => {
    if (ready) refresh();
  }, [ready, refresh]);

  return useMemo(() => sortFeaturedProducts(catalog, order), [catalog, order]);
}
