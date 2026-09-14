/** Server-side confirmation code for permanent customer deletion. */
export function verifyAdminDeleteCode(input: string): boolean {
  const expected = process.env.ADMIN_USER_DELETE_CODE?.trim();
  if (!expected) {
    if (process.env.NODE_ENV === "development") {
      return input.trim() === "DELETE-USER";
    }
    return false;
  }
  return input.trim() === expected;
}

export function adminDeleteCodeConfigured(): boolean {
  return Boolean(process.env.ADMIN_USER_DELETE_CODE?.trim()) || process.env.NODE_ENV === "development";
}

/** Client-side check for local (non-Supabase) storage backend only. */
export function verifyAdminDeleteCodeClient(input: string): boolean {
  const expected = process.env.NEXT_PUBLIC_ADMIN_USER_DELETE_CODE?.trim();
  if (expected) return input.trim() === expected;
  if (process.env.NODE_ENV === "development") return input.trim() === "DELETE-USER";
  return false;
}
