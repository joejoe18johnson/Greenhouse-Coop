"use client";

import { useState } from "react";
import { BellRing, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { createStockWaitRequest } from "@/lib/store";
import type { Product } from "@/types";

export function StockWaitForm({ product }: { product: Product }) {
  const { user } = useAuth();
  const [name, setName] = useState(user ? `${user.firstName} ${user.lastName}`.trim() : "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);

    try {
      await createStockWaitRequest({
        productId: product.id,
        productName: product.name,
        customerName: name,
        phone,
        email: user?.email,
        userId: user?.id,
        notes: notes.trim() || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join the waitlist.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-leaf/30 bg-leaf/10 px-5 py-4 text-forest">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
        <div>
          <p className="font-semibold">You&apos;re on the waitlist</p>
          <p className="mt-1 text-sm text-ink/70">
            We&apos;ll contact you at {phone.trim()} when {product.name} is back in stock.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-2xl border border-forest/15 bg-cream/60 p-5">
      <p className="flex items-center gap-2 font-semibold text-forest">
        <BellRing className="h-4 w-4" />
        Notify me when back in stock
      </p>
      <p className="mt-1 text-sm text-ink/60">
        Leave your details and we&apos;ll reach out when {product.name} is available again.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor={`wait-name-${product.id}`}>Your name</Label>
          <Input
            id={`wait-name-${product.id}`}
            className="mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`wait-phone-${product.id}`}>Phone / WhatsApp</Label>
          <Input
            id={`wait-phone-${product.id}`}
            className="mt-1"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoComplete="tel"
            placeholder="624-0588"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`wait-notes-${product.id}`}>Notes (optional)</Label>
          <Textarea
            id={`wait-notes-${product.id}`}
            className="mt-1 min-h-[80px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Quantity, preferred size, or timing"
            maxLength={500}
          />
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <Button type="submit" className="mt-4 w-full sm:w-auto" disabled={submitting}>
        {submitting ? "Joining waitlist…" : "Join waitlist"}
      </Button>
    </form>
  );
}
