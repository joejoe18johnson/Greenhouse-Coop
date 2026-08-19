"use client";

import { motion } from "framer-motion";
import { Flower2, Leaf, Sprout } from "lucide-react";
import { ScrollCarousel } from "@/components/ui/scroll-carousel";
import { PROPAGATION_INFO, PROPAGATION_TYPES } from "@/lib/propagation";
import type { PropagationType } from "@/types";

const ICONS: Record<PropagationType, typeof Sprout> = {
  Grafted: Sprout,
  "Air-Layered": Leaf,
  "Selective Breeding": Flower2,
  Seedling: Sprout,
};

function BenefitCard({ type, index, inCarousel = false }: { type: PropagationType; index: number; inCarousel?: boolean }) {
  const info = PROPAGATION_INFO[type];
  const Icon = ICONS[type];

  return (
    <motion.article
      initial={inCarousel ? false : { opacity: 0, y: 24 }}
      whileInView={inCarousel ? undefined : { opacity: 1, y: 0 }}
      viewport={inCarousel ? undefined : { once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="flex h-full flex-col rounded-[32px] border border-leaf/30 bg-white/80 p-7 shadow-card backdrop-blur-md"
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
              <span className="font-semibold text-forest-dark">{benefit.title}:</span> {benefit.text}
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export function PropagationBenefits() {
  const cards = PROPAGATION_TYPES.map((type, i) => (
    <BenefitCard key={type} type={type} index={i} inCarousel />
  ));

  const gridCards = PROPAGATION_TYPES.map((type, i) => (
    <BenefitCard key={type} type={type} index={i} />
  ));

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs text-leaf">Beyond random seedlings</p>
        <h2 className="mt-2 font-display text-3xl text-forest-dark sm:text-4xl md:text-5xl">
          Smarter ways to grow in Belize
        </h2>
        <p className="mt-4 text-base leading-relaxed text-ink/65">
          Grafting, air-layering, and selective breeding give you stronger trees, true-to-type fruit,
          and harvests years sooner than growing from ordinary seeds.
        </p>
      </div>

      <div className="mt-12 lg:hidden">
        <ScrollCarousel
          bleed
          prevLabel="Previous benefit"
          nextLabel="Next benefit"
          trackClassName="px-[max(1rem,calc((100%-min(88vw,22rem))/2))] sm:px-0"
          itemClassName="w-[min(88vw,22rem)] snap-center sm:w-[min(85vw,22rem)] sm:snap-start"
        >
          {cards}
        </ScrollCarousel>
      </div>

      <div className="mt-12 hidden gap-6 lg:grid lg:grid-cols-3">{gridCards}</div>
    </section>
  );
}
