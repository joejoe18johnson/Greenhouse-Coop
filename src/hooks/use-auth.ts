"use client";

import { useStore } from "@/context/store-context";
import { createUser, getUsers, updateUser } from "@/lib/store";
import { hashPassword } from "@/lib/utils";
import type { Address, User } from "@/types";

export function useAuth() {
  const { session, setSession, ready } = useStore();

  const user = session ? getUsers().find((u) => u.id === session.userId) ?? null : null;

  async function register(input: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) {
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
    const passwordHash = await hashPassword(password);
    const match = getUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === passwordHash
    );
    if (!match) throw new Error("Invalid email or password.");
    setSession({ userId: match.id, email: match.email, role: match.role });
    return match;
  }

  function logout() {
    setSession(null);
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
  }

  return { ready, session, user, register, login, logout, saveAddress };
}
