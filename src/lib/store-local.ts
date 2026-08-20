import productsSeed from "@/data/products.json";
import shippingSeed from "@/data/shipping.json";
import couriersSeed from "@/data/couriers.json";
import idsRatesSeed from "@/data/ids-rates.json";
import bankSeed from "@/data/bank.json";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  CART_HOLD_MS,
  CATALOG_SEED_VERSION,
  STORAGE_KEYS,
} from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage";
import { generateId, generateInvoiceNumber, generateReference, hashPassword } from "@/lib/utils";
import { normalizePropagationType } from "@/lib/propagation";
import { computeOrderTotal } from "@/lib/shipping";
import { ensureAdminUser } from "@/lib/demo";
import { customerTimelineNote } from "@/lib/order-status-messages";
import { updateStockWaitStatus, isDuplicateStockWait } from "@/lib/stock-wait-requests";
import type {
  BankDetails,
  CartItem,
  Courier,
  IdsRates,
  Order,
  OrderStatus,
  Product,
  Session,
  ShippingSettings,
  StockWaitRequest,
  StockWaitStatus,
  CustomerRequest,
  CustomerRequestStatus,
  StoredCart,
  User,
} from "@/types";

const products = productsSeed as Product[];
const shipping = shippingSeed as ShippingSettings;
const couriers = couriersSeed as Courier[];
const idsRates = idsRatesSeed as IdsRates;
const bank = bankSeed as BankDetails;

function normalizeOrder(order: Order & { courierFee?: number }): Order {
  const courierEstimate = order.courierEstimate ?? order.courierFee ?? 0;
  const { courierFee, ...rest } = order;
  void courierFee;
  return {
    ...rest,
    courierEstimate,
    total: computeOrderTotal({
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      boxFee: order.boxFee,
    }),
  };
}

function normalizeOrders(stored: (Order & { courierFee?: number })[]) {
  if (!stored.length) return stored;
  return stored.map(normalizeOrder);
}

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
    if (!storedCouriers.length) {
      setItem(STORAGE_KEYS.couriers, couriers);
    } else {
      const ids = new Set(storedCouriers.map((c) => c.id));
      const merged = [...storedCouriers];
      for (const seedCourier of couriers) {
        if (!ids.has(seedCourier.id)) merged.push(seedCourier);
      }
      if (merged.length !== storedCouriers.length) {
        setItem(STORAGE_KEYS.couriers, merged);
      }
    }
    const catalogVersion = getItem<string>(STORAGE_KEYS.catalogSeed, "");

    if (catalogVersion !== CATALOG_SEED_VERSION) {
      setItem(STORAGE_KEYS.products, products);
      setItem(STORAGE_KEYS.catalogSeed, CATALOG_SEED_VERSION);
      const cart = getStoredCart();
      const validIds = new Set(products.map((p) => p.id));
      setItem(STORAGE_KEYS.cart, {
        items: cart.items.filter((item) => validIds.has(item.productId)),
        updatedAt: new Date().toISOString(),
      });
    } else {
      const stored = getItem<Product[]>(STORAGE_KEYS.products, []);
      if (stored.length) {
        const storedById = new Map(stored.map((p) => [p.id, p]));
        const merged = products.map((seed) => storedById.get(seed.id) ?? seed);
        setItem(STORAGE_KEYS.products, merged);
      }
    }
    getStoredCart();
    if (!getItem<ShippingSettings | null>(STORAGE_KEYS.shipping, null)) {
      setItem(STORAGE_KEYS.shipping, shipping);
    }
    if (!getItem<IdsRates | null>(STORAGE_KEYS.idsRates, null)) {
      setItem(STORAGE_KEYS.idsRates, idsRates);
    }
    if (!getItem<BankDetails | null>(STORAGE_KEYS.bank, null)) {
      setItem(STORAGE_KEYS.bank, bank);
    }
    seedCustomerRequestsIfNeeded();
    const storedOrders = getItem<(Order & { courierFee?: number })[]>(STORAGE_KEYS.orders, []);
    if (storedOrders.length) {
      setItem(STORAGE_KEYS.orders, normalizeOrders(storedOrders));
    }
    await ensureAdminUser(seedAdmin);
    return;
  }

  setItem(STORAGE_KEYS.products, products);
  setItem(STORAGE_KEYS.catalogSeed, CATALOG_SEED_VERSION);
  setItem(STORAGE_KEYS.shipping, shipping);
  setItem(STORAGE_KEYS.couriers, couriers);
  setItem(STORAGE_KEYS.idsRates, idsRates);
  setItem(STORAGE_KEYS.bank, bank);
  setItem(STORAGE_KEYS.users, [await seedAdmin()]);
  setItem(STORAGE_KEYS.orders, [] as Order[]);
  setItem(STORAGE_KEYS.cart, { items: [], updatedAt: new Date().toISOString() } as StoredCart);
  seedCustomerRequestsIfNeeded();
  setItem(STORAGE_KEYS.hydrated, true);
  await ensureAdminUser(seedAdmin);
}

function seedCustomerRequestsIfNeeded() {
  if (getItem(STORAGE_KEYS.customerRequestsSeeded, false)) return;
  const now = new Date().toISOString();
  const deborah: CustomerRequest = {
    id: "req_deborah_dubon",
    customerName: "Deborah Dubon",
    phone: "600-7842",
    email: "daniellydubon10@gmail.com",
    town: "Belmopan",
    district: "Cayo",
    productIds: ["peach-mexican", "purple-passion-fruit"],
    productNames: ["Peach (Mexican)", "Purple Passion Fruit"],
    notes: "Asked admin to check nursery availability.",
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
  setItem(STORAGE_KEYS.customerRequests, [deborah]);
  setItem(STORAGE_KEYS.customerRequestsSeeded, true);
}

export function getProducts(): Product[] {
  const stored = getItem<Product[]>(STORAGE_KEYS.products, []);
  const list = stored.length ? stored : products;
  return list.map((p) => ({
    ...p,
    propagationType: normalizePropagationType(p.propagationType),
  }));
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

export function getIdsRates(): IdsRates {
  return getItem<IdsRates>(STORAGE_KEYS.idsRates, idsRates);
}

export function saveIdsRates(next: IdsRates) {
  setItem(STORAGE_KEYS.idsRates, next);
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
      { status: input.status, at: now, note: customerTimelineNote(input.status, undefined, input.payment) },
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
      timeline: [...order.timeline, { status, at: now, note: customerTimelineNote(status, note, order.payment) }],
    };
  });
  saveOrders(next);
  return next.find((o) => o.id === id);
}

export function updateOrder(order: Order) {
  saveOrders(getOrders().map((o) => (o.id === order.id ? { ...order, updatedAt: new Date().toISOString() } : o)));
}

export function getStockWaitRequests(): StockWaitRequest[] {
  return getItem<StockWaitRequest[]>(STORAGE_KEYS.stockWaitRequests, []);
}

export function saveStockWaitRequests(next: StockWaitRequest[]) {
  setItem(STORAGE_KEYS.stockWaitRequests, next);
}

export function createStockWaitRequest(input: {
  productId: string;
  productName: string;
  customerName: string;
  phone: string;
  email?: string;
  userId?: string;
  notes?: string;
}) {
  const existing = getStockWaitRequests();
  if (isDuplicateStockWait(existing, input.productId, input.phone)) {
    throw new Error("You are already on the waitlist for this tree with that phone number.");
  }

  const now = new Date().toISOString();
  const request: StockWaitRequest = {
    id: generateId("wait"),
    productId: input.productId,
    productName: input.productName,
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || undefined,
    userId: input.userId,
    notes: input.notes?.trim() || undefined,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  saveStockWaitRequests([request, ...existing]);
  return request;
}

export function setStockWaitRequestStatus(id: string, status: StockWaitStatus) {
  const next = updateStockWaitStatus(getStockWaitRequests(), id, status);
  saveStockWaitRequests(next);
  return next.find((entry) => entry.id === id);
}

export function getCustomerRequests(): CustomerRequest[] {
  return getItem<CustomerRequest[]>(STORAGE_KEYS.customerRequests, []);
}

export function saveCustomerRequests(next: CustomerRequest[]) {
  setItem(STORAGE_KEYS.customerRequests, next);
}

export function createCustomerRequest(
  input: Omit<CustomerRequest, "id" | "createdAt" | "updatedAt" | "status"> & {
    status?: CustomerRequestStatus;
  }
): CustomerRequest {
  const now = new Date().toISOString();
  const request: CustomerRequest = {
    ...input,
    id: `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    status: input.status ?? "pending",
    createdAt: now,
    updatedAt: now,
  };
  saveCustomerRequests([request, ...getCustomerRequests()]);
  return request;
}

export function updateCustomerRequest(
  id: string,
  patch: Partial<
    Pick<
      CustomerRequest,
      | "customerName"
      | "phone"
      | "email"
      | "town"
      | "district"
      | "userId"
      | "productIds"
      | "productNames"
      | "notes"
      | "status"
    >
  >
) {
  const now = new Date().toISOString();
  const next = getCustomerRequests().map((entry) => {
    if (entry.id !== id) return entry;
    return { ...entry, ...patch, updatedAt: now };
  });
  saveCustomerRequests(next);
  return next.find((entry) => entry.id === id);
}

export function deleteCustomerRequest(id: string) {
  const next = getCustomerRequests().filter((entry) => entry.id !== id);
  saveCustomerRequests(next);
}
