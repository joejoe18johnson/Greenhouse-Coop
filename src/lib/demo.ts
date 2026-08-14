import {
  ADMIN_EMAIL,
  DEMO_CUSTOMER_EMAIL,
  DEMO_CUSTOMER_PASSWORD,
  DEMO_SEED_VERSION,
  PICKUP_LOCATION,
  STORAGE_KEYS,
} from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage";
import { hashPassword } from "@/lib/utils";
import { recommendBox } from "@/lib/shipping";
import type { Order, Product, ShippingSettings, User } from "@/types";
import shippingSeed from "@/data/shipping.json";

const shipping = shippingSeed as ShippingSettings;

function at(daysAgo: number, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 12, 0, 0);
  return d.toISOString();
}

function emptyBox(count: number) {
  return { boxes: [], plantCount: count, total: 0, label: "No box required" };
}

export async function seedDemoCustomer(): Promise<User> {
  const passwordHash = await hashPassword(DEMO_CUSTOMER_PASSWORD);
  return {
    id: "user_demo_carlos",
    firstName: "Carlos",
    lastName: "Li",
    email: DEMO_CUSTOMER_EMAIL,
    phone: "608-8688",
    passwordHash,
    addresses: [
      {
        id: "addr_demo_carlos",
        label: "Home",
        district: "Cayo",
        town: "Camalote",
        village: "",
        fullAddress: "Main Road, Camalote",
        isDefault: true,
      },
    ],
    createdAt: at(40),
    role: "customer",
  };
}

export async function seedDemoMaya(): Promise<User> {
  const passwordHash = await hashPassword(DEMO_CUSTOMER_PASSWORD);
  return {
    id: "user_demo_maya",
    firstName: "Maya",
    lastName: "Castillo",
    email: "maya@greenhousecoop.com",
    phone: "615-4410",
    passwordHash,
    addresses: [
      {
        id: "addr_demo_maya",
        label: "Home",
        district: "Belize",
        town: "Belize City",
        village: "",
        fullAddress: "12 Princess Margaret Drive",
        isDefault: true,
      },
    ],
    createdAt: at(28),
    role: "customer",
  };
}

export function seedDemoOrders(products: Product[]): Order[] {
  const mangosteen = products.find((p) => p.id === "mangosteen");
  const strawberry = products.find((p) => p.id === "strawberry-deleez");
  const guava = products.find((p) => p.id === "pink-cuban-guava");
  const blood = products.find((p) => p.id === "blood-orange");
  const hass = products.find((p) => p.id === "hass-black-avocado");
  const valencia = products.find((p) => p.id === "valencia-red-orange");
  const glenn = products.find((p) => p.id === "glenn-mango");

  const item = (p: Product | undefined, qty: number) => ({
    productId: p?.id || "unknown",
    name: p?.name || "Tree",
    price: p?.price || 0,
    quantity: qty,
  });

  const localBox = emptyBox(2);
  const courierBox = recommendBox(3, shipping.boxes);

  const pending: Order = {
    id: "ord_demo_pending",
    reference: "K4M9P2",
    invoiceNumber: "INV-00187",
    userId: "user_demo_carlos",
    items: [item(strawberry, 2)],
    subtotal: 40,
    deliveryFee: 0,
    boxFee: 0,
    courierFee: 0,
    total: 40,
    boxRecommendation: emptyBox(2),
    status: "Payment Pending",
    shipping: {
      firstName: "Carlos",
      lastName: "Li",
      email: DEMO_CUSTOMER_EMAIL,
      phone: "608-8688",
      district: "Cayo",
      town: "Belmopan",
      village: "",
      fullAddress: PICKUP_LOCATION,
      method: "pickup",
    },
    payment: { method: "bank-transfer", proofChannel: "whatsapp" },
    createdAt: at(0, 16),
    updatedAt: at(0, 16),
    timeline: [{ status: "Payment Pending", at: at(0, 16), note: "Order placed" }],
  };

  const review: Order = {
    id: "ord_demo_review",
    reference: "A7B2K9",
    invoiceNumber: "INV-00186",
    userId: "user_demo_carlos",
    items: [item(mangosteen, 2)],
    subtotal: 60,
    deliveryFee: 10,
    boxFee: 0,
    courierFee: 0,
    total: 70,
    boxRecommendation: localBox,
    status: "Payment Review",
    shipping: {
      firstName: "Carlos",
      lastName: "Li",
      email: DEMO_CUSTOMER_EMAIL,
      phone: "608-8688",
      district: "Cayo",
      town: "Camalote",
      village: "",
      fullAddress: "Main Road, Camalote",
      method: "local",
    },
    payment: { method: "bank-transfer", proofChannel: "whatsapp" },
    createdAt: at(1, 9),
    updatedAt: at(1, 14),
    timeline: [
      { status: "Payment Pending", at: at(1, 9), note: "Order placed" },
      { status: "Payment Review", at: at(1, 14), note: "Payment screenshot received on WhatsApp" },
    ],
  };

  const paid: Order = {
    id: "ord_demo_paid",
    reference: "OCFB18",
    invoiceNumber: "INV-00183",
    invoiceIssuedAt: at(3, 15),
    userId: "user_demo_carlos",
    items: [item(mangosteen, 2), item(blood, 1)],
    subtotal: 75,
    deliveryFee: 10,
    boxFee: 0,
    courierFee: 0,
    total: 85,
    boxRecommendation: localBox,
    status: "Paid",
    shipping: {
      firstName: "Carlos",
      lastName: "Li",
      email: DEMO_CUSTOMER_EMAIL,
      phone: "608-8688",
      district: "Cayo",
      town: "Camalote",
      village: "",
      fullAddress: "Main Road, Camalote",
      method: "local",
    },
    payment: {
      method: "bank-transfer",
      proofChannel: "whatsapp",
      reviewedAt: at(3, 15),
      reviewedBy: "admin",
    },
    createdAt: at(4, 10),
    updatedAt: at(3, 15),
    timeline: [
      { status: "Payment Pending", at: at(4, 10), note: "Order placed" },
      { status: "Payment Review", at: at(3, 11), note: "Proof received on WhatsApp" },
      { status: "Paid", at: at(3, 15), note: "Payment confirmed. Invoice issued." },
    ],
  };

  const processing: Order = {
    id: "ord_demo_processing",
    reference: "H3N8Q5",
    invoiceNumber: "INV-00180",
    invoiceIssuedAt: at(6, 12),
    userId: "user_demo_maya",
    items: [item(hass, 2), item(glenn, 1)],
    subtotal: 58,
    deliveryFee: 0,
    boxFee: courierBox.total,
    courierFee: 22,
    total: 58 + courierBox.total + 22,
    boxRecommendation: courierBox,
    status: "Processing",
    shipping: {
      firstName: "Maya",
      lastName: "Castillo",
      email: "maya@greenhousecoop.com",
      phone: "615-4410",
      district: "Belize",
      town: "Belize City",
      village: "",
      fullAddress: "12 Princess Margaret Drive",
      method: "courier",
      courierId: "ids",
      courierName: "IDS Courier",
    },
    payment: {
      method: "bank-transfer",
      proofChannel: "whatsapp",
      reviewedAt: at(6, 12),
      reviewedBy: "admin",
    },
    createdAt: at(8, 11),
    updatedAt: at(5, 9),
    timeline: [
      { status: "Payment Pending", at: at(8, 11), note: "Order placed" },
      { status: "Paid", at: at(6, 12), note: "Payment confirmed. Invoice issued." },
      { status: "Processing", at: at(5, 9), note: "Order confirmed for fulfillment." },
    ],
  };

  const shipped: Order = {
    id: "ord_demo_shipped",
    reference: "R9T2L6",
    invoiceNumber: "INV-00174",
    invoiceIssuedAt: at(10, 15),
    userId: "user_demo_carlos",
    items: [item(hass, 1), item(valencia, 2)],
    subtotal: 50,
    deliveryFee: 10,
    boxFee: 0,
    courierFee: 0,
    total: 60,
    boxRecommendation: localBox,
    status: "Shipped",
    shipping: {
      firstName: "Carlos",
      lastName: "Li",
      email: DEMO_CUSTOMER_EMAIL,
      phone: "608-8688",
      district: "Cayo",
      town: "Camalote",
      village: "",
      fullAddress: "Main Road, Camalote",
      method: "local",
    },
    payment: {
      method: "bank-transfer",
      proofChannel: "whatsapp",
      reviewedAt: at(10, 15),
      reviewedBy: "admin",
    },
    createdAt: at(12, 8),
    updatedAt: at(2, 13),
    timeline: [
      { status: "Payment Pending", at: at(12, 8), note: "Order placed" },
      { status: "Paid", at: at(10, 15), note: "Payment confirmed. Invoice issued." },
      { status: "Processing", at: at(9, 10), note: "Order confirmed for fulfillment." },
      { status: "Shipped", at: at(2, 13), note: "Order sent — local drop-off in Camalote." },
    ],
  };

  const completed: Order = {
    id: "ord_demo_completed",
    reference: "W5C1J8",
    invoiceNumber: "INV-00161",
    invoiceIssuedAt: at(18, 10),
    userId: "user_demo_maya",
    items: [item(guava, 1), item(valencia, 2)],
    subtotal: 55,
    deliveryFee: 0,
    boxFee: 0,
    courierFee: 0,
    total: 55,
    boxRecommendation: emptyBox(3),
    status: "Completed",
    shipping: {
      firstName: "Maya",
      lastName: "Castillo",
      email: "maya@greenhousecoop.com",
      phone: "615-4410",
      district: "Cayo",
      town: "Belmopan",
      village: "",
      fullAddress: PICKUP_LOCATION,
      method: "pickup",
    },
    payment: {
      method: "bank-transfer",
      proofChannel: "whatsapp",
      reviewedAt: at(18, 10),
      reviewedBy: "admin",
    },
    createdAt: at(21, 14),
    updatedAt: at(7, 16),
    timeline: [
      { status: "Payment Pending", at: at(21, 14), note: "Order placed" },
      { status: "Paid", at: at(18, 10), note: "Payment confirmed. Invoice issued." },
      { status: "Processing", at: at(16, 9), note: "Ready for collection." },
      { status: "Shipped", at: at(8, 11), note: "Held at Belmopan Bus Terminal." },
      { status: "Completed", at: at(7, 16), note: "Collected by customer." },
    ],
  };

  return [pending, review, paid, processing, shipped, completed];
}

export async function ensureDemoData(options: {
  seedAdmin: () => Promise<User>;
  products: Product[];
}) {
  const users = getItem<User[]>(STORAGE_KEYS.users, []);
  const orders = getItem<Order[]>(STORAGE_KEYS.orders, []);
  const version = getItem<string>(STORAGE_KEYS.demoSeed, "");

  const demoUsers = [await seedDemoCustomer(), await seedDemoMaya()];
  let nextUsers = [...users];
  for (const demo of demoUsers) {
    if (!nextUsers.some((u) => u.id === demo.id || u.email === demo.email)) {
      nextUsers.push(demo);
    } else {
      nextUsers = nextUsers.map((u) => (u.id === demo.id || u.email === demo.email ? { ...u, ...demo } : u));
    }
  }
  if (!nextUsers.some((u) => u.email === ADMIN_EMAIL)) {
    nextUsers.unshift(await options.seedAdmin());
  }
  setItem(STORAGE_KEYS.users, nextUsers);

  if (version !== DEMO_SEED_VERSION) {
    const demoOrders = seedDemoOrders(options.products);
    const kept = orders.filter((o) => !o.id.startsWith("ord_demo_"));
    setItem(STORAGE_KEYS.orders, [...demoOrders, ...kept]);
    setItem(STORAGE_KEYS.demoSeed, DEMO_SEED_VERSION);
  }
}
