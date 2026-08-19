import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Server-only Supabase client with service role — bypasses RLS for trusted admin API routes. */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
