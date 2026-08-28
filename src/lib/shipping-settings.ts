import shippingSeed from "@/data/shipping.json";
import type { LocalDeliverySettings, LocalDeliveryTown, ShippingSettings } from "@/types";

type LegacyLocalDelivery = {
  towns?: unknown[];
  fee?: number;
  freeThreshold?: number;
  currency?: string;
};

const defaultShipping = normalizeShippingSettings(shippingSeed as ShippingSettings);

export function normalizeLocalDelivery(raw: LegacyLocalDelivery): LocalDeliverySettings {
  const freeThreshold = typeof raw.freeThreshold === "number" ? raw.freeThreshold : 100;
  const currency = raw.currency ?? "BZD";
  const legacyFee = typeof raw.fee === "number" ? raw.fee : 0;
  const towns = raw.towns ?? [];

  if (towns.length && typeof towns[0] === "object" && towns[0] !== null && "name" in towns[0]) {
    return {
      freeThreshold,
      currency,
      towns: (towns as LocalDeliveryTown[]).map((town) => ({
        name: town.name.trim(),
        fee: Math.max(0, Number(town.fee) || 0),
      })).filter((town) => town.name),
    };
  }

  return {
    freeThreshold,
    currency,
    towns: (towns as string[])
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => ({ name, fee: legacyFee })),
  };
}

export function normalizeShippingSettings(raw: ShippingSettings | LegacyLocalDelivery & { boxes?: ShippingSettings["boxes"] }): ShippingSettings {
  const settings = raw as ShippingSettings;
  return {
    boxes: settings.boxes ?? defaultShipping.boxes,
    localDelivery: normalizeLocalDelivery(settings.localDelivery ?? raw),
  };
}

export function localTownNames(settings: LocalDeliverySettings) {
  return settings.towns.map((town) => town.name);
}

export function getDefaultShippingSettings() {
  return defaultShipping;
}
