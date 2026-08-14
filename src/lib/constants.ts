export const BRAND = {
  name: "Greenhouse Co-Op",
  short: "GreenHouse",
  tagline: "Premium Fruit Trees for Belize Gardens",
  email: "hello@greenhousecoop.com",
  phone: "+501 624-0588",
  whatsapp: "+5016240588",
  location: "Belmopan, Cayo, Belize",
};

export const PICKUP_LOCATION = "Belmopan Bus Terminal";
export const PICKUP_NOTE =
  "Collect your trees at the Belmopan Bus Terminal — a central pickup point. No delivery or courier fee. We will confirm when the order is ready.";

export const INVENTORY_NOTICE =
  "Plant availability is subject to seasonal supply and nursery stock levels. If an item becomes unavailable after your order is placed, Greenhouse Co-Op will contact you with alternative options or issue a full refund for the unavailable item.";

export const PAYMENT_NOTICE =
  "First place your order to receive a 6-character reference number. Include that number in your bank transfer notes, then send your payment screenshot to us on WhatsApp with the same reference. Failure to include your reference number may delay order processing.";

export const CART_HOLD_HOURS = 72;
export const CART_HOLD_MS = CART_HOLD_HOURS * 60 * 60 * 1000;

export const FAST_SELLER_IDS = [
  "mangosteen",
  "strawberry-deleez",
  "pink-cuban-guava",
  "blood-orange",
  "hass-black-avocado",
  "valencia-red-orange",
] as const;

export const SHORT_SUPPLY_IDS = ["mangosteen", "strawberry-deleez"] as const;

export const ADMIN_EMAIL = "admin@greenhousecoop.com";
export const ADMIN_PASSWORD = "admin123";
export const DEMO_CUSTOMER_EMAIL = "customer@greenhousecoop.com";
export const DEMO_CUSTOMER_PASSWORD = "customer123";
export const DEMO_SEED_VERSION = "v2";

export const STORAGE_KEYS = {
  products: "products",
  users: "users",
  session: "session",
  cart: "cart",
  orders: "orders",
  shipping: "shipping",
  couriers: "couriers",
  bank: "bank",
  hydrated: "hydrated",
  demoSeed: "demoSeed",
} as const;

export const ORDER_STATUSES = [
  "Payment Pending",
  "Payment Review",
  "Paid",
  "Processing",
  "Shipped",
  "Completed",
  "Refunded",
] as const;

export const CATEGORIES = [
  "Avocado",
  "Mango",
  "Orange",
  "Lime",
  "Lemon",
  "Specialty Citrus",
  "Apple",
  "Plum",
  "Guava",
  "Fig",
  "Berry",
  "Soursop",
  "Passion Fruit",
  "Dragon Fruit",
  "Coconut",
  "Starfruit",
  "Jackfruit",
  "Nut",
  "Spice",
  "Tropical",
] as const;
