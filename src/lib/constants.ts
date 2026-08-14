export const BRAND = {
  name: "Greenhouse Co-Op",
  short: "GreenHouse",
  tagline: "Premium Fruit Trees for Belize Gardens",
  email: "hello@greenhousecoop.com",
  phone: "+501 615-0000",
  whatsapp: "+5016150000",
  location: "Belmopan, Cayo, Belize",
};

export const INVENTORY_NOTICE =
  "Plant availability is subject to seasonal supply and nursery stock levels. If an item becomes unavailable after your order is placed, Greenhouse Co-Op will contact you with alternative options or issue a full refund for the unavailable item.";

export const PAYMENT_NOTICE =
  "First place your order to receive a 6-character reference number. Include that number in your bank transfer notes, then send your payment screenshot to us on WhatsApp with the same reference. Failure to include your reference number may delay order processing.";

export const CART_HOLD_HOURS = 72;
export const CART_HOLD_MS = CART_HOLD_HOURS * 60 * 60 * 1000;

export const ADMIN_EMAIL = "admin@greenhousecoop.com";
export const ADMIN_PASSWORD = "admin123";

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
