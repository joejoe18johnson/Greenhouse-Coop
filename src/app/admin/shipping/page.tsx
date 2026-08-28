"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getShippingSettings, saveShippingSettings } from "@/lib/store";
import { useStore } from "@/context/store-context";
import { useStoreSync } from "@/hooks/use-store-sync";
import type { LocalDeliveryTown, ShippingSettings } from "@/types";

function parseFee(value: string) {
  const fee = Number(value);
  if (!Number.isFinite(fee) || fee < 0) return 0;
  return fee;
}

export default function AdminShippingPage() {
  const { ready } = useStore();
  const [settings, setSettings] = useState(getShippingSettings());
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useStoreSync(() => {
    setSettings(getShippingSettings());
  });

  useEffect(() => {
    if (ready) setSettings(getShippingSettings());
  }, [ready]);

  function updateTown(index: number, patch: Partial<LocalDeliveryTown>) {
    const towns = settings.localDelivery.towns.map((town, i) =>
      i === index ? { ...town, ...patch } : town
    );
    setSettings({
      ...settings,
      localDelivery: { ...settings.localDelivery, towns },
    });
  }

  function addTown() {
    setSettings({
      ...settings,
      localDelivery: {
        ...settings.localDelivery,
        towns: [...settings.localDelivery.towns, { name: "", fee: 0 }],
      },
    });
  }

  function removeTown(index: number) {
    setSettings({
      ...settings,
      localDelivery: {
        ...settings.localDelivery,
        towns: settings.localDelivery.towns.filter((_, i) => i !== index),
      },
    });
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const cleaned: ShippingSettings = {
        ...settings,
        localDelivery: {
          ...settings.localDelivery,
          towns: settings.localDelivery.towns
            .map((town) => ({
              name: town.name.trim(),
              fee: parseFee(String(town.fee)),
            }))
            .filter((town) => town.name),
        },
      };
      if (!cleaned.localDelivery.towns.length) {
        throw new Error("Add at least one local delivery area.");
      }
      await saveShippingSettings(cleaned);
      setSettings(getShippingSettings());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save shipping settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-w-0">
      <h1 className="page-title">Shipping settings</h1>
      <div className="mt-6 space-y-6 rounded-[24px] bg-white p-6">
        <div>
          <h2 className="font-semibold text-forest">Local delivery areas</h2>
          <p className="mt-1 text-sm text-ink/55">
            Set a delivery fee for each local town. Use <strong>0</strong> for free delivery to that area.
          </p>
          <div className="mt-4 space-y-3">
            {settings.localDelivery.towns.map((town, index) => (
              <div key={`${town.name}-${index}`} className="grid gap-2 sm:grid-cols-[1fr_140px_auto]">
                <div>
                  {index === 0 && <Label className="text-xs text-ink/45">Town</Label>}
                  <Input
                    className="mt-1"
                    value={town.name}
                    placeholder="Belmopan"
                    onChange={(e) => updateTown(index, { name: e.target.value })}
                  />
                </div>
                <div>
                  {index === 0 && <Label className="text-xs text-ink/45">Fee (BZD)</Label>}
                  <Input
                    className="mt-1"
                    type="number"
                    min={0}
                    step={1}
                    value={town.fee}
                    onChange={(e) => updateTown(index, { fee: parseFee(e.target.value) })}
                  />
                </div>
                <div className={index === 0 ? "sm:mt-6" : ""}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${town.name || "town"}`}
                    onClick={() => removeTown(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" className="mt-4 gap-2" onClick={addTown}>
            <Plus className="h-4 w-4" />
            Add local area
          </Button>
        </div>

        <div>
          <Label>Free delivery over (BZD)</Label>
          <p className="mt-1 text-xs text-ink/45">
            Applies to paid local areas only. Towns set to 0 stay free regardless of order size.
          </p>
          <Input
            className="mt-2 max-w-xs"
            type="number"
            min={0}
            value={settings.localDelivery.freeThreshold}
            onChange={(e) =>
              setSettings({
                ...settings,
                localDelivery: {
                  ...settings.localDelivery,
                  freeThreshold: Math.max(0, Number(e.target.value) || 0),
                },
              })
            }
          />
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-forest">Box pricing</h2>
          {settings.boxes.map((box, i) => (
            <div key={box.id} className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              <Input
                value={box.name}
                onChange={(e) => {
                  const boxes = [...settings.boxes];
                  boxes[i] = { ...box, name: e.target.value };
                  setSettings({ ...settings, boxes });
                }}
              />
              <Input
                type="number"
                value={box.price}
                onChange={(e) => {
                  const boxes = [...settings.boxes];
                  boxes[i] = { ...box, price: Number(e.target.value) };
                  setSettings({ ...settings, boxes });
                }}
              />
              <Input
                type="number"
                value={box.minPlants}
                onChange={(e) => {
                  const boxes = [...settings.boxes];
                  boxes[i] = { ...box, minPlants: Number(e.target.value) };
                  setSettings({ ...settings, boxes });
                }}
              />
              <Input
                type="number"
                value={box.maxPlants}
                onChange={(e) => {
                  const boxes = [...settings.boxes];
                  boxes[i] = { ...box, maxPlants: Number(e.target.value) };
                  setSettings({ ...settings, boxes });
                }}
              />
            </div>
          ))}
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save shipping"}
        </Button>
        {saved && <p className="text-sm text-leaf">Saved to database.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
