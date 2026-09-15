"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FULFILLMENT_STEPS,
  fulfillmentStepIndex,
  isFulfillmentComplete,
  isFulfillmentTerminal,
  nextFulfillmentAction,
} from "@/lib/admin-fulfillment";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";

export function AdminFulfillmentStepper({
  order,
  onAdvance,
  advancing = false,
}: {
  order: Order;
  onAdvance: () => void;
  advancing?: boolean;
}) {
  const currentIndex = fulfillmentStepIndex(order);
  const nextStep = nextFulfillmentAction(order);
  const terminal = isFulfillmentTerminal(order);
  const complete = isFulfillmentComplete(order);

  if (terminal && !complete) {
    return (
      <div className="rounded-[24px] bg-white p-5">
        <p className="text-sm font-semibold text-forest">Fulfillment</p>
        <p className="mt-2 text-sm text-ink/60">This order is {order.status.toLowerCase()} — no further steps.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-forest">Fulfillment</p>
        {complete ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf/15 px-3 py-1 text-xs font-semibold text-leaf">
            <Check className="h-3.5 w-3.5" />
            Complete
          </span>
        ) : (
          <span className="text-xs font-medium text-ink/45">Active</span>
        )}
      </div>

      <ol className="mt-4 grid gap-4 sm:grid-cols-3">
        {FULFILLMENT_STEPS.map((step, index) => {
          const done = currentIndex >= 0 && (complete ? index <= currentIndex : index < currentIndex);
          const active = !complete && index === currentIndex;
          const waiting = order.status === "Paid" && index === 0;
          const upcoming = currentIndex >= 0 ? index > currentIndex : index > 0;

          return (
            <li
              key={step.status}
              className={cn(
                "rounded-[18px] border px-4 py-3",
                done && "border-leaf/30 bg-leaf/5",
                (active || waiting) && "border-forest/25 bg-forest/5",
                upcoming && !waiting && "border-forest/10 bg-cream/40"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                    done && "bg-leaf text-cream",
                    (active || waiting) && "bg-forest text-cream ring-4 ring-forest/15",
                    upcoming && !waiting && "border-2 border-forest/15 bg-cream text-ink/35"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <div>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      (done || active || waiting) && "text-forest",
                      upcoming && !waiting && "text-ink/40"
                    )}
                  >
                    {step.label}
                  </p>
                  {done && <p className="text-xs text-leaf">Done</p>}
                  {(active || waiting) && !done && <p className="text-xs text-forest/70">Current step</p>}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {nextStep && !complete && (
        <div className="mt-5 border-t border-forest/10 pt-5">
          <p className="text-sm text-ink/60">
            Next: <span className="font-medium text-forest">{nextStep.label}</span>
          </p>
          <Button className="mt-3 w-full sm:w-auto" disabled={advancing} onClick={onAdvance}>
            {advancing ? "Updating…" : nextStep.actionLabel}
          </Button>
        </div>
      )}

      {complete && (
        <p className="mt-4 text-sm text-ink/55">
          This order is complete and no longer active in fulfillment.
        </p>
      )}
    </div>
  );
}
