import type {
  BoxRecommendation,
  BoxSize,
  Courier,
  LocalDeliverySettings,
  ShippingSettings,
} from "@/types";

export function recommendBox(
  plantCount: number,
  boxes: BoxSize[]
): BoxRecommendation {
  const sorted = [...boxes].sort((a, b) => b.maxPlants - a.maxPlants);
  if (plantCount <= 0 || sorted.length === 0) {
    return { boxes: [], plantCount, total: 0, label: "No box required" };
  }

  const largest = sorted[0];
  const picked: Record<string, { box: BoxSize; quantity: number }> = {};
  let remaining = plantCount;

  while (remaining > 0) {
    const fit =
      sorted.find((b) => remaining >= b.minPlants && remaining <= b.maxPlants) ||
      (remaining > largest.maxPlants
        ? largest
        : sorted.find((b) => remaining <= b.maxPlants) || largest);

    if (!picked[fit.id]) picked[fit.id] = { box: fit, quantity: 0 };
    picked[fit.id].quantity += 1;
    remaining -= Math.min(remaining, fit.maxPlants);
  }

  const used = Object.values(picked);
  const total = used.reduce((sum, row) => sum + row.box.price * row.quantity, 0);
  const label = used
    .map((row) =>
      row.quantity > 1 ? `${row.quantity}× ${row.box.name}` : row.box.name
    )
    .join(" + ");

  return { boxes: used, plantCount, total, label };
}

export function isLocalTown(town: string, settings: LocalDeliverySettings) {
  return settings.towns.some(
    (t) => t.toLowerCase() === town.trim().toLowerCase()
  );
}

export function getLocalDeliveryFee(
  subtotal: number,
  settings: LocalDeliverySettings
) {
  if (subtotal >= settings.freeThreshold) return 0;
  return settings.fee;
}

export function getCourierFee(
  courier: Courier | undefined,
  district: string
) {
  if (!courier) return 0;
  const match = courier.rates.find(
    (r) => r.district.toLowerCase() === district.toLowerCase()
  );
  return match?.fee ?? 0;
}

export function quoteShipping(options: {
  plantCount: number;
  subtotal: number;
  town: string;
  district: string;
  method: "local" | "courier" | "pickup";
  courier?: Courier;
  shipping: ShippingSettings;
}) {
  const box = recommendBox(options.plantCount, options.shipping.boxes);
  const local = isLocalTown(options.town, options.shipping.localDelivery);

  if (options.method === "pickup") {
    return {
      method: "pickup" as const,
      deliveryFee: 0,
      courierFee: 0,
      boxFee: 0,
      box,
      localEligible: local,
    };
  }

  if (options.method === "local" && local) {
    return {
      method: "local" as const,
      deliveryFee: getLocalDeliveryFee(
        options.subtotal,
        options.shipping.localDelivery
      ),
      courierFee: 0,
      boxFee: 0,
      box,
      localEligible: true,
    };
  }

  return {
    method: "courier" as const,
    deliveryFee: 0,
    courierFee: getCourierFee(options.courier, options.district),
    boxFee: box.total,
    box,
    localEligible: local,
  };
}

export function fulfillmentLabel(shipping: {
  method: "local" | "courier" | "pickup";
  courierName?: string;
}) {
  if (shipping.method === "pickup") return "Nursery collection in Belmopan";
  if (shipping.method === "local") return "Local delivery";
  return shipping.courierName
    ? `${shipping.courierName} · office-to-office`
    : "Courier · office-to-office";
}
