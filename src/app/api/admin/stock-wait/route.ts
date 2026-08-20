import { NextResponse } from "next/server";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createServiceClient } from "@/lib/supabase/service";
import { updateStockWaitStatus } from "@/lib/stock-wait-requests";
import type { StockWaitRequest, StockWaitStatus } from "@/types";

const SETTINGS_KEY = "stock_wait_requests";
const ALLOWED: StockWaitStatus[] = ["pending", "fulfilled", "dismissed"];

async function loadRequests(db: NonNullable<ReturnType<typeof createServiceClient>>) {
  const { data, error } = await db.from("app_settings").select("value").eq("key", SETTINGS_KEY).maybeSingle();
  if (error) throw error;
  return (data?.value as StockWaitRequest[] | undefined) ?? [];
}

export async function PATCH(request: Request) {
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { id?: string; status?: StockWaitStatus };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { id, status } = body;
  if (!id || !status || !ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Invalid request id or status." }, { status: 400 });
  }

  const db = createServiceClient() ?? auth.supabase;
  try {
    const existing = await loadRequests(db);
    const next = updateStockWaitStatus(existing, id, status);
    const { error } = await db.from("app_settings").upsert({ key: SETTINGS_KEY, value: next });
    if (error) throw error;
    return NextResponse.json({ ok: true, request: next.find((entry) => entry.id === id) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update waitlist request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const db = createServiceClient() ?? auth.supabase;
  try {
    const requests = await loadRequests(db);
    return NextResponse.json(requests);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load waitlist.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
