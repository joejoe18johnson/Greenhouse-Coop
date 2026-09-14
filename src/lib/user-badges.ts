import type { User } from "@/types";

/** Customers created within this window show a "New" badge in admin. */
export const NEW_USER_DAYS = 14;

export function isNewUser(user: User, now = Date.now()) {
  const created = new Date(user.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return now - created <= NEW_USER_DAYS * 24 * 60 * 60 * 1000;
}
