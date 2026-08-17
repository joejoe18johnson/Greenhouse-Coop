"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getAdminCounts, type AdminCounts } from "@/lib/admin-counts";
import { STORE_UPDATED_EVENT } from "@/lib/store-events";

export function useAdminCounts() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<AdminCounts>(() => getAdminCounts());

  useEffect(() => {
    setCounts(getAdminCounts());
  }, [pathname]);

  useEffect(() => {
    const refresh = () => setCounts(getAdminCounts());
    window.addEventListener(STORE_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(STORE_UPDATED_EVENT, refresh);
  }, []);

  return counts;
}
