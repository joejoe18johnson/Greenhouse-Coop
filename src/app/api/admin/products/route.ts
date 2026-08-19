import { NextResponse } from "next/server";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { productToRow } from "@/lib/supabase/mappers";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createServiceClient } from "@/lib/supabase/service";
import type { Product } from "@/types";

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

  let body: Product | Product[];
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const products = Array.isArray(body) ? body : [body];
  if (!products.length) {
    return NextResponse.json({ error: "No products provided." }, { status: 400 });
  }

  const db = createServiceClient() ?? auth.supabase;
  const { error } = await db.from("products").upsert(products.map(productToRow));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: products.length });
}

export async function DELETE(request: Request) {
  if (!isSupabaseEnabled()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Product id required." }, { status: 400 });
  }

  const db = createServiceClient() ?? auth.supabase;
  const { error } = await db.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
