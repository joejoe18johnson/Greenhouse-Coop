"use client";

import { isUsingSupabase } from "@/lib/store";

export function AdminBackendNotice() {
  if (isUsingSupabase()) return null;

  return (
    <div className="mb-6 rounded-2xl border border-citrus/40 bg-citrus/15 px-4 py-3 text-sm text-forest-dark">
      <p className="font-semibold">Changes only save in this browser</p>
      <p className="mt-1 text-ink/70">
        Supabase is not active on this deployment. Admin edits use local storage and will not appear for other
        visitors on Netlify. Add{" "}
        <code className="keep-case rounded bg-white/80 px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="keep-case rounded bg-white/80 px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
        in Netlify environment variables, then trigger a new deploy.
      </p>
    </div>
  );
}
