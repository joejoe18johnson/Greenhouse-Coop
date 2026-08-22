import { customerTimelineNote } from "@/lib/order-status-messages";
import { updateStockWaitStatus } from "@/lib/stock-wait-requests";
import { updateCustomerRequestStatus } from "@/lib/customer-requests";
import productsSeed from "@/data/products.json";
import shippingSeed from "@/data/shipping.json";
import couriersSeed from "@/data/couriers.json";
import idsRatesSeed from "@/data/ids-rates.json";
import bankSeed from "@/data/bank.json";
import { getCache, setCache } from "@/lib/cache";
import { createClient, getSupabaseClient } from "@/lib/supabase/client";
import {
  addressToRow,
  orderFromRow,
  orderToRow,
  productFromRow,
  profileToUser,
  sessionFromProfile,
  type AddressRow,
  type OrderRow,
  type ProductRow,
  type ProfileRow,
} from "@/lib/supabase/mappers";
import { normalizePropagationType } from "@/lib/propagation";
import { CART_HOLD_MS } from "@/lib/constants";
import { mergeCartItems, readPersistedCart, writePersistedCart } from "@/lib/cart-persistence";
import { generateInvoiceNumber, generateReference } from "@/lib/utils";
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

const defaultShipping = shippingSeed as ShippingSettings;
const defaultCouriers = couriersSeed as Courier[];
const defaultIdsRates = idsRatesSeed as IdsRates;
const defaultBank = bankSeed as BankDetails;
const seedProducts = (productsSeed as Product[]).map((p) => ({
  ...p,
  propagationType: normalizePropagationType(p.propagationType),
}));

function defaultCustomerRequestsSeed(): CustomerRequest[] {
  const now = new Date().toISOString();
  return [
    {
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
    },
  ];
}

async function loadCustomerRequests(): Promise<CustomerRequest[]> {
  const stored = await fetchSetting<CustomerRequest[]>("customer_requests", []);
  if (stored.length) return stored;
  const seeded = await fetchSetting<boolean>("customer_requests_seeded", false);
  if (seeded) return [];
  const seed = defaultCustomerRequestsSeed();
  const { error } = await supabase()
    .from("app_settings")
    .upsert([
      { key: "customer_requests", value: seed },
      { key: "customer_requests_seeded", value: true },
    ]);
  if (error) console.error("Failed to seed customer requests:", error);
  return seed;
}

function supabase() {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase client unavailable");
  return client;
}

async function fetchSetting<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase().from("app_settings").select("value").eq("key", key).maybeSingle();
  if (error) throw error;
  return (data?.value as T | undefined) ?? fallback;
}

async function loadProfiles(includeAll: boolean, userId?: string): Promise<User[]> {
  const client = supabase();

  let profileQuery = client.from("profiles").select("*");
  if (!includeAll && userId) {
    profileQuery = profileQuery.eq("id", userId);
  }

  const { data: profiles, error: profileError } = await profileQuery;
  if (profileError) throw profileError;
  if (!profiles?.length) return [];

  const ids = profiles.map((p) => p.id);
  const { data: addresses, error: addressError } = await client
    .from("addresses")
    .select("*")
    .in("user_id", ids);
  if (addressError) throw addressError;

  return (profiles as ProfileRow[]).map((profile) => {
    const userAddresses = ((addresses ?? []) as AddressRow[]).filter((a) => a.user_id === profile.id);
    return profileToUser(profile, userAddresses);
  });
}

async function refreshSession() {
  const client = supabase();
  const { data: authData } = await client.auth.getUser();
  const authUser = authData.user;

  if (!authUser) {
    setCache({ session: null });
    return null;
  }

  const { data: profile, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();
  if (error) throw error;

  const session = sessionFromProfile(profile as ProfileRow);
  const users = await loadProfiles(false, authUser.id);
  setCache({ session, users });
  return session;
}

export async function hydrateStore() {
  if (typeof window === "undefined") return;

  const client = getSupabaseClient();
  if (!client) return;

  const { data: productRows, error: productError } = await client.from("products").select("*").order("name");
  if (productError) throw productError;

  const products = ((productRows ?? []) as ProductRow[]).map(productFromRow);
  const shipping = await fetchSetting("shipping", defaultShipping);
  const couriers = await fetchSetting("couriers", defaultCouriers);
  const idsRates = await fetchSetting("ids_rates", defaultIdsRates);
  const bank = await fetchSetting("bank", defaultBank);
  const stockWaitRequests = await fetchSetting<StockWaitRequest[]>("stock_wait_requests", []);
  const customerRequests = await loadCustomerRequests();

  setCache({
    products: products.length ? products : seedProducts,
    shipping,
    couriers,
    idsRates,
    bank,
    stockWaitRequests,
    customerRequests,
    orders: [],
    users: [],
  });

  const session = await refreshSession();

  const { data: orderRows, error: orderError } = await client
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (orderError) throw orderError;
  setCache({ orders: ((orderRows ?? []) as OrderRow[]).map(orderFromRow) });

  if (session?.role === "admin") {
    const users = await loadAllUsersForAdmin();
    setCache({ users });
  }

  if (session) {
    await loadRemoteCart(session.userId);
  } else {
    setCache({ cart: readPersistedCart() });
  }
}

async function loadAllUsersForAdmin(): Promise<User[]> {
  const client = supabase();
  const { data: profiles, error: profileError } = await client.from("profiles").select("*");
  if (profileError) throw profileError;

  const { data: addresses, error: addressError } = await client.from("addresses").select("*");
  if (addressError) throw addressError;

  return ((profiles ?? []) as ProfileRow[]).map((profile) => {
    const userAddresses = ((addresses ?? []) as AddressRow[]).filter((a) => a.user_id === profile.id);
    return profileToUser(profile, userAddresses);
  });
}

async function loadRemoteCart(userId: string) {
  const { data, error } = await supabase().from("carts").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;

  const guestCart = readPersistedCart();

  let cart: StoredCart = data
    ? { items: (data.items as CartItem[]) ?? [], updatedAt: data.updated_at }
    : { items: [], updatedAt: new Date().toISOString() };

  if (guestCart.items.length) {
    cart = {
      items: mergeCartItems(cart.items, guestCart.items),
      updatedAt: new Date().toISOString(),
    };
    writePersistedCart({ items: [], updatedAt: cart.updatedAt });
  }

  if (cart.items.length && Date.now() - new Date(cart.updatedAt).getTime() > CART_HOLD_MS) {
    cart.items = [];
    cart.updatedAt = new Date().toISOString();
    await persistRemoteCart(userId, cart.items);
    setCache({ cart });
    return;
  }

  if (guestCart.items.length) {
    await persistRemoteCart(userId, cart.items);
  }

  setCache({ cart });
}

async function persistRemoteCart(userId: string, items: CartItem[]) {
  const updatedAt = new Date().toISOString();
  const { error } = await supabase().from("carts").upsert({
    user_id: userId,
    items,
    updated_at: updatedAt,
  });
  if (error) throw error;
  setCache({ cart: { items, updatedAt } });
}

async function adminSaveSetting(key: string, value: unknown) {
  const res = await fetch("/api/admin/settings", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new Error(body.error || "Could not save settings.");
  }
}

async function adminSaveProducts(products: Product[]) {
  const res = await fetch("/api/admin/products", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(products),
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new Error(body.error || "Could not save products.");
  }
}

async function adminDeleteProduct(id: string) {
  const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new Error(body.error || "Could not delete product.");
  }
}

export async function reloadCatalogSettings() {
  const shipping = await fetchSetting("shipping", defaultShipping);
  const couriers = await fetchSetting("couriers", defaultCouriers);
  const idsRates = await fetchSetting("ids_rates", defaultIdsRates);
  const bank = await fetchSetting("bank", defaultBank);
  setCache({ shipping, couriers, idsRates, bank });
}

export async function reloadProductsFromRemote() {
  const { data: productRows, error } = await supabase().from("products").select("*").order("name");
  if (error) throw error;
  const products = ((productRows ?? []) as ProductRow[]).map(productFromRow);
  setCache({ products: products.length ? products : seedProducts });
}

export function getProducts(): Product[] {
  const { products } = getCache();
  return (products.length ? products : seedProducts).map((p) => ({
    ...p,
    propagationType: normalizePropagationType(p.propagationType),
  }));
}

export async function saveProducts(next: Product[]) {
  setCache({ products: next });
  await adminSaveProducts(next);
  await reloadProductsFromRemote();
}

export function getProduct(id: string) {
  return getProducts().find((p) => p.id === id);
}

export function getUsers(): User[] {
  return getCache().users;
}

export function saveUsers(next: User[]) {
  setCache({ users: next });
}

export function getSession(): Session | null {
  return getCache().session;
}

export function setSession(session: Session | null) {
  setCache({ session });
}

export function getStoredCart(): StoredCart {
  return getCache().cart;
}

export function getCart(): CartItem[] {
  return getStoredCart().items;
}

export function getCartUpdatedAt(): string | null {
  const stored = getStoredCart();
  return stored.items.length ? stored.updatedAt : null;
}

export function saveCart(next: CartItem[]) {
  const session = getSession();
  const stored: StoredCart = { items: next, updatedAt: new Date().toISOString() };

  if (session) {
    setCache({ cart: stored });
    void persistRemoteCart(session.userId, next);
    return;
  }

  setCache({ cart: stored });
  writePersistedCart(stored);
}

export function getOrders(): Order[] {
  return getCache().orders;
}

export function saveOrders(next: Order[]) {
  setCache({ orders: next });
}

export function getShippingSettings(): ShippingSettings {
  return getCache().shipping ?? defaultShipping;
}

export async function saveShippingSettings(next: ShippingSettings) {
  setCache({ shipping: next });
  await adminSaveSetting("shipping", next);
  await reloadCatalogSettings();
}

export function getCouriers(): Courier[] {
  return getCache().couriers.length ? getCache().couriers : defaultCouriers;
}

export async function saveCouriers(next: Courier[]) {
  setCache({ couriers: next });
  await adminSaveSetting("couriers", next);
  await reloadCatalogSettings();
}

export function getIdsRates(): IdsRates {
  return getCache().idsRates ?? defaultIdsRates;
}

export async function saveIdsRates(next: IdsRates) {
  setCache({ idsRates: next });
  await adminSaveSetting("ids_rates", next);
  await reloadCatalogSettings();
}

export function getBankDetails(): BankDetails {
  return getCache().bank ?? defaultBank;
}

export async function saveBankDetails(next: BankDetails) {
  setCache({ bank: next });
  await adminSaveSetting("bank", next);
  await reloadCatalogSettings();
}

export async function upsertProduct(product: Product) {
  const all = getProducts();
  const index = all.findIndex((p) => p.id === product.id);
  if (index >= 0) all[index] = product;
  else all.unshift(product);
  await saveProducts(all);
}

export async function deleteProduct(id: string) {
  const next = getProducts().filter((p) => p.id !== id);
  setCache({ products: next });
  await adminDeleteProduct(id);
  await reloadProductsFromRemote();
}

export function createUser(_user: Omit<User, "id" | "createdAt" | "role" | "addresses"> & { addresses?: User["addresses"] }) {
  void _user;
  throw new Error("Use Supabase Auth to create users.");
}

export function updateUser(user: User) {
  setCache({ users: getUsers().map((u) => (u.id === user.id ? user : u)) });
  void (async () => {
    const client = supabase();
    await client
      .from("profiles")
      .update({
        first_name: user.firstName,
        last_name: user.lastName,
        phone: user.phone,
      })
      .eq("id", user.id);

    for (const address of user.addresses) {
      await client.from("addresses").upsert(addressToRow(address, user.id));
    }
  })();
}

export function createOrder(
  input: Omit<Order, "id" | "createdAt" | "updatedAt" | "timeline" | "invoiceNumber" | "reference"> & {
    reference?: string;
  }
) {
  const now = new Date().toISOString();
  const order: Order = {
    ...input,
    id: crypto.randomUUID(),
    reference: input.reference ?? generateReference(),
    invoiceNumber: generateInvoiceNumber(),
    createdAt: now,
    updatedAt: now,
    timeline: [{ status: input.status, at: now, note: customerTimelineNote(input.status, undefined, input.payment) }],
  };

  const orders = getOrders();
  orders.unshift(order);
  setCache({ orders });

  void (async () => {
    const { error } = await supabase().from("orders").insert(orderToRow(order));
    if (error) console.error("Failed to create order:", error);
  })();

  return order;
}

export function updateOrderStatus(id: string, status: OrderStatus, note?: string) {
  const issuedStatuses: OrderStatus[] = ["Paid", "Processing", "Shipped", "Completed"];
  const orders = getOrders();
  const next = orders.map((order) => {
    if (order.id !== id) return order;
    const now = new Date().toISOString();
    return {
      ...order,
      status,
      updatedAt: now,
      invoiceIssuedAt: issuedStatuses.includes(status) ? order.invoiceIssuedAt ?? now : order.invoiceIssuedAt,
      payment:
        status === "Paid" ? { ...order.payment, reviewedAt: now, reviewedBy: "admin" } : order.payment,
      timeline: [...order.timeline, { status, at: now, note: customerTimelineNote(status, note, order.payment) }],
    };
  });

  setCache({ orders: next });
  const updated = next.find((o) => o.id === id);

  if (updated) {
    void (async () => {
      const { error } = await supabase().from("orders").update(orderToRow(updated)).eq("id", id);
      if (error) console.error("Failed to update order status:", error);
    })();
  }

  return updated;
}

export function updateOrder(order: Order) {
  const updated = { ...order, updatedAt: new Date().toISOString() };
  setCache({ orders: getOrders().map((o) => (o.id === order.id ? updated : o)) });
  void (async () => {
    const { error } = await supabase().from("orders").update(orderToRow(updated)).eq("id", order.id);
    if (error) console.error("Failed to update order:", error);
  })();
}

export function getStockWaitRequests(): StockWaitRequest[] {
  return getCache().stockWaitRequests ?? [];
}

export function setStockWaitRequests(requests: StockWaitRequest[]) {
  setCache({ stockWaitRequests: requests });
}

export function prependStockWaitRequest(request: StockWaitRequest) {
  const next = [request, ...getStockWaitRequests()];
  setCache({ stockWaitRequests: next });
}

export function setStockWaitRequestStatus(id: string, status: StockWaitStatus) {
  const next = updateStockWaitStatus(getStockWaitRequests(), id, status);
  setCache({ stockWaitRequests: next });
  return next.find((entry) => entry.id === id);
}

export function getCustomerRequests(): CustomerRequest[] {
  return getCache().customerRequests ?? [];
}

export function setCustomerRequests(requests: CustomerRequest[]) {
  setCache({ customerRequests: requests });
}

export function prependCustomerRequest(request: CustomerRequest) {
  setCache({ customerRequests: [request, ...getCustomerRequests()] });
}

export function patchCustomerRequestCache(id: string, patch: Partial<CustomerRequest>) {
  const now = new Date().toISOString();
  const next = getCustomerRequests().map((entry) =>
    entry.id === id ? { ...entry, ...patch, updatedAt: now } : entry
  );
  setCache({ customerRequests: next });
  return next.find((entry) => entry.id === id);
}

export function removeCustomerRequestFromCache(id: string) {
  setCache({ customerRequests: getCustomerRequests().filter((entry) => entry.id !== id) });
}

export function setCustomerRequestStatus(id: string, status: CustomerRequestStatus) {
  const next = updateCustomerRequestStatus(getCustomerRequests(), id, status);
  setCache({ customerRequests: next });
  return next.find((entry) => entry.id === id);
}

export async function syncAuthSession() {
  const session = await refreshSession();
  if (session) {
    await loadRemoteCart(session.userId);
  } else {
    setCache({ cart: readPersistedCart() });
  }
  return session;
}

export async function signOutRemote() {
  await supabase().auth.signOut();
  setCache({ session: null, cart: readPersistedCart() });
}

export { createClient };
