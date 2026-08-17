import type { DataCache } from "@/lib/supabase/mappers";
import { createEmptyCache } from "@/lib/supabase/mappers";

let cache: DataCache = createEmptyCache();

export function getCache(): DataCache {
  return cache;
}

export function setCache(partial: Partial<DataCache>) {
  cache = { ...cache, ...partial };
}

export function resetCache() {
  cache = createEmptyCache();
}
