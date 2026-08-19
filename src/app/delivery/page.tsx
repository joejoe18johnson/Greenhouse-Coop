"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Building2, Package, Store, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconBubble } from "@/components/ui/icon-bubble";
import { IdsRateTable } from "@/components/delivery/ids-rate-table";
import { useCouriers } from "@/hooks/use-couriers";
import { useIdsRates } from "@/hooks/use-ids-rates";
import { useShippingSettings } from "@/hooks/use-shipping-settings";
import {
  localDeliveryFeeText,
  localDeliveryFreeOverText,
  localDeliveryTownsLabel,
} from "@/lib/shipping-copy";
import { formatBZD } from "@/lib/utils";

function SectionHeading({
  icon: Icon,
  bubbleClassName,
  children,
  light = false,
}: {
  icon: typeof Store;
  bubbleClassName?: string;
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <IconBubble icon={Icon} className={bubbleClassName} />
      <h2 className={`section-heading ${light ? "text-cream" : "text-forest"}`}>{children}</h2>
    </div>
  );
}

export default function DeliveryPage() {
  const shipping = useShippingSettings();
  const couriers = useCouriers();
  const idsRates = useIdsRates();
  const ezy = couriers.find((c) => c.id === "ezy");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-xs text-leaf">Delivery</p>
      <h1 className="page-title mt-2">How trees arrive</h1>
      <section className="mt-10 rounded-[28px] bg-white/80 p-5 sm:p-8">
        <SectionHeading icon={Store}>Collect at the Belmopan Bus Terminal</SectionHeading>
        <p className="mt-3 text-ink/65">
          Prefer no delivery? Choose collection at checkout and pick up your trees centrally at the Belmopan Bus Terminal. No delivery or courier fee. We will confirm when the order is ready.
        </p>
      </section>
      <section className="mt-8 rounded-[28px] bg-forest p-5 text-cream sm:p-8">
        <SectionHeading icon={Truck} bubbleClassName="bg-white/15 text-lime-bright" light>
          Local delivery
        </SectionHeading>
        <p className="mt-3 text-cream/80">{localDeliveryTownsLabel(shipping)}</p>
        <p className="mt-4 text-2xl font-semibold">{localDeliveryFeeText(shipping)}</p>
        <p className="mt-1 text-cream/75">{localDeliveryFreeOverText(shipping)}</p>
      </section>
      <section className="mt-8 rounded-[28px] bg-white/80 p-5 sm:p-8">
        <SectionHeading icon={Building2}>IDS (Inter District Shipping)</SectionHeading>
        <p className="mt-3 text-ink/65">
          IDS usually works <strong>office-to-office</strong>. You pay shipping at the IDS office when you collect — not on your Greenhouse Co-Op order. We estimate from IDS published package rates and your cart size. <strong>Central and Northern districts share the same price.</strong>
        </p>
        <IdsRateTable rates={idsRates} />
      </section>
      {ezy?.active && (
        <section className="mt-8 rounded-[28px] bg-white/80 p-5 sm:p-8">
          <SectionHeading icon={Building2}>EZY Courier</SectionHeading>
          <p className="mt-3 text-ink/65">{ezy.notes}</p>
          <p className="mt-3 text-xs font-semibold text-ink/40">Approximate flat guides by district — pay at courier office</p>
          <ul className="mt-2 space-y-1 text-sm">
            {ezy.rates.map((r) => (
              <li key={r.district} className="flex justify-between gap-4">
                <span>{r.district}</span>
                <span className="shrink-0">≈ {formatBZD(r.fee)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="mt-8 rounded-[28px] bg-white/80 p-5 sm:p-8">
        <SectionHeading icon={Package}>Nursery shipping boxes</SectionHeading>
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
      <Button className="mt-10 w-full sm:w-auto" asChild>
        <Link href="/shop">Shop trees</Link>
      </Button>
    </div>
  );
}
