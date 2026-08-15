"use client";

import { Banknote, ChevronRight, ClipboardCheck, ShoppingBag, Truck } from "lucide-react";

const STEPS = [
  { icon: ShoppingBag, title: "Choose Trees", text: "Add to cart" },
  { icon: ClipboardCheck, title: "Place Order", text: "Get a reference" },
  { icon: Banknote, title: "Pay & Proof", text: "Transfer, then WhatsApp" },
  { icon: Truck, title: "Collect Or Send", text: "Terminal, local, or courier" },
];

export function OrderProcess() {
  return (
    <section className="mx-auto mt-6 max-w-7xl px-4">
      <div className="overflow-x-auto rounded-[28px] border border-forest/10 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-xl md:rounded-full md:px-6">
        <ol className="flex min-w-[42rem] items-center md:min-w-0">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex min-w-0 flex-1 items-center">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest text-cream">
                  <step.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold leading-tight text-forest-dark">
                    {i + 1}. {step.title}
                  </span>
                  <span className="hidden truncate text-[11px] leading-tight text-ink/45 sm:block">
                    {step.text}
                  </span>
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="mx-2 h-4 w-4 shrink-0 text-leaf/60 md:mx-4" aria-hidden />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
