"use client";

import Link from "next/link";
import { Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLoyaltyDiscount } from "@/hooks/use-loyalty-discount";
import { LOYALTY_SPEND_THRESHOLD } from "@/lib/loyalty-discount";
import { formatBZD } from "@/lib/utils";

export function LoyaltyStatusBanner({
  userId,
  currentBaseTotal,
  className = "",
}: {
  userId?: string;
  /** When set (checkout), also unlocks discount for a single $200+ order. */
  currentBaseTotal?: number;
  className?: string;
}) {
  const loyalty = useLoyaltyDiscount(userId, currentBaseTotal);

  if (!userId) return null;

  if (loyalty.eligible) {
    return (
      <div
        className={`rounded-[24px] border border-leaf/30 bg-gradient-to-r from-leaf/15 via-cream to-citrus/10 px-5 py-4 ${className}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest text-cream">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-forest">Your 10% exclusive discount is active</p>
              <p className="mt-1 text-sm text-ink/65">
                {loyalty.lifetimeSpend >= LOYALTY_SPEND_THRESHOLD
                  ? `You've spent ${formatBZD(loyalty.lifetimeSpend)} with us — every order gets 10% off automatically.`
                  : `This order is ${formatBZD(currentBaseTotal ?? 0)} — orders of ${formatBZD(LOYALTY_SPEND_THRESHOLD)} or more qualify for 10% off.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loyalty.lifetimeSpend <= 0) return null;

  return (
    <div className={`rounded-[24px] border border-forest/10 bg-white/80 px-5 py-4 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-citrus/20 text-forest">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-forest">Unlock 10% off every order</p>
            <p className="mt-1 text-sm text-ink/65">
              Paid orders total <strong>{formatBZD(loyalty.lifetimeSpend)}</strong> ·{" "}
              <strong>{formatBZD(loyalty.remaining)}</strong> to reach {formatBZD(LOYALTY_SPEND_THRESHOLD)}.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <Link href="/shop">Keep shopping</Link>
        </Button>
      </div>
    </div>
  );
}
