"use client";

import Link from "next/link";
import { Building2, Package, Store, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconBubble } from "@/components/ui/icon-bubble";
import shipping from "@/data/shipping.json";
import couriers from "@/data/couriers.json";
import { formatBZD } from "@/lib/utils";

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <p className="text-xs text-leaf">Delivery</p>
      <h1 className="mt-2 font-display text-5xl text-forest-dark">How trees arrive</h1>
      <section className="mt-10 rounded-[28px] bg-white/80 p-8">
        <div className="flex items-center gap-3">
          <IconBubble icon={Store} />
          <h2 className="font-display text-3xl text-forest">Collect at the Belmopan Bus Terminal</h2>
        </div>
        <p className="mt-3 text-ink/65">
          Prefer no delivery? Choose collection at checkout and pick up your trees centrally at the Belmopan Bus Terminal. No delivery or courier fee. We will confirm when the order is ready.
        </p>
      </section>
      <section className="mt-8 rounded-[28px] bg-forest p-8 text-cream">
        <div className="flex items-center gap-3">
          <IconBubble icon={Truck} className="bg-white/15 text-lime-bright" />
          <h2 className="font-display text-3xl">Local delivery</h2>
        </div>
        <p className="mt-3 text-cream/80">Belmopan · Roaring Creek · Camalote</p>
        <p className="mt-4 text-2xl font-semibold">{formatBZD(shipping.localDelivery.fee)} flat</p>
        <p className="mt-1 text-cream/75">FREE over {formatBZD(shipping.localDelivery.freeThreshold)}</p>
      </section>
      <section className="mt-8 rounded-[28px] bg-white/80 p-8">
        <div className="flex items-center gap-3">
          <IconBubble icon={Building2} />
          <h2 className="font-display text-3xl text-forest">All other locations</h2>
        </div>
        <p className="mt-3 text-ink/65">
          Choose IDS or EZY Courier at checkout. Couriers usually work <strong>office-to-office</strong> — trees go to the courier office in your area, not door-to-door. Collect them at that office location. Box size is calculated automatically from the number of plants — you never pick a box.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {couriers.map((c) => (
            <div key={c.id} className="rounded-2xl border border-forest/10 p-5">
              <h3 className="font-semibold text-forest">{c.name}</h3>
              <p className="mt-1 text-sm text-ink/60">{c.notes}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {c.rates.map((r) => (
                  <li key={r.district} className="flex justify-between">
                    <span>{r.district}</span>
                    <span>{formatBZD(r.fee)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-8 rounded-[28px] bg-white/80 p-8">
        <div className="flex items-center gap-3">
          <IconBubble icon={Package} />
          <h2 className="font-display text-3xl text-forest">Shipping boxes</h2>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {shipping.boxes.map((box) => (
            <div key={box.id} className="rounded-2xl bg-cream p-5">
              <p className="font-semibold text-forest">{box.name}</p>
              <p className="text-sm text-ink/60">{box.description}</p>
              <p className="mt-2">{formatBZD(box.price)}</p>
            </div>
          ))}
        </div>
      </section>
      <Button className="mt-10" asChild><Link href="/shop">Shop trees</Link></Button>
    </div>
  );
}
