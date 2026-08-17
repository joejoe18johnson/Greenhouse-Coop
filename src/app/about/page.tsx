import { Clock, Leaf, Percent } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-xs text-leaf">About</p>
      <h1 className="page-title mt-2">Greenhouse Co-Op</h1>
      <p className="mt-6 text-lg leading-relaxed text-ink/70">
        Greenhouse Co-Op is a Belize nursery growing grafted, air-layered, and seedling fruit trees for home gardens and small orchards. We select varieties that perform in Belize heat, humidity, and rainfall — from Belmopan yards to coastal plots.
      </p>
      <p className="mt-4 leading-relaxed text-ink/70">
        Version 1 of this shop is designed to feel like a modern garden house: fruit first, then the tree. Orders are confirmed by bank transfer with a unique reference number. Inventory moves with the season, and we will always offer an alternative or a refund if a plant is no longer available.
      </p>
      <div className="mt-10 rounded-[28px] bg-forest-dark p-8 text-cream">
        <h2 className="font-display text-3xl">Nursery notes</h2>
        <ul className="mt-4 space-y-3 text-cream/80">
          <li className="flex items-start gap-3">
            <Percent className="mt-0.5 h-4 w-4 shrink-0 text-lime-bright" />
            50% may be requested to process larger custom orders.
          </li>
          <li className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-lime-bright" />
            Seasonal crops can take 6–8 weeks if a tree is still finishing in the nursery.
          </li>
          <li className="flex items-start gap-3">
            <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-lime-bright" />
            Organic compost and coco peat are available — ask when you order.
          </li>
        </ul>
      </div>
    </div>
  );
}
