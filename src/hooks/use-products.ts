"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/lib/store";
import { useStore } from "@/context/store-context";
import type { Product } from "@/types";
import productsSeed from "@/data/products.json";

export function useProducts() {
  const { ready } = useStore();
  const [products, setProducts] = useState<Product[]>(productsSeed as Product[]);

  useEffect(() => {
    if (ready) setProducts(getProducts());
  }, [ready]);

  return products;
}
