import { NextResponse } from "next/server";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createServiceClient } from "@/lib/supabase/service";
import { updateCustomerRequestStatus } from "@/lib/customer-requests";
import type { CustomerRequest, CustomerRequestStatus } from "@/types";

const SETTINGS_KEY = "customer_requests";
const ALLOWED: CustomerRequestStatus[] = ["pending", "checking", "found", "notified", "closed"];

async function loadRequests(db: NonNullable<ReturnType<typeof createServiceClient>>) {
  const { data, error } = await db.from("app_settings").select("value").eq("key", SETTINGS_KEY).maybeSingle();
  if (error) throw error;
  return (data?.value as CustomerRequest[] | undefined) ?? [];
}

async function saveRequests(db: NonNullable<ReturnType<typeof createServiceClient>>, requests: CustomerRequest[]) {
  const { error } = await db.from("app_settings").upsert({ key: SETTINGS_KEY, value: requests });
  if (error) throw error;
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
    const message = error instanceof Error ? error.message : "Could not load customer requests.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: Omit<CustomerRequest, "id" | "createdAt" | "updatedAt"> & { status?: CustomerRequestStatus };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { customerName, phone, productIds, productNames } = body;
  if (!customerName?.trim() || !phone?.trim() || !productIds?.length || !productNames?.length) {
    return NextResponse.json({ error: "Customer name, phone, and at least one product are required." }, { status: 400 });
  }

  const db = createServiceClient() ?? auth.supabase;
  try {
    const existing = await loadRequests(db);
    const now = new Date().toISOString();
    const entry: CustomerRequest = {
      id: crypto.randomUUID(),
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: body.email?.trim() || undefined,
      town: body.town?.trim() || undefined,
      district: body.district?.trim() || undefined,
      userId: body.userId || undefined,
      productIds,
      productNames,
      notes: body.notes?.trim() || undefined,
      status: body.status && ALLOWED.includes(body.status) ? body.status : "pending",
      createdAt: now,
      updatedAt: now,
    };

    await saveRequests(db, [entry, ...existing]);
    return NextResponse.json(entry);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save customer request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { id?: string; status?: CustomerRequestStatus } & Partial<
    Pick<
      CustomerRequest,
      | "customerName"
      | "phone"
      | "email"
      | "town"
      | "district"
      | "userId"
      | "productIds"
      | "productNames"
      | "notes"
    >
  >;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { id, status, ...patch } = body;
  if (!id) {
    return NextResponse.json({ error: "Request id is required." }, { status: 400 });
  }
  if (status && !ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const db = createServiceClient() ?? auth.supabase;
  try {
    const existing = await loadRequests(db);
    const now = new Date().toISOString();
    let next = existing.map((entry) => {
      if (entry.id !== id) return entry;
      return { ...entry, ...patch, ...(status ? { status } : {}), updatedAt: now };
    });

    if (status) {
      next = updateCustomerRequestStatus(next, id, status);
    }

    const updated = next.find((entry) => entry.id === id);
    if (!updated) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    await saveRequests(db, next);
    return NextResponse.json({ ok: true, request: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update customer request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "Request id is required." }, { status: 400 });
  }

  const db = createServiceClient() ?? auth.supabase;
  try {
    const existing = await loadRequests(db);
    const next = existing.filter((entry) => entry.id !== id);
    if (next.length === existing.length) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }
    await saveRequests(db, next);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete customer request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
