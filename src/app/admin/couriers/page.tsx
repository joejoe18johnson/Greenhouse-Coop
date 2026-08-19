"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { IdsRateTable } from "@/components/delivery/ids-rate-table";
import { COURIER_ESTIMATE_NOTICE } from "@/lib/constants";
import { IDS_PACKAGE_TIERS, idsPackageLabel } from "@/lib/ids-rates";
import { getCouriers, getIdsRates, saveCouriers, saveIdsRates } from "@/lib/store";
import { useStore } from "@/context/store-context";
import { useStoreSync } from "@/hooks/use-store-sync";
import type { IdsPackageTier, IdsRates } from "@/types";

export default function AdminCouriersPage() {
  const { ready } = useStore();
  const [couriers, setCouriers] = useState(getCouriers());
  const [idsRates, setIdsRates] = useState(getIdsRates());
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useStoreSync(() => {
    setCouriers(getCouriers());
    setIdsRates(getIdsRates());
  });

  useEffect(() => {
    if (ready) {
      setCouriers(getCouriers());
      setIdsRates(getIdsRates());
    }
  }, [ready]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await saveIdsRates(idsRates);
      await saveCouriers(couriers);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save courier settings.");
    } finally {
      setSaving(false);
    }
  }

  function updateIdsPackage(
    zone: keyof IdsRates["zones"],
    tier: IdsPackageTier,
    fee: number
  ) {
    setIdsRates({
      ...idsRates,
      zones: {
        ...idsRates.zones,
        [zone]: {
          ...idsRates.zones[zone],
          packages: {
            ...idsRates.zones[zone].packages,
            [tier]: fee,
          },
        },
      },
    });
  }

  const ezy = couriers.find((c) => c.id === "ezy");
  const ezyIndex = couriers.findIndex((c) => c.id === "ezy");
  const ids = couriers.find((c) => c.id === "ids");
  const idsIndex = couriers.findIndex((c) => c.id === "ids");

  return (
    <div className="min-w-0">
      <h1 className="page-title">Courier settings</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/55">{COURIER_ESTIMATE_NOTICE}</p>

      <section className="mt-8 rounded-[24px] bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-forest">IDS (Inter District Shipping)</h2>
          {ids && idsIndex >= 0 && (
            <Checkbox
              checked={ids.active}
              onChange={(checked) => {
                const next = [...couriers];
                next[idsIndex] = { ...ids, active: checked };
                setCouriers(next);
              }}
              label="Active"
            />
          )}
        </div>
        <p className="mt-2 text-sm text-ink/55">
          Package rates by zone. Central &amp; Northern districts (Cayo, Belize, Orange Walk, Corozal) share one price. South districts (Stann Creek, Toledo) use the South column. Estimates are based on nursery box size at checkout.
        </p>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {(["central-northern", "south"] as const).map((zoneId) => (
            <div key={zoneId}>
              <p className="text-xs font-semibold text-ink/40">{idsRates.zones[zoneId].label}</p>
              <div className="mt-3 space-y-2">
                {IDS_PACKAGE_TIERS.map((tier) => (
                  <label key={tier} className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-ink/70">{idsPackageLabel(tier, idsRates)}</span>
                    <Input
                      className="w-full sm:w-28"
                      type="number"
                      step="0.01"
                      value={idsRates.zones[zoneId].packages[tier]}
                      onChange={(e) => updateIdsPackage(zoneId, tier, Number(e.target.value))}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl bg-cream/80 p-4">
          <p className="text-xs font-semibold text-ink/40">Preview</p>
          <IdsRateTable rates={idsRates} />
        </div>
      </section>

      {ezy && ezyIndex >= 0 && (
        <section className="mt-6 rounded-[24px] bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-forest">EZY Courier</h2>
            <Checkbox
              checked={ezy.active}
              onChange={(checked) => {
                const next = [...couriers];
                next[ezyIndex] = { ...ezy, active: checked };
                setCouriers(next);
              }}
              label="Active"
            />
          </div>
          <Input
            className="mt-3"
            value={ezy.notes}
            onChange={(e) => {
              const next = [...couriers];
              next[ezyIndex] = { ...ezy, notes: e.target.value };
              setCouriers(next);
            }}
          />
          <p className="mt-4 text-xs font-semibold text-ink/40">Approximate flat rates by district (BZD, pay at courier)</p>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            {ezy.rates.map((rate, ri) => (
              <label key={rate.district} className="text-sm">
                {rate.district}
                <Input
                  className="mt-1"
                  type="number"
                  value={rate.fee}
                  onChange={(e) => {
                    const next = [...couriers];
                    const rates = [...ezy.rates];
                    rates[ri] = { ...rate, fee: Number(e.target.value) };
                    next[ezyIndex] = { ...ezy, rates };
                    setCouriers(next);
                  }}
                />
              </label>
            ))}
          </div>
        </section>
      )}

      <Button className="mt-6" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save courier settings"}
      </Button>
      {saved && <p className="mt-2 text-sm text-leaf">Saved to database.</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
