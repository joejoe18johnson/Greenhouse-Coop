import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

/** Only run auth refresh on routes that need a session — keeps /cart, /shop, etc. fast on mobile. */
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/checkout",
    "/login",
    "/register",
  ],
};
