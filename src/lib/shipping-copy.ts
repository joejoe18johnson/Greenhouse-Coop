import type { ShippingSettings } from "@/types";
import { formatBZD } from "@/lib/utils";
import { getLocalTownFee } from "@/lib/shipping";
import { localTownNames } from "@/lib/shipping-settings";

export function localDeliveryTownsLabel(settings: ShippingSettings, separator = " · ") {
  return localTownNames(settings.localDelivery).join(separator);
}

export function localDeliveryTownsList(settings: ShippingSettings) {
  return localTownNames(settings.localDelivery).join(", ");
}

function localDeliveryFeeSummary(settings: ShippingSettings) {
  const fees = settings.localDelivery.towns.map((town) => town.fee);
  if (!fees.length) return "Contact us";
  const min = Math.min(...fees);
  const max = Math.max(...fees);
  if (min === 0 && max === 0) return "FREE";
  if (min === max) return min === 0 ? "FREE" : `${formatBZD(min)} flat`;
  if (min === 0) return `FREE–${formatBZD(max)} by area`;
  return `${formatBZD(min)}–${formatBZD(max)} by area`;
}

export function localDeliveryFeeText(settings: ShippingSettings) {
  return localDeliveryFeeSummary(settings);
}

export function localDeliveryFeeForTownText(settings: ShippingSettings, town: string) {
  const baseFee = getLocalTownFee(town, settings.localDelivery);
  return baseFee === 0 ? "FREE" : formatBZD(baseFee);
}

export function localDeliveryBlurb(settings: ShippingSettings) {
  const summary = localDeliveryFeeSummary(settings);
  return `Local delivery ${summary} to ${localDeliveryTownsList(settings)}.`;
}

export function localDeliveryHomeBlurb(settings: ShippingSettings) {
  return `Pick up centrally at the Belmopan Bus Terminal, or use local delivery to ${localDeliveryTownsList(settings)} — ${localDeliveryFeeSummary(settings)}.`;
}

export function checkoutDeliverySummary(settings: ShippingSettings) {
  return `You can collect centrally at the Belmopan Bus Terminal if you do not want delivery. Local delivery is ${localDeliveryFeeSummary(settings)} to ${localDeliveryTownsList(settings)}. All other locations ship with IDS or EZY Courier. Couriers usually work office-to-office: collect at the courier office in your area, not at your door. Courier shipping is paid directly at the courier office. For IDS, Central and Northern districts (Cayo, Belize, Orange Walk, Corozal) share the same package rates; Stann Creek and Toledo use South rates. We show approximate IDS package estimates at checkout based on how many plants you order.`;
}

/** @deprecated use checkoutDeliverySummary */
export const checkoutFulfillmentSummary = checkoutDeliverySummary;

export function deliveryFaqAnswer(settings: ShippingSettings) {
  return checkoutDeliverySummary(settings);
}
