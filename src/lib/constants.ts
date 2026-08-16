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
  "Collect Your Trees At The Belmopan Bus Terminal — A Central Pickup Point. No Delivery Or Courier Fee. We Will Confirm When The Order Is Ready.";

export const INVENTORY_NOTICE =
  "Plant Availability Is Subject To Seasonal Supply And Nursery Stock Levels. If An Item Becomes Unavailable After Your Order Is Placed, Greenhouse Co-Op Will Contact You With Alternative Options Or Issue A Full Refund For The Unavailable Item.";

export const COURIER_ESTIMATE_NOTICE =
  "Courier Shipping Is Paid Directly At The Courier Office When You Collect Your Trees. IDS Uses Published Package Rates — Central And Northern Districts Share The Same Price. Amounts Shown Are Approximate Guides Only.";

export const PAYMENT_NOTICE =
  "First Place Your Order To Receive A 6-Character Reference Number. Include That Number In Your Bank Transfer Notes, Then Send Your Payment Screenshot To Us On WhatsApp With The Same Reference. Failure To Include Your Reference Number May Delay Order Processing.";

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
export const DEMO_SEED_VERSION = "v4";
export const CATALOG_SEED_VERSION = "v4";

export const STORAGE_KEYS = {
  products: "products",
  users: "users",
  session: "session",
  cart: "cart",
  orders: "orders",
  shipping: "shipping",
  couriers: "couriers",
  idsRates: "idsRates",
  bank: "bank",
  hydrated: "hydrated",
  demoSeed: "demoSeed",
  catalogSeed: "catalogSeed",
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
  "Tropical",
] as const;
