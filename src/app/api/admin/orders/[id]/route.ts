import { NextResponse } from "next/server";
import {
  buildAdminOrderUpdate,
  validateAdminEditOrderInput,
  type AdminEditOrderInput,
} from "@/lib/admin-order";
import { orderFromRow, orderToRow, productFromRow, type OrderRow, type ProductRow } from "@/lib/supabase/mappers";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createServiceClient } from "@/lib/supabase/service";
import { normalizeShippingSettings } from "@/lib/shipping-settings";
import type { Courier, IdsRates, Order, ShippingSettings } from "@/types";
import shippingSeed from "@/data/shipping.json";
import couriersSeed from "@/data/couriers.json";
import idsRatesSeed from "@/data/ids-rates.json";

async function fetchSetting<T>(
  db: NonNullable<ReturnType<typeof createServiceClient>>,
  key: string,
  fallback: T
): Promise<T> {
  const { data, error } = await db.from("app_settings").select("value").eq("key", key).maybeSingle();
  if (error) throw error;
  return (data?.value as T | undefined) ?? fallback;
}

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

  let body: AdminEditOrderInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    validateAdminEditOrderInput(body);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid order input." },
      { status: 400 }
    );
  }

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

    const [{ data: productRows, error: productError }, shipping, couriers, idsRates] = await Promise.all([
      db.from("products").select("*").order("name"),
      fetchSetting(db, "shipping", normalizeShippingSettings(shippingSeed as ShippingSettings)),
      fetchSetting<Courier[]>(db, "couriers", couriersSeed as Courier[]),
      fetchSetting<IdsRates>(db, "ids_rates", idsRatesSeed as IdsRates),
    ]);

    if (productError) throw productError;

    const products = ((productRows ?? []) as ProductRow[]).map(productFromRow);
    const order: Order = buildAdminOrderUpdate({
      existing,
      input: body,
      products,
      shipping: normalizeShippingSettings(shipping),
      couriers,
      idsRates,
    });

    const { error: updateError } = await db.from("orders").update(orderToRow(order)).eq("id", params.id);
    if (updateError) throw updateError;

    return NextResponse.json({ ok: true, order });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not update order." },
      { status: 500 }
    );
  }
}
