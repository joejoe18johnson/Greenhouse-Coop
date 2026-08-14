import productsSeed from "@/data/products.json";
import shippingSeed from "@/data/shipping.json";
import couriersSeed from "@/data/couriers.json";
import bankSeed from "@/data/bank.json";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  CART_HOLD_MS,
  STORAGE_KEYS,
} from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage";
import { generateId, generateInvoiceNumber, generateReference, hashPassword } from "@/lib/utils";
import { ensureDemoData } from "@/lib/demo";
import type {
  BankDetails,
  CartItem,
  Courier,
  Order,
  OrderStatus,
  Product,
  Session,
  ShippingSettings,
  StoredCart,
  User,
} from "@/types";

const products = productsSeed as Product[];
const shipping = shippingSeed as ShippingSettings;
const couriers = couriersSeed as Courier[];
const bank = bankSeed as BankDetails;

async function seedAdmin(): Promise<User> {
  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  return {
    id: "user_admin",
    firstName: "Nursery",
    lastName: "Admin",
    email: ADMIN_EMAIL,
    phone: "+501 624-0588",
    passwordHash,
    addresses: [
      {
        id: "addr_admin",
        label: "Nursery",
        district: "Cayo",
        town: "Belmopan",
        village: "",
        fullAddress: "Greenhouse Co-Op Nursery, Belmopan",
        isDefault: true,
      },
    ],
    createdAt: new Date().toISOString(),
    role: "admin",
  };
}

export async function hydrateStore() {
  if (typeof window === "undefined") return;
  if (getItem(STORAGE_KEYS.hydrated, false)) {
    const users = getItem<User[]>(STORAGE_KEYS.users, []);
    if (!users.some((u) => u.email === ADMIN_EMAIL)) {
      users.unshift(await seedAdmin());
      setItem(STORAGE_KEYS.users, users);
    }
    const storedCouriers = getItem<Courier[]>(STORAGE_KEYS.couriers, []);
    if (storedCouriers.length) {
      const byId = new Map(couriers.map((c) => [c.id, c]));
      setItem(
        STORAGE_KEYS.couriers,
        storedCouriers.map((item) => {
          const seed = byId.get(item.id);
          if (!seed) return item;
          return { ...item, notes: seed.notes };
        })
      );
    }
    const stored = getItem<Product[]>(STORAGE_KEYS.products, []);
    if (stored.length) {
      const byId = new Map(products.map((p) => [p.id, p]));
      setItem(
        STORAGE_KEYS.products,
        stored.map((item) => {
          const seed = byId.get(item.id);
          if (!seed) return item;
          return {
            ...item,
            fruitImage: seed.fruitImage,
            plantImage: seed.plantImage,
            featured: seed.featured,
            limitedSupply: seed.limitedSupply,
          };
        })
      );
    }
    getStoredCart();
    setItem(STORAGE_KEYS.bank, bank);
    await ensureDemoData({ seedAdmin, products });
    return;
  }

  setItem(STORAGE_KEYS.products, products);
  setItem(STORAGE_KEYS.shipping, shipping);
  setItem(STORAGE_KEYS.couriers, couriers);
  setItem(STORAGE_KEYS.bank, bank);
  setItem(STORAGE_KEYS.users, [await seedAdmin()]);
  setItem(STORAGE_KEYS.orders, [] as Order[]);
  setItem(STORAGE_KEYS.cart, { items: [], updatedAt: new Date().toISOString() } as StoredCart);
  setItem(STORAGE_KEYS.hydrated, true);
  await ensureDemoData({ seedAdmin, products });
}

export function getProducts(): Product[] {
  const stored = getItem<Product[]>(STORAGE_KEYS.products, []);
  return stored.length ? stored : products;
}

export function saveProducts(next: Product[]) {
  setItem(STORAGE_KEYS.products, next);
}

export function getProduct(id: string) {
  return getProducts().find((p) => p.id === id);
}

export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.users, []);
}

export function saveUsers(next: User[]) {
  setItem(STORAGE_KEYS.users, next);
}

export function getSession(): Session | null {
  return getItem<Session | null>(STORAGE_KEYS.session, null);
}

export function setSession(session: Session | null) {
  if (!session) {
    setItem(STORAGE_KEYS.session, null);
    return;
  }
  setItem(STORAGE_KEYS.session, session);
}

export function getStoredCart(): StoredCart {
  const raw = getItem<StoredCart | CartItem[]>(STORAGE_KEYS.cart, { items: [], updatedAt: new Date().toISOString() });
  const stored: StoredCart = Array.isArray(raw)
    ? { items: raw, updatedAt: new Date().toISOString() }
    : { items: raw.items ?? [], updatedAt: raw.updatedAt ?? new Date().toISOString() };

  if (stored.items.length && Date.now() - new Date(stored.updatedAt).getTime() > CART_HOLD_MS) {
    const empty = { items: [] as CartItem[], updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.cart, empty);
    return empty;
  }
  return stored;
}

export function getCart(): CartItem[] {
  return getStoredCart().items;
}

export function getCartUpdatedAt(): string | null {
  const stored = getStoredCart();
  return stored.items.length ? stored.updatedAt : null;
}

export function saveCart(next: CartItem[]) {
  setItem(STORAGE_KEYS.cart, {
    items: next,
    updatedAt: new Date().toISOString(),
  } satisfies StoredCart);
}

export function getOrders(): Order[] {
  return getItem<Order[]>(STORAGE_KEYS.orders, []);
}

export function saveOrders(next: Order[]) {
  setItem(STORAGE_KEYS.orders, next);
}

export function getShippingSettings(): ShippingSettings {
  return getItem<ShippingSettings>(STORAGE_KEYS.shipping, shipping);
}

export function saveShippingSettings(next: ShippingSettings) {
  setItem(STORAGE_KEYS.shipping, next);
}

export function getCouriers(): Courier[] {
  return getItem<Courier[]>(STORAGE_KEYS.couriers, couriers);
}

export function saveCouriers(next: Courier[]) {
  setItem(STORAGE_KEYS.couriers, next);
}

export function getBankDetails(): BankDetails {
  return getItem<BankDetails>(STORAGE_KEYS.bank, bank);
}

export function saveBankDetails(next: BankDetails) {
  setItem(STORAGE_KEYS.bank, next);
}

export function upsertProduct(product: Product) {
  const all = getProducts();
  const index = all.findIndex((p) => p.id === product.id);
  if (index >= 0) all[index] = product;
  else all.unshift(product);
  saveProducts(all);
}

export function deleteProduct(id: string) {
  saveProducts(getProducts().filter((p) => p.id !== id));
}

export function createUser(user: Omit<User, "id" | "createdAt" | "role" | "addresses"> & { addresses?: User["addresses"] }) {
  const next: User = {
    ...user,
    id: generateId("user"),
    createdAt: new Date().toISOString(),
    role: "customer",
    addresses: user.addresses ?? [],
  };
  const users = getUsers();
  users.push(next);
  saveUsers(users);
  return next;
}

export function updateUser(user: User) {
  saveUsers(getUsers().map((u) => (u.id === user.id ? user : u)));
}

export function createOrder(input: Omit<Order, "id" | "createdAt" | "updatedAt" | "timeline" | "invoiceNumber" | "reference"> & { reference?: string }) {
  const now = new Date().toISOString();
  const order: Order = {
    ...input,
    id: generateId("ord"),
    reference: input.reference ?? generateReference(),
    invoiceNumber: generateInvoiceNumber(),
    createdAt: now,
    updatedAt: now,
    timeline: [
      { status: input.status, at: now, note: "Order placed" },
    ],
  };
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

export function updateOrderStatus(id: string, status: OrderStatus, note?: string) {
  const orders = getOrders();
  const issuedStatuses: OrderStatus[] = ["Paid", "Processing", "Shipped", "Completed"];
  const next = orders.map((order) => {
    if (order.id !== id) return order;
    const now = new Date().toISOString();
    return {
      ...order,
      status,
      updatedAt: now,
      invoiceIssuedAt: issuedStatuses.includes(status)
        ? order.invoiceIssuedAt ?? now
        : order.invoiceIssuedAt,
      payment:
        status === "Paid"
          ? { ...order.payment, reviewedAt: now, reviewedBy: "admin" }
          : order.payment,
      timeline: [...order.timeline, { status, at: now, note }],
    };
  });
  saveOrders(next);
  return next.find((o) => o.id === id);
}

export function updateOrder(order: Order) {
  saveOrders(getOrders().map((o) => (o.id === order.id ? { ...order, updatedAt: new Date().toISOString() } : o)));
}
