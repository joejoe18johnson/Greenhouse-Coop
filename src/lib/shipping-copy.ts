import type { ShippingSettings } from "@/types";
import { formatBZD } from "@/lib/utils";

export function localDeliveryTownsLabel(settings: ShippingSettings, separator = " · ") {
  return settings.localDelivery.towns.join(separator);
}

export function localDeliveryTownsList(settings: ShippingSettings) {
  return settings.localDelivery.towns.join(", ");
}

export function localDeliveryFeeText(settings: ShippingSettings) {
  return `${formatBZD(settings.localDelivery.fee)} flat`;
}

export function localDeliveryFreeOverText(settings: ShippingSettings) {
  return `FREE over ${formatBZD(settings.localDelivery.freeThreshold)}`;
}

export function localDeliveryBlurb(settings: ShippingSettings) {
  return `Local delivery ${formatBZD(settings.localDelivery.fee)} to ${localDeliveryTownsList(settings)}. Free over ${formatBZD(settings.localDelivery.freeThreshold)}.`;
}

export function localDeliveryHomeBlurb(settings: ShippingSettings) {
  return `Pick up centrally at the Belmopan Bus Terminal, or use local delivery to ${localDeliveryTownsList(settings)} — ${formatBZD(settings.localDelivery.fee)} flat, free over ${formatBZD(settings.localDelivery.freeThreshold)}.`;
}

export function deliveryFaqAnswer(settings: ShippingSettings) {
  return `You can collect centrally at the Belmopan Bus Terminal if you do not want delivery. Local delivery is ${formatBZD(settings.localDelivery.fee)} to ${localDeliveryTownsList(settings)} — free over ${formatBZD(settings.localDelivery.freeThreshold)}. All other locations ship with IDS or EZY Courier. Couriers usually work office-to-office: collect at the courier office in your area, not at your door. Courier shipping is paid directly at the courier office. For IDS, Central and Northern districts (Cayo, Belize, Orange Walk, Corozal) share the same package rates; Stann Creek and Toledo use South rates. We show approximate IDS package estimates at checkout based on how many plants you order.`;
}

export function localDeliveryWaivedText(settings: ShippingSettings) {
  return ` — waived because your order is over ${formatBZD(settings.localDelivery.freeThreshold)}.`;
}
