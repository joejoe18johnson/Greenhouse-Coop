"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { COURIER_ESTIMATE_NOTICE } from "@/lib/constants";
import { getCouriers, saveCouriers } from "@/lib/store";

export default function AdminCouriersPage() {
  const [couriers, setCouriers] = useState(getCouriers());
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <h1 className="font-display text-4xl text-forest-dark">Courier settings</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/55">{COURIER_ESTIMATE_NOTICE}</p>
      <p className="mt-1 max-w-2xl text-sm text-ink/55">
        These district rates are shown to customers as approximate guides at checkout and on the delivery page. They are not added to order totals or invoices.
      </p>
      <div className="mt-6 space-y-6">
        {couriers.map((courier, i) => (
          <div key={courier.id} className="rounded-[24px] bg-white p-6">
            <div className="flex items-center justify-between">
              <Input className="max-w-xs" value={courier.name} onChange={(e) => {
                const next = [...couriers];
                next[i] = { ...courier, name: e.target.value };
                setCouriers(next);
              }} />
              <Checkbox
                checked={courier.active}
                onChange={(checked) => {
                  const next = [...couriers];
                  next[i] = { ...courier, active: checked };
                  setCouriers(next);
                }}
                label="Active"
              />
            </div>
            <Input className="mt-3" value={courier.notes} onChange={(e) => {
              const next = [...couriers];
              next[i] = { ...courier, notes: e.target.value };
              setCouriers(next);
            }} />
            <p className="mt-4 text-xs font-semibold text-ink/40">Approximate rates by district (BZD, pay at courier)</p>
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              {courier.rates.map((rate, ri) => (
                <label key={rate.district} className="text-sm">
                  {rate.district}
                  <Input className="mt-1" type="number" value={rate.fee} onChange={(e) => {
                    const next = [...couriers];
                    const rates = [...courier.rates];
                    rates[ri] = { ...rate, fee: Number(e.target.value) };
                    next[i] = { ...courier, rates };
                    setCouriers(next);
                  }} />
                </label>
              ))}
            </div>
          </div>
        ))}
        <Button onClick={() => { saveCouriers(couriers); setSaved(true); }}>Save couriers</Button>
        {saved && <p className="text-sm text-leaf">Saved.</p>}
      </div>
    </div>
  );
}
