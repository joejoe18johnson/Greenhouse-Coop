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
  productToRow,
  profileToUser,
  sessionFromProfile,
  type AddressRow,
  type OrderRow,
  type ProductRow,
  type ProfileRow,
} from "@/lib/supabase/mappers";
import { normalizePropagationType } from "@/lib/propagation";
import { CART_HOLD_MS } from "@/lib/constants";
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

async function saveSetting<T>(key: string, value: T) {
  const { error } = await supabase().from("app_settings").upsert({ key, value });
  if (error) throw error;
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

  setCache({
    products: products.length ? products : seedProducts,
    shipping,
    couriers,
    idsRates,
    bank,
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

  const cart: StoredCart = data
    ? { items: (data.items as CartItem[]) ?? [], updatedAt: data.updated_at }
    : { items: [], updatedAt: new Date().toISOString() };

  if (cart.items.length && Date.now() - new Date(cart.updatedAt).getTime() > CART_HOLD_MS) {
    cart.items = [];
    cart.updatedAt = new Date().toISOString();
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

export function getProducts(): Product[] {
  const { products } = getCache();
  return (products.length ? products : seedProducts).map((p) => ({
    ...p,
    propagationType: normalizePropagationType(p.propagationType),
  }));
}

export function saveProducts(next: Product[]) {
  setCache({ products: next });
  void (async () => {
    const rows = next.map(productToRow);
    const { error } = await supabase().from("products").upsert(rows);
    if (error) console.error("Failed to save products:", error);
  })();
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
  if (session) {
    void persistRemoteCart(session.userId, next);
    return;
  }
  setCache({ cart: { items: next, updatedAt: new Date().toISOString() } });
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

export function saveShippingSettings(next: ShippingSettings) {
  setCache({ shipping: next });
  void saveSetting("shipping", next);
}

export function getCouriers(): Courier[] {
  return getCache().couriers.length ? getCache().couriers : defaultCouriers;
}

export function saveCouriers(next: Courier[]) {
  setCache({ couriers: next });
  void saveSetting("couriers", next);
}

export function getIdsRates(): IdsRates {
  return getCache().idsRates ?? defaultIdsRates;
}

export function saveIdsRates(next: IdsRates) {
  setCache({ idsRates: next });
  void saveSetting("ids_rates", next);
}

export function getBankDetails(): BankDetails {
  return getCache().bank ?? defaultBank;
}

export function saveBankDetails(next: BankDetails) {
  setCache({ bank: next });
  void saveSetting("bank", next);
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
  void supabase().from("products").delete().eq("id", id);
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
    timeline: [{ status: input.status, at: now, note: "Order placed" }],
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
      timeline: [...order.timeline, { status, at: now, note }],
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

export async function syncAuthSession() {
  return refreshSession();
}

export async function signOutRemote() {
  await supabase().auth.signOut();
  setCache({ session: null, cart: { items: [], updatedAt: new Date().toISOString() } });
}

export { createClient };
