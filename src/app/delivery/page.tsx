"use client";

import Link from "next/link";
import { Building2, Package, Store, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconBubble } from "@/components/ui/icon-bubble";
import { IdsRateTable } from "@/components/delivery/ids-rate-table";
import { getCouriers, getIdsRates } from "@/lib/store";
import shipping from "@/data/shipping.json";
import { formatBZD } from "@/lib/utils";

export default function DeliveryPage() {
  const couriers = getCouriers();
  const idsRates = getIdsRates();
  const ezy = couriers.find((c) => c.id === "ezy");

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <p className="text-xs text-leaf">Delivery</p>
      <h1 className="page-title mt-2">How trees arrive</h1>
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
          <h2 className="font-display text-3xl text-forest">IDS (Inter District Shipping)</h2>
        </div>
        <p className="mt-3 text-ink/65">
          IDS usually works <strong>office-to-office</strong>. You pay shipping at the IDS office when you collect — not on your Greenhouse Co-Op order. We estimate from IDS published package rates and your cart size. <strong>Central and Northern districts share the same price.</strong>
        </p>
        <IdsRateTable rates={idsRates} />
      </section>
      {ezy?.active && (
        <section className="mt-8 rounded-[28px] bg-white/80 p-8">
          <div className="flex items-center gap-3">
            <IconBubble icon={Building2} />
            <h2 className="font-display text-3xl text-forest">EZY Courier</h2>
          </div>
          <p className="mt-3 text-ink/65">{ezy.notes}</p>
          <p className="mt-3 text-xs font-semibold text-ink/40">Approximate flat guides by district — pay at courier office</p>
          <ul className="mt-2 space-y-1 text-sm">
            {ezy.rates.map((r) => (
              <li key={r.district} className="flex justify-between">
                <span>{r.district}</span>
                <span>≈ {formatBZD(r.fee)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="mt-8 rounded-[28px] bg-white/80 p-8">
        <div className="flex items-center gap-3">
          <IconBubble icon={Package} />
          <h2 className="font-display text-3xl text-forest">Nursery shipping boxes</h2>
        </div>
        <p className="mt-3 text-sm text-ink/60">
          Box size is picked from your cart. IDS estimates map nursery boxes to IDS package tiers (Small through XL).
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {shipping.boxes.map((box) => (
            <div key={box.id} className="rounded-2xl bg-cream p-5">
              <p className="font-semibold text-forest">{box.name}</p>
              <p className="text-sm text-ink/60">{box.description}</p>
              <p className="mt-2">{formatBZD(box.price)} nursery packing fee</p>
            </div>
          ))}
        </div>
      </section>
      <Button className="mt-10" asChild><Link href="/shop">Shop trees</Link></Button>
    </div>
  );
}
