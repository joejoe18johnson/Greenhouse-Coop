import { NextResponse } from "next/server";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { createServiceClient } from "@/lib/supabase/service";
import { isDuplicateStockWait } from "@/lib/stock-wait-requests";
import type { StockWaitRequest } from "@/types";

const SETTINGS_KEY = "stock_wait_requests";

async function loadRequests(db: ReturnType<typeof createServiceClient>) {
  if (!db) return [] as StockWaitRequest[];
  const { data, error } = await db.from("app_settings").select("value").eq("key", SETTINGS_KEY).maybeSingle();
  if (error) throw error;
  return (data?.value as StockWaitRequest[] | undefined) ?? [];
}

async function saveRequests(db: ReturnType<typeof createServiceClient>, requests: StockWaitRequest[]) {
  if (!db) throw new Error("Database unavailable");
  const { error } = await db.from("app_settings").upsert({ key: SETTINGS_KEY, value: requests });
  if (error) throw error;
}

export async function POST(request: Request) {
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Waitlist is only available with Supabase configured." }, { status: 503 });
  }

  let body: {
    productId?: string;
    productName?: string;
    customerName?: string;
    phone?: string;
    email?: string;
    userId?: string;
    notes?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { productId, productName, customerName, phone, email, userId, notes } = body;

  if (!productId?.trim() || !productName?.trim() || !customerName?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "Name, phone, and product are required." }, { status: 400 });
  }

  const db = createServiceClient();
  if (!db) {
    return NextResponse.json({ error: "Server database unavailable." }, { status: 503 });
  }

  try {
    const existing = await loadRequests(db);
    if (isDuplicateStockWait(existing, productId, phone)) {
      return NextResponse.json(
        { error: "You are already on the waitlist for this tree with that phone number." },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const entry: StockWaitRequest = {
      id: crypto.randomUUID(),
      productId: productId.trim(),
      productName: productName.trim(),
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email?.trim() || undefined,
      userId: userId || undefined,
      notes: notes?.trim() || undefined,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    await saveRequests(db, [entry, ...existing]);
    return NextResponse.json(entry);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save waitlist request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
