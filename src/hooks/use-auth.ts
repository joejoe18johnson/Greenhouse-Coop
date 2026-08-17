"use client";

import { useStore } from "@/context/store-context";
import { createUser, getUsers, isUsingSupabase, syncAuthSession, updateUser } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { hashPassword } from "@/lib/utils";
import type { Address, User } from "@/types";

export function useAuth() {
  const { session, setSession, ready, refresh } = useStore();

  const user = session ? getUsers().find((u) => u.id === session.userId) ?? null : null;

  async function register(input: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) {
    if (isUsingSupabase()) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: input.email.toLowerCase(),
        password: input.password,
        options: {
          data: {
            first_name: input.firstName,
            last_name: input.lastName,
            phone: input.phone,
            role: "customer",
          },
        },
      });
      if (error) throw error;
      if (!data.user) throw new Error("Registration failed.");

      const nextSession = await syncAuthSession();
      if (nextSession) setSession(nextSession);
      refresh();
      return getUsers().find((u) => u.id === data.user!.id) ?? null;
    }

    const exists = getUsers().some((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (exists) throw new Error("An account with this email already exists.");
    const passwordHash = await hashPassword(input.password);
    const created = createUser({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      passwordHash,
    });
    setSession({ userId: created.id, email: created.email, role: created.role });
    return created;
  }

  async function login(email: string, password: string) {
    if (isUsingSupabase()) {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });
      if (error) throw new Error("Invalid email or password.");
      const nextSession = await syncAuthSession();
      if (nextSession) setSession(nextSession);
      refresh();
      return getUsers().find((u) => u.id === nextSession?.userId) ?? null;
    }

    const passwordHash = await hashPassword(password);
    const match = getUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === passwordHash
    );
    if (!match) throw new Error("Invalid email or password.");
    setSession({ userId: match.id, email: match.email, role: match.role });
    return match;
  }

  async function logout() {
    if (isUsingSupabase()) {
      const { signOutRemote } = await import("@/lib/store");
      await signOutRemote();
    }
    setSession(null);
    refresh();
  }

  function saveAddress(address: Address) {
    if (!user) return;
    const addresses = user.addresses.filter((a) => a.id !== address.id);
    const next: User = {
      ...user,
      addresses: address.isDefault
        ? [address, ...addresses.map((a) => ({ ...a, isDefault: false }))]
        : [...addresses, address],
    };
    updateUser(next);
    refresh();
  }

  return { ready, session, user, register, login, logout, saveAddress };
}
