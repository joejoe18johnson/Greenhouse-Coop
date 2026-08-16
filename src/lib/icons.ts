import type { LucideIcon } from "lucide-react";
import {
  Apple,
  Banana,
  Banknote,
  Bean,
  BookOpen,
  Cherry,
  CircleHelp,
  Citrus,
  Clock,
  Flower2,
  Grape,
  Home,
  Leaf,
  Nut,
  Package,
  Ruler,
  Sprout,
  Star,
  TreePalm,
  Truck,
  UserRound,
} from "lucide-react";

export const NAV_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: Sprout },
  { href: "/catalog", label: "Catalog", icon: BookOpen },
  { href: "/delivery", label: "Delivery", icon: Truck },
  { href: "/faq", label: "FAQ", icon: CircleHelp },
  { href: "/about", label: "About", icon: Leaf },
];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Avocado: Bean,
  Mango: Banana,
  Orange: Citrus,
  Lime: Citrus,
  Lemon: Citrus,
  "Specialty Citrus": Citrus,
  Apple,
  Plum: Cherry,
  Guava: Apple,
  Fig: Cherry,
  Berry: Grape,
  Soursop: Sprout,
  "Passion Fruit": Flower2,
  "Dragon Fruit": Flower2,
  Coconut: TreePalm,
  Starfruit: Star,
  Jackfruit: TreePalm,
  Nut,
  Spice: Leaf,
  Tropical: TreePalm,
};

export function categoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? Sprout;
}

export const PROP_ICONS: Record<string, LucideIcon> = {
  Grafted: Sprout,
  "Air-Layered": Leaf,
  "Selective Breeding": Flower2,
};

export const FAQ_ICONS: Record<string, LucideIcon> = {
  payment: Banknote,
  delivery: Truck,
  stock: Sprout,
  "cart-hold": Clock,
  account: UserRound,
  size: Ruler,
  boxes: Package,
};
