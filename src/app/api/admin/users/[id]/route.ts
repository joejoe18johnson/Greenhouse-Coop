import { NextResponse } from "next/server";
import { verifyDeleteUserConfirmation } from "@/lib/admin-delete-code";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createServiceClient } from "@/lib/supabase/service";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

  if (auth.userId === params.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as { confirmCode?: unknown };
  const confirmCode = typeof body.confirmCode === "string" ? body.confirmCode : "";
  if (!verifyDeleteUserConfirmation(confirmCode)) {
    return NextResponse.json(
      { error: 'Type "DeleteUser" exactly to confirm deletion.' },
      { status: 403 }
    );
  }

  const serviceDb = createServiceClient();
  if (!serviceDb?.auth.admin) {
    return NextResponse.json(
      {
        error:
          "User deletion requires SUPABASE_SERVICE_ROLE_KEY on the server. Add it in your environment variables and redeploy.",
      },
      { status: 503 }
    );
  }

  const db = serviceDb;

  try {
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("id, role, email")
      .eq("id", params.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    if (profile.role === "admin") {
      return NextResponse.json({ error: "Admin accounts cannot be deleted here." }, { status: 403 });
    }

    const { error: ordersError } = await db.from("orders").delete().eq("user_id", params.id);
    if (ordersError) throw ordersError;

    const { error: deleteError } = await db.auth.admin.deleteUser(params.id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ ok: true, id: params.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not delete user." },
      { status: 500 }
    );
  }
}
