"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Phone, UserPlus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { safeNextPath } from "@/lib/utils";

function RegisterForm() {
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
    <>
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
            <IconInput className="mt-1" icon={UserRound} required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div>
            <Label>Last name</Label>
            <IconInput className="mt-1" icon={UserRound} required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Email</Label>
          <IconInput className="mt-1" icon={Mail} type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <Label>Phone number</Label>
          <IconInput className="mt-1" icon={Phone} required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <Label>Password</Label>
          <IconInput className="mt-1" icon={Lock} type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button className="w-full" type="submit">
          <UserPlus className="h-4 w-4" />
          Create account
        </Button>
      </form>
    </>
  );
}

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-4xl text-forest-dark">Create account</h1>
      <Suspense fallback={<p className="mt-8 text-sm text-ink/50">Loading…</p>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
