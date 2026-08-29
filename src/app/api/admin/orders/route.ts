import { NextResponse } from "next/server";
import {
  buildAdminOrderDraft,
  validateAdminCreateOrderInput,
  type AdminCreateOrderInput,
} from "@/lib/admin-order";
import { splitCustomerName } from "@/lib/split-customer-name";
import { normalizeShippingSettings } from "@/lib/shipping-settings";
import { orderToRow, productFromRow, type ProductRow } from "@/lib/supabase/mappers";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createServiceClient } from "@/lib/supabase/service";
import type { Courier, IdsRates, Order, ShippingSettings } from "@/types";
import shippingSeed from "@/data/shipping.json";
import couriersSeed from "@/data/couriers.json";
import idsRatesSeed from "@/data/ids-rates.json";

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function walkInEmail(phone: string) {
  const digits = normalizePhone(phone);
  return `customer+${digits || crypto.randomUUID()}@orders.greenhousecoop.local`;
}

async function fetchSetting<T>(
  db: NonNullable<ReturnType<typeof createServiceClient>>,
  key: string,
  fallback: T
): Promise<T> {
  const { data, error } = await db.from("app_settings").select("value").eq("key", key).maybeSingle();
  if (error) throw error;
  return (data?.value as T | undefined) ?? fallback;
}

async function findExistingCustomerId(
  db: NonNullable<ReturnType<typeof createServiceClient>>,
  customer: AdminCreateOrderInput["customer"]
) {
  if (customer.userId) {
    const { data } = await db.from("profiles").select("id, role").eq("id", customer.userId).maybeSingle();
    if (data?.role === "customer") return data.id as string;
  }

  const phone = customer.phone.trim();
  if (phone) {
    const { data } = await db.from("profiles").select("id").eq("phone", phone).eq("role", "customer").maybeSingle();
    if (data?.id) return data.id as string;
  }

  const email = customer.email?.trim();
  if (email) {
    const { data } = await db
      .from("profiles")
      .select("id")
      .eq("email", email)
      .eq("role", "customer")
      .maybeSingle();
    if (data?.id) return data.id as string;
  }

  return null;
}

async function createWalkInCustomer(
  db: NonNullable<ReturnType<typeof createServiceClient>>,
  customer: AdminCreateOrderInput["customer"]
) {
  if (!db.auth.admin) {
    throw new Error(
      "Cannot create a customer without SUPABASE_SERVICE_ROLE_KEY. Select an existing account or add the service role key."
    );
  }

  const { firstName, lastName } = splitCustomerName(customer.customerName);
  const email = customer.email?.trim() || walkInEmail(customer.phone);
  const { data, error } = await db.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      phone: customer.phone.trim(),
      role: "customer",
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      const existing = await findExistingCustomerId(db, { ...customer, email });
      if (existing) return existing;
    }
    throw new Error(error.message);
  }

  if (customer.phone.trim()) {
    await db
      .from("profiles")
      .update({ phone: customer.phone.trim(), first_name: firstName, last_name: lastName })
      .eq("id", data.user.id);
  }

  return data.user.id;
}

async function ensureCustomerUserId(
  db: NonNullable<ReturnType<typeof createServiceClient>>,
  customer: AdminCreateOrderInput["customer"]
) {
  const existing = await findExistingCustomerId(db, customer);
  if (existing) return { userId: existing, customerCreated: false };

  const serviceDb = createServiceClient();
  if (!serviceDb) {
    throw new Error(
      "No matching customer account found. Select someone from the directory or add SUPABASE_SERVICE_ROLE_KEY to create walk-in customers."
    );
  }

  const userId = await createWalkInCustomer(serviceDb, customer);
  return { userId, customerCreated: true };
}

export async function POST(request: Request) {
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

  let body: AdminCreateOrderInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    validateAdminCreateOrderInput(body);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid order input." },
      { status: 400 }
    );
  }

  const db = createServiceClient() ?? auth.supabase;

  try {
    const [{ data: productRows, error: productError }, shipping, couriers, idsRates, customerResult] =
      await Promise.all([
        db.from("products").select("*").order("name"),
        fetchSetting(db, "shipping", normalizeShippingSettings(shippingSeed as ShippingSettings)),
        fetchSetting<Courier[]>(db, "couriers", couriersSeed as Courier[]),
        fetchSetting<IdsRates>(db, "ids_rates", idsRatesSeed as IdsRates),
        ensureCustomerUserId(db, body.customer),
      ]);

    if (productError) throw productError;

    const products = ((productRows ?? []) as ProductRow[]).map(productFromRow);
    const draft = buildAdminOrderDraft({
      input: body,
      userId: customerResult.userId,
      products,
      shipping: normalizeShippingSettings(shipping),
      couriers,
      idsRates,
    });

    const now = new Date().toISOString();
    const order: Order = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const { error: insertError } = await db.from("orders").insert(orderToRow(order));
    if (insertError) throw insertError;

    return NextResponse.json({
      ok: true,
      order,
      customerCreated: customerResult.customerCreated,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create order." },
      { status: 500 }
    );
  }
}
