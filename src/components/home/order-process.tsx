"use client";

import { Banknote, ChevronRight, ClipboardCheck, ShoppingBag, Truck } from "lucide-react";

const STEPS = [
  { icon: ShoppingBag, title: "Choose Trees", text: "Add to cart" },
  { icon: ClipboardCheck, title: "Place Order", text: "Get a reference" },
  { icon: Banknote, title: "Pay Your Way", text: "Transfer + WhatsApp, or cash on delivery" },
  { icon: Truck, title: "Collect Or Send", text: "Terminal, local, or courier" },
];

export function OrderProcess() {
  return (
    <section className="mx-auto mt-6 max-w-7xl px-4">
      <div className="rounded-[28px] border border-forest/10 bg-white/75 px-4 py-4 shadow-sm backdrop-blur-xl md:rounded-full md:px-6 md:py-3">
        <ol className="grid gap-4 sm:grid-cols-2 lg:flex lg:items-center">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex min-w-0 items-center md:flex-1">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest text-cream">
                  <step.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight text-forest-dark">
                    {i + 1}. {step.title}
                  </span>
                  <span className="block text-xs leading-tight text-ink/45">
                    {step.text}
                  </span>
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="mx-3 hidden h-4 w-4 shrink-0 text-leaf/60 md:block lg:mx-4" aria-hidden />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
