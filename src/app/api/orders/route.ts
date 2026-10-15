import { NextResponse } from "next/server";
import { validateCartQuantities } from "@/lib/product-quantity";
import { customerTimelineNote } from "@/lib/order-status-messages";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { requireUser } from "@/lib/supabase/require-user";
import { createServiceClient } from "@/lib/supabase/service";
import {
  orderFromRow,
  orderToRow,
  productFromRow,
  productToRow,
  type OrderRow,
  type ProductRow,
} from "@/lib/supabase/mappers";
import { applyOrderToProductInventory } from "@/lib/product-quantity";
import { generateInvoiceNumber, generateReference } from "@/lib/utils";
import type { Order } from "@/types";

type CustomerCreateOrderBody = Omit<
  Order,
  "id" | "createdAt" | "updatedAt" | "timeline" | "invoiceNumber" | "reference"
> & { reference?: string };

async function insertOrderRow(
  db: NonNullable<ReturnType<typeof createServiceClient>>,
  order: Order
) {
  const row = orderToRow(order);
  let { error } = await db.from("orders").insert(row);
  if (error?.message?.includes("loyalty_discount_waived")) {
    const { loyalty_discount_waived: _waived, ...legacyRow } = row;
    ({ error } = await db.from("orders").insert(legacyRow));
  }
  if (error) throw error;
}

export async function POST(request: Request) {
  if (!isSupabaseEnabled()) {
    return NextResponse.json(
      { error: "Online ordering is not available on this deployment." },
      { status: 503 }
    );
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: CustomerCreateOrderBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.userId !== auth.userId) {
    return NextResponse.json({ error: "Order must belong to your account." }, { status: 403 });
  }

  if (!body.items?.length) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  if (!body.shipping?.phone?.trim()) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }

  if (body.shipping.method !== "pickup" && !body.shipping.fullAddress?.trim()) {
    return NextResponse.json({ error: "Delivery address is required." }, { status: 400 });
  }

  const db = createServiceClient();
  if (!db) {
    return NextResponse.json(
      { error: "Order server is not configured. Contact support." },
      { status: 503 }
    );
  }

  try {
    const { data: productRows, error: productError } = await db.from("products").select("*").order("name");
    if (productError) throw productError;

    const products = ((productRows ?? []) as ProductRow[]).map(productFromRow);
    const getProduct = (id: string) => products.find((p) => p.id === id);

    const stockError = validateCartQuantities(
      body.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      getProduct
    );
    if (stockError) {
      return NextResponse.json({ error: stockError }, { status: 400 });
    }

    const now = new Date().toISOString();
    const order: Order = {
      ...body,
      id: crypto.randomUUID(),
      reference: body.reference ?? generateReference(),
      invoiceNumber: generateInvoiceNumber(),
      loyaltyDiscountWaived: body.loyaltyDiscountWaived ?? false,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          status: body.status,
          at: now,
          note: customerTimelineNote(body.status, undefined, body.payment),
        },
      ],
    };

    await insertOrderRow(db, order);

    for (const item of order.items) {
      const product = getProduct(item.productId);
      if (!product) continue;
      const updated = applyOrderToProductInventory(product, item.quantity);
      if (!updated) continue;
      const { error: updateError } = await db
        .from("products")
        .update(productToRow(updated))
        .eq("id", updated.id);
      if (updateError) throw updateError;
    }

    const { data: savedRow, error: readError } = await db
      .from("orders")
      .select("*")
      .eq("id", order.id)
      .maybeSingle();
    if (readError) throw readError;

    const saved = savedRow ? orderFromRow(savedRow as OrderRow) : order;

    return NextResponse.json({ ok: true, order: saved });
  } catch (err) {
    console.error("Customer order create failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not place your order. Please try again." },
      { status: 500 }
    );
  }
}
