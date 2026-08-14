"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, CircleHelp, Download, Leaf, MapPin, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DownloadCatalogButton } from "@/components/catalog/download-catalog-button";
import { ProductCarousel } from "@/components/product/product-carousel";
import { useProducts } from "@/hooks/use-products";
import { FAST_SELLER_IDS } from "@/lib/constants";
import almanac from "@/data/almanac.json";
import shipping from "@/data/shipping.json";
import { CHAT_FAQS } from "@/data/faq";
import { FAQ_ICONS } from "@/lib/icons";

const reasons = [
  { icon: Sparkles, title: "Quality Trees", text: "Grafted and air-layered trees selected for vigor, true-to-type fruit, and nursery-grade structure." },
  { icon: Leaf, title: "Expert Knowledge", text: "Grown by people who plant in Belize soil, humidity, and rainfall — not imported guesswork." },
  { icon: MapPin, title: "Belize Adapted Varieties", text: "Citrus, mango, avocado, and tropical specialties proven in local gardens from Cayo to the cayes." },
  { icon: Truck, title: "Reliable Delivery", text: "Collect at the Belmopan Bus Terminal, local delivery nearby, or nationwide courier. Couriers are usually office-to-office." },
];

export default function HomePage() {
  const products = useProducts();
  const featured = FAST_SELLER_IDS.map((id) => products.find((p) => p.id === id)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p)
  );

  return (
    <div>
      <section className="relative mx-auto mt-6 max-w-7xl overflow-hidden rounded-[36px] px-4">
        <div className="relative min-h-[78vh] overflow-hidden rounded-[36px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/images/hero-orchard.jpg)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/85 via-forest-dark/70 to-transparent" />
          <div className="relative z-10 flex min-h-[78vh] max-w-3xl flex-col justify-center px-8 py-20 md:px-16">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-xs text-lime-bright"
            >
              Grown in Belize
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="font-display text-4xl leading-[1.1] text-cream md:text-6xl"
            >
              Premium Fruit Trees for Belize Gardens
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-6 max-w-xl text-lg text-cream/80"
            >
              Grafted, Air-Layered & Seedling Trees Grown for Belize Conditions
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              <Button size="lg" variant="citrus" asChild>
                <Link href="/shop">
                  Shop Trees <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <DownloadCatalogButton variant="cream" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs text-leaf">Selling fast</p>
            <h2 className="mt-2 font-display text-4xl text-forest-dark">Popular trees that go quickly.</h2>
            <p className="mt-3 max-w-xl text-ink/65">
              Mangosteen, strawberry, Cuban guava, blood orange, Hass Black, and Valencia orange are nursery favorites.
              Mangosteen and strawberries are always in short supply — order while they last.
            </p>
          </div>
          <Button variant="outline" asChild className="hidden sm:inline-flex">
            <Link href="/shop">View all <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <ProductCarousel products={featured} />
      </section>

      <section className="bg-forest-dark py-24 text-cream">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs text-lime-bright">Why choose Greenhouse Co-Op</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl">A modern nursery for Belize gardens.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {reasons.map((reason, i) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <reason.icon className="mb-4 h-6 w-6 text-lime-bright" />
                <h3 className="text-lg font-semibold">{reason.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">{reason.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <p className="inline-flex items-center gap-2 text-xs text-leaf">
          <CalendarDays className="h-3.5 w-3.5" />
          Belize planting almanac
        </p>
        <h2 className="mt-3 font-display text-4xl text-forest-dark">Plant with the season.</h2>
        <p className="mt-4 max-w-2xl text-ink/65">{almanac.intro}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {almanac.bestWindows.map((window) => (
            <div key={window.title} className="rounded-[28px] bg-forest p-8 text-cream">
              <p className="text-xs text-lime-bright">{window.months}</p>
              <h3 className="mt-2 font-display text-3xl">{window.title}</h3>
              <p className="mt-3 text-cream/75">{window.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {almanac.months.map((m) => (
            <div key={m.month} className="rounded-2xl border border-forest/10 bg-white/70 p-5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-forest">{m.month}</h4>
                <span className="text-[11px] text-ink/45">{m.season}</span>
              </div>
              <p className="mt-2 text-sm text-ink/65">{m.advice}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8">
        <p className="inline-flex items-center gap-2 text-xs text-leaf">
          <CircleHelp className="h-3.5 w-3.5" />
          FAQ
        </p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display text-4xl text-forest-dark">Common questions</h2>
          <Button variant="outline" asChild>
            <Link href="/faq">View all FAQs <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {CHAT_FAQS.map((faq) => {
            const Icon = FAQ_ICONS[faq.id] ?? CircleHelp;
            return (
            <Link key={faq.id} href="/faq" className="rounded-[28px] bg-white/80 p-6 transition hover:-translate-y-0.5 hover:shadow-card">
              <Icon className="mb-3 h-5 w-5 text-leaf" />
              <h3 className="font-semibold text-forest">{faq.question}</h3>
              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-ink/65">{faq.answer}</p>
            </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="overflow-hidden rounded-[36px] bg-gradient-to-br from-forest to-forest-dark p-10 text-cream md:p-16">
          <p className="inline-flex items-center gap-2 text-xs text-lime-bright">
            <Truck className="h-3.5 w-3.5" />
            Delivery
          </p>
          <h2 className="mt-3 font-display text-4xl">Collect, or we can send them.</h2>
          <p className="mt-4 max-w-xl text-cream/75">
            Pick up centrally at the Belmopan Bus Terminal, or use local delivery to Belmopan, Roaring Creek, and Camalote — {shipping.localDelivery.fee} BZD flat, free over {shipping.localDelivery.freeThreshold} BZD.
            Farther away, IDS and EZY Courier usually deliver office-to-office at their location in your area.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="citrus" asChild>
              <Link href="/delivery">
                <Truck className="h-4 w-4" />
                Delivery details
              </Link>
            </Button>
            <Button variant="cream" asChild>
              <Link href="/catalog">
                <Download className="h-4 w-4" /> View catalog
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
