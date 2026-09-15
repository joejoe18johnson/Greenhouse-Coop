"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fulfillmentStepIndex,
  fulfillmentStepsForOrder,
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
  const steps = fulfillmentStepsForOrder(order);
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
        {complete && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf/15 px-3 py-1 text-xs font-semibold text-leaf">
            <Check className="h-3.5 w-3.5" />
            Done
          </span>
        )}
      </div>

      <ol className="mt-4 flex flex-col gap-0 sm:flex-row sm:items-start">
        {steps.map((step, index) => {
          const done = currentIndex >= 0 && index < currentIndex;
          const active = index === currentIndex;
          const upcoming = currentIndex >= 0 && index > currentIndex;

          return (
            <li
              key={step.status}
              className={cn(
                "flex min-w-0 flex-1 items-start gap-3 sm:flex-col sm:items-stretch sm:gap-2",
                index > 0 && "sm:border-l sm:border-forest/10 sm:pl-4"
              )}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                    done && "bg-leaf text-cream",
                    active && "bg-forest text-cream ring-4 ring-forest/15",
                    upcoming && "border-2 border-forest/15 bg-cream text-ink/35",
                    currentIndex < 0 && index === 0 && "bg-forest text-cream ring-4 ring-forest/15"
                  )}
                  aria-hidden
                >
                  {done ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <div className="min-w-0 sm:hidden">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      (done || active) && "text-forest",
                      upcoming && "text-ink/40"
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
              <div className="hidden min-w-0 sm:block">
                <p
                  className={cn(
                    "text-sm font-medium",
                    (done || active) && "text-forest",
                    upcoming && "text-ink/40"
                  )}
                >
                  {step.label}
                </p>
                <p className="mt-0.5 text-xs text-ink/45">{step.status}</p>
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
        <p className="mt-4 text-sm text-ink/55">All fulfillment steps are complete for this order.</p>
      )}
    </div>
  );
}
