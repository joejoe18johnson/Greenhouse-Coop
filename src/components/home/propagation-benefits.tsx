"use client";

import { motion } from "framer-motion";
import { Flower2, Leaf, Sprout } from "lucide-react";
import { PROPAGATION_INFO, PROPAGATION_TYPES } from "@/lib/propagation";
import type { PropagationType } from "@/types";

const ICONS: Record<PropagationType, typeof Sprout> = {
  Grafted: Sprout,
  "Air-Layered": Leaf,
  "Selective Breeding": Flower2,
};

export function PropagationBenefits() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs text-leaf">Beyond random seedlings</p>
        <h2 className="mt-2 font-display text-4xl text-forest-dark md:text-5xl">
          Smarter ways to grow in Belize
        </h2>
        <p className="mt-4 text-base leading-relaxed text-ink/65">
          Grafting, air-layering, and selective breeding give you stronger trees, true-to-type fruit,
          and harvests years sooner than growing from ordinary seeds.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {PROPAGATION_TYPES.map((type, i) => {
          const info = PROPAGATION_INFO[type];
          const Icon = ICONS[type];

          return (
            <motion.article
              key={type}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="flex flex-col rounded-[32px] border border-leaf/30 bg-white/80 p-7 shadow-card backdrop-blur-md"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forest text-cream">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-2xl text-forest-dark">{info.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">{info.summary}</p>
                </div>
              </div>

              <div className="mt-6 flex-1 rounded-[24px] bg-cream/60 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-leaf">Key benefits</p>
                <ul className="mt-4 space-y-3">
                  {info.benefits.map((benefit) => (
                    <li key={benefit.title} className="text-sm leading-relaxed text-ink/75">
                      <span className="font-semibold text-forest-dark">{benefit.title}:</span>{" "}
                      {benefit.text}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
