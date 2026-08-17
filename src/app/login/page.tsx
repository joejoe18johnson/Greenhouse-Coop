"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconInput, PasswordInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { safeNextPath } from "@/lib/utils";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      if (next) {
        router.push(next);
        return;
      }
      router.push(user?.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    }
  }

  const registerHref = next ? `/register?next=${encodeURIComponent(next)}` : "/register";

  return (
    <>
      <p className="mt-2 text-sm text-ink/60">
        New here? <Link href={registerHref} className="text-forest underline">Create an account</Link>
      </p>
      {next === "/cart" && (
        <p className="mt-3 text-sm text-forest">Your cart is saved. After you sign in, we will take you back to it.</p>
      )}
      <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-[28px] bg-white/80 p-6">
        <div>
          <Label>Email</Label>
          <IconInput className="mt-1.5" icon={Mail} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Password</Label>
          <PasswordInput className="mt-1.5" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button className="w-full" type="submit">
          <LogIn className="h-4 w-4" />
          Sign in
        </Button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-4xl text-forest-dark">Sign in</h1>
      <Suspense fallback={<p className="mt-8 text-sm text-ink/50">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
