import { NextResponse } from "next/server";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createServiceClient } from "@/lib/supabase/service";

const ALLOWED_KEYS = new Set(["shipping", "couriers", "ids_rates", "bank"]);

export async function PUT(request: Request) {
  if (!isSupabaseEnabled()) {
    return NextResponse.json(
      {
        error:
          "Supabase is not configured on this deployment. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Netlify, then redeploy.",
      },
      { status: 503 }
    );
  }

  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { key?: string; value?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { key, value } = body;
  if (!key || !ALLOWED_KEYS.has(key)) {
    return NextResponse.json({ error: "Invalid settings key." }, { status: 400 });
  }

  const db = createServiceClient() ?? auth.supabase;
  const { error } = await db.from("app_settings").upsert({ key, value });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
