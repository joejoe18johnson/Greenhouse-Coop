"use client";

import { useEffect, useState } from "react";
import { Gift, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useLoyaltyDiscount } from "@/hooks/use-loyalty-discount";
import { getItem, setItem } from "@/lib/storage";
import { loyaltyStorageKeys, LOYALTY_SPEND_THRESHOLD } from "@/lib/loyalty-discount";
import { formatBZD } from "@/lib/utils";
import { usePathname } from "next/navigation";

type DialogMode = "unlocked" | "promo";

export function LoyaltyDiscountDialog() {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const loyalty = useLoyaltyDiscount(user?.id);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>("promo");

  useEffect(() => {
    if (!ready || !user || user.role === "admin") return;
    if (pathname.startsWith("/admin")) return;

    const keys = loyaltyStorageKeys(user.id);

    if (loyalty.eligible) {
      if (getItem(keys.unlockedSeen, false)) return;
      setMode("unlocked");
      setOpen(true);
      return;
    }

    if (getItem(keys.promoSeen, false)) return;
    setMode("promo");
    setOpen(true);
  }, [ready, user, loyalty.eligible, pathname]);

  function dismiss() {
    if (!user) return;
    const keys = loyaltyStorageKeys(user.id);
    if (mode === "unlocked") {
      setItem(keys.unlockedSeen, true);
    } else {
      setItem(keys.promoSeen, true);
    }
    setOpen(false);
  }

  if (!user || user.role === "admin") return null;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : dismiss())}>
      <DialogContent className="max-w-md border-forest/15 p-0 overflow-hidden">
        <div className={`px-6 py-8 ${mode === "unlocked" ? "bg-gradient-to-br from-leaf/20 via-cream to-citrus/15" : "bg-cream/60"}`}>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest text-cream shadow-md">
            {mode === "unlocked" ? <Sparkles className="h-7 w-7" /> : <Gift className="h-7 w-7" />}
          </div>
          <DialogTitle className="mt-5 text-center font-display text-2xl text-forest-dark">
            {mode === "unlocked" ? "Exclusive discount unlocked!" : "Grow with us — earn 10% off"}
          </DialogTitle>
          <DialogDescription className="mt-3 text-center text-sm leading-relaxed text-ink/70">
            {mode === "unlocked" ? (
              <>
                Thank you for being a loyal Greenhouse Co-Op customer. You&apos;ve spent over{" "}
                {formatBZD(LOYALTY_SPEND_THRESHOLD)} with us, so every order from now on gets an automatic{" "}
                <strong>10% discount</strong> — rounded down to the nearest whole dollar on your invoice.
              </>
            ) : (
              <>
                After {formatBZD(LOYALTY_SPEND_THRESHOLD)} in completed orders on your account, you unlock an automatic{" "}
                <strong>10% discount on every invoice</strong> (totals round down to whole dollars — e.g. $18.55 becomes
                $18).
              </>
            )}
          </DialogDescription>
          {mode === "promo" && (
            <p className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-center text-sm text-forest">
              You&apos;ve spent{" "}
              <strong className="tabular-nums">{formatBZD(loyalty.lifetimeSpend)}</strong> so far ·{" "}
              <strong className="tabular-nums">{formatBZD(loyalty.remaining)}</strong> to go
            </p>
          )}
          {mode === "unlocked" && (
            <p className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-center text-sm font-medium text-forest">
              Your discount applies automatically at checkout.
            </p>
          )}
          <Button className="mt-6 w-full" onClick={dismiss}>
            {mode === "unlocked" ? "Great — thanks!" : "Got it"}
          </Button>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-4 top-4 rounded-full p-1 text-ink/45 hover:bg-forest/10 hover:text-forest"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
