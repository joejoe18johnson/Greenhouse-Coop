"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { safeNextPath } from "@/lib/utils";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      router.push(next || "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    }
  }

  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-4xl text-forest-dark">Create account</h1>
      <p className="mt-2 text-sm text-ink/60">
        Already registered? <Link href={loginHref} className="text-forest underline">Sign in</Link>
      </p>
      {next === "/cart" && (
        <p className="mt-3 text-sm text-forest">Your cart is saved. After you create an account, we will take you back to it.</p>
      )}
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-[28px] bg-white/80 p-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>First name</Label>
            <Input className="mt-1" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div>
            <Label>Last name</Label>
            <Input className="mt-1" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Email</Label>
          <Input className="mt-1" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <Label>Phone number</Label>
          <Input className="mt-1" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <Label>Password</Label>
          <Input className="mt-1" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button className="w-full" type="submit">Create account</Button>
      </form>
    </div>
  );
}
