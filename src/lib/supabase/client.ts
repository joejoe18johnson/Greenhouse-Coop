import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseEnabled } from "@/lib/supabase/config";

export function createClient() {
  if (!isSupabaseEnabled()) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Safe client getter — returns null when Supabase env vars are missing. */
export function getSupabaseClient() {
  if (!isSupabaseEnabled()) return null;
  return createClient();
}
