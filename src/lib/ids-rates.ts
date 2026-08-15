import idsRatesSeed from "@/data/ids-rates.json";
import type { BoxRecommendation, IdsPackageTier, IdsRates } from "@/types";

const seed = idsRatesSeed as IdsRates;

export const IDS_PACKAGE_TIERS: IdsPackageTier[] = [
  "envelope",
  "xs",
  "small",
  "medium",
  "large",
  "xl",
];

export function getIdsZoneId(district: string, rates: IdsRates = seed) {
  const normalized = district.trim().toLowerCase();
  for (const [zoneId, zone] of Object.entries(rates.zones)) {
    if (zone.districts.some((d) => d.toLowerCase() === normalized)) {
      return zoneId as keyof IdsRates["zones"];
    }
  }
  return "central-northern";
}

export function getIdsZoneLabel(district: string, rates: IdsRates = seed) {
  const zoneId = getIdsZoneId(district, rates);
  return rates.zones[zoneId].label;
}

export function estimateIdsShipping(
  district: string,
  box: BoxRecommendation,
  rates: IdsRates = seed
) {
  const zoneId = getIdsZoneId(district, rates);
  const zone = rates.zones[zoneId];
  let total = 0;

  for (const row of box.boxes) {
    const tier = rates.boxToPackage[row.box.id] ?? "small";
    const unit = zone.packages[tier] ?? zone.packages.small;
    total += unit * row.quantity;
  }

  if (box.boxes.length === 0 && box.plantCount > 0) {
    total = zone.packages.small;
  }

  return {
    total,
    zoneId,
    zoneLabel: zone.label,
  };
}

export function idsPackageLabel(tier: IdsPackageTier, rates: IdsRates = seed) {
  return rates.packageLabels[tier] ?? tier;
}

export { seed as defaultIdsRates };
