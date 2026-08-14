"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getShippingSettings, saveShippingSettings } from "@/lib/store";

export default function AdminShippingPage() {
  const [settings, setSettings] = useState(getShippingSettings());
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <h1 className="font-display text-4xl text-forest-dark">Shipping settings</h1>
      <div className="mt-6 space-y-6 rounded-[24px] bg-white p-6">
        <div>
          <Label>Local delivery fee (BZD)</Label>
          <Input className="mt-1 max-w-xs" type="number" value={settings.localDelivery.fee} onChange={(e) => setSettings({ ...settings, localDelivery: { ...settings.localDelivery, fee: Number(e.target.value) } })} />
        </div>
        <div>
          <Label>Free over (BZD)</Label>
          <Input className="mt-1 max-w-xs" type="number" value={settings.localDelivery.freeThreshold} onChange={(e) => setSettings({ ...settings, localDelivery: { ...settings.localDelivery, freeThreshold: Number(e.target.value) } })} />
        </div>
        <div>
          <Label>Local towns (comma separated)</Label>
          <Input className="mt-1" value={settings.localDelivery.towns.join(", ")} onChange={(e) => setSettings({ ...settings, localDelivery: { ...settings.localDelivery, towns: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) } })} />
        </div>
        <div className="space-y-3">
          <h2 className="font-semibold text-forest">Box pricing</h2>
          {settings.boxes.map((box, i) => (
            <div key={box.id} className="grid gap-2 md:grid-cols-4">
              <Input value={box.name} onChange={(e) => {
                const boxes = [...settings.boxes];
                boxes[i] = { ...box, name: e.target.value };
                setSettings({ ...settings, boxes });
              }} />
              <Input type="number" value={box.price} onChange={(e) => {
                const boxes = [...settings.boxes];
                boxes[i] = { ...box, price: Number(e.target.value) };
                setSettings({ ...settings, boxes });
              }} />
              <Input type="number" value={box.minPlants} onChange={(e) => {
                const boxes = [...settings.boxes];
                boxes[i] = { ...box, minPlants: Number(e.target.value) };
                setSettings({ ...settings, boxes });
              }} />
              <Input type="number" value={box.maxPlants} onChange={(e) => {
                const boxes = [...settings.boxes];
                boxes[i] = { ...box, maxPlants: Number(e.target.value) };
                setSettings({ ...settings, boxes });
              }} />
            </div>
          ))}
        </div>
        <Button onClick={() => { saveShippingSettings(settings); setSaved(true); }}>Save shipping</Button>
        {saved && <p className="text-sm text-leaf">Saved.</p>}
      </div>
    </div>
  );
}
