import { NextResponse } from "next/server";
import { customerTimelineNote } from "@/lib/order-status-messages";
import { orderFromRow, type OrderRow } from "@/lib/supabase/mappers";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createServiceClient } from "@/lib/supabase/service";
import type { OrderStatus } from "@/types";

const ISSUED_STATUSES: OrderStatus[] = ["Paid", "Processing", "Shipped", "Completed"];

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isSupabaseEnabled()) {
    return NextResponse.json(
      { error: "Supabase is not configured on this deployment." },
      { status: 503 }
    );
  }

  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { status?: unknown; note?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const status = body.status;
  if (typeof status !== "string" || !status.trim()) {
    return NextResponse.json({ error: "Status is required." }, { status: 400 });
  }

  const note = typeof body.note === "string" ? body.note : undefined;
  const db = createServiceClient() ?? auth.supabase;

  try {
    const { data: existingRow, error: existingError } = await db
      .from("orders")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existingRow) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const existing = orderFromRow(existingRow as OrderRow);
    if (existing.status === status) {
      return NextResponse.json({ ok: true, order: existing });
    }

    const now = new Date().toISOString();
    const timelineNote = customerTimelineNote(status as OrderStatus, note, existing.payment);
    const updated = {
      ...existing,
      status: status as OrderStatus,
      updatedAt: now,
      invoiceIssuedAt: ISSUED_STATUSES.includes(status as OrderStatus)
        ? existing.invoiceIssuedAt ?? now
        : existing.invoiceIssuedAt,
      payment:
        status === "Paid"
          ? { ...existing.payment, reviewedAt: now, reviewedBy: "admin" }
          : existing.payment,
      timeline: [...existing.timeline, { status, at: now, note: timelineNote }],
    };

    const { error: updateError } = await db
      .from("orders")
      .update({
        status: updated.status,
        timeline: updated.timeline,
        updated_at: now,
        invoice_issued_at: updated.invoiceIssuedAt ?? null,
        payment: updated.payment,
      })
      .eq("id", params.id);

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true, order: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not update order status." },
      { status: 500 }
    );
  }
}
