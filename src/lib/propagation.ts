import type { PropagationType } from "@/types";

export type PropagationInfo = {
  label: PropagationType;
  title: string;
  summary: string;
  benefits: { title: string; text: string }[];
};

export const PROPAGATION_TYPES: PropagationType[] = [
  "Grafted",
  "Air-Layered",
  "Selective Breeding",
];

export const PROPAGATION_INFO: Record<PropagationType, PropagationInfo> = {
  Grafted: {
    label: "Grafted",
    title: "Grafting",
    summary: "Join a chosen variety to hardy roots for faster, reliable fruit.",
    benefits: [
      { title: "Faster fruit", text: "Crops produce food years earlier than plants grown from seeds." },
      { title: "Disease resistance", text: "Strong rootstocks protect vulnerable plants from soil-borne diseases and pests." },
      { title: "Perfect clones", text: "Guarantees the new plant produces identical, high-quality fruit." },
      { title: "Weather tolerance", text: "Hardy roots help delicate varieties survive poor soil, drought, or extreme cold." },
      { title: "Space saving", text: "Dwarf rootstocks keep trees small for easy harvesting in tight spaces." },
      { title: "Multi-fruit trees", text: "You can grow multiple different fruit varieties on a single tree structure." },
    ],
  },
  "Air-Layered": {
    label: "Air-Layered",
    title: "Air-layering",
    summary: "Root a mature branch while it still feeds from the parent tree.",
    benefits: [
      { title: "High success", text: "The branch receives continuous water and nutrients from the parent plant while growing roots." },
      { title: "Instant maturity", text: "You get a large, mature plant that can produce fruit or flowers immediately." },
      { title: "Exact replica", text: "The new plant is a perfect genetic clone of the parent, keeping all its best traits." },
      { title: "No rootstock", text: "Unlike grafting, you do not need to find or grow a separate compatible rootstock." },
    ],
  },
  "Selective Breeding": {
    label: "Selective Breeding",
    title: "Selective breeding",
    summary: "Nursery-selected stock chosen for yield, flavor, and local performance — not random seedlings.",
    benefits: [
      { title: "Higher yields", text: "Plants produce more fruit, vegetables, or seeds." },
      { title: "Better quality", text: "Harvests taste better, look nicer, and last longer." },
      { title: "Disease resistance", text: "Crops naturally fight off bugs and sicknesses." },
      { title: "Climate adaptability", text: "Plants survive local weather, droughts, or frosts better." },
      { title: "Faster growth", text: "Crops mature quicker, saving time and resources." },
    ],
  },
  Seedling: {
    label: "Seedling",
    title: "Seedling",
    summary: "Young nursery-grown plants raised from seed and ready to establish in your garden.",
    benefits: [
      { title: "Affordable start", text: "A practical way to grow tropical fruit trees at a lower entry price." },
      { title: "Strong roots", text: "Seedlings adapt to local soil once planted and watered well." },
      { title: "Seasonal supply", text: "Availability follows nursery seedling batches through the year." },
    ],
  },
};

export function normalizePropagationType(value: string): PropagationType {
  if (value in PROPAGATION_INFO) return value as PropagationType;
  return "Grafted";
}

export function propagationInfo(type: string): PropagationInfo {
  return PROPAGATION_INFO[normalizePropagationType(type)];
}
