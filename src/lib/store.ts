import { isSupabaseEnabled } from "@/lib/supabase/config";
import { notifyStoreUpdate } from "@/lib/store-events";
import * as local from "@/lib/store-local";
import * as remote from "@/lib/store-supabase";

function isRemoteBackend() {
  return isSupabaseEnabled();
}

export async function hydrateStore() {
  if (isRemoteBackend()) return remote.hydrateStore();
  return local.hydrateStore();
}

export function getProducts() {
  return isRemoteBackend() ? remote.getProducts() : local.getProducts();
}

export async function saveProducts(next: Parameters<typeof local.saveProducts>[0]) {
  if (isRemoteBackend()) await remote.saveProducts(next);
  else local.saveProducts(next);
  notifyStoreUpdate();
}

export function getProduct(id: string) {
  return isRemoteBackend() ? remote.getProduct(id) : local.getProduct(id);
}

export function getUsers() {
  return isRemoteBackend() ? remote.getUsers() : local.getUsers();
}

export function saveUsers(next: Parameters<typeof local.saveUsers>[0]) {
  if (isRemoteBackend()) return remote.saveUsers(next);
  return local.saveUsers(next);
}

export function getSession() {
  return isRemoteBackend() ? remote.getSession() : local.getSession();
}

export function setSession(session: Parameters<typeof local.setSession>[0]) {
  if (isRemoteBackend()) return remote.setSession(session);
  return local.setSession(session);
}

export function getStoredCart() {
  return isRemoteBackend() ? remote.getStoredCart() : local.getStoredCart();
}

export function getCart() {
  return isRemoteBackend() ? remote.getCart() : local.getCart();
}

export function getCartUpdatedAt() {
  return isRemoteBackend() ? remote.getCartUpdatedAt() : local.getCartUpdatedAt();
}

export function saveCart(next: Parameters<typeof local.saveCart>[0]) {
  if (isRemoteBackend()) return remote.saveCart(next);
  return local.saveCart(next);
}

export function getOrders() {
  return isRemoteBackend() ? remote.getOrders() : local.getOrders();
}

export function saveOrders(next: Parameters<typeof local.saveOrders>[0]) {
  if (isRemoteBackend()) return remote.saveOrders(next);
  return local.saveOrders(next);
}

export function getShippingSettings() {
  return isRemoteBackend() ? remote.getShippingSettings() : local.getShippingSettings();
}

export async function saveShippingSettings(next: Parameters<typeof local.saveShippingSettings>[0]) {
  if (isRemoteBackend()) await remote.saveShippingSettings(next);
  else local.saveShippingSettings(next);
  notifyStoreUpdate();
}

export function getCouriers() {
  return isRemoteBackend() ? remote.getCouriers() : local.getCouriers();
}

export async function saveCouriers(next: Parameters<typeof local.saveCouriers>[0]) {
  if (isRemoteBackend()) await remote.saveCouriers(next);
  else local.saveCouriers(next);
  notifyStoreUpdate();
}

export function getIdsRates() {
  return isRemoteBackend() ? remote.getIdsRates() : local.getIdsRates();
}

export async function saveIdsRates(next: Parameters<typeof local.saveIdsRates>[0]) {
  if (isRemoteBackend()) await remote.saveIdsRates(next);
  else local.saveIdsRates(next);
  notifyStoreUpdate();
}

export function getBankDetails() {
  return isRemoteBackend() ? remote.getBankDetails() : local.getBankDetails();
}

export async function saveBankDetails(next: Parameters<typeof local.saveBankDetails>[0]) {
  if (isRemoteBackend()) await remote.saveBankDetails(next);
  else local.saveBankDetails(next);
  notifyStoreUpdate();
}

export async function upsertProduct(product: Parameters<typeof local.upsertProduct>[0]) {
  if (isRemoteBackend()) await remote.upsertProduct(product);
  else local.upsertProduct(product);
  notifyStoreUpdate();
}

export async function deleteProduct(id: string) {
  if (isRemoteBackend()) await remote.deleteProduct(id);
  else local.deleteProduct(id);
  notifyStoreUpdate();
}

export function createUser(input: Parameters<typeof local.createUser>[0]): ReturnType<typeof local.createUser> {
  if (isRemoteBackend()) {
    throw new Error("Use Supabase Auth to create users.");
  }
  const created = local.createUser(input);
  notifyStoreUpdate();
  return created;
}

export function updateUser(user: Parameters<typeof local.updateUser>[0]) {
  if (isRemoteBackend()) return remote.updateUser(user);
  return local.updateUser(user);
}

export function createOrder(input: Parameters<typeof local.createOrder>[0]) {
  const order = isRemoteBackend() ? remote.createOrder(input) : local.createOrder(input);
  notifyStoreUpdate();
  return order;
}

export function updateOrderStatus(
  id: string,
  status: Parameters<typeof local.updateOrderStatus>[1],
  note?: string
) {
  const order = isRemoteBackend()
    ? remote.updateOrderStatus(id, status, note)
    : local.updateOrderStatus(id, status, note);
  notifyStoreUpdate();
  return order;
}

export function updateOrder(order: Parameters<typeof local.updateOrder>[0]) {
  if (isRemoteBackend()) remote.updateOrder(order);
  else local.updateOrder(order);
  notifyStoreUpdate();
}

export function getStockWaitRequests() {
  return isRemoteBackend() ? remote.getStockWaitRequests() : local.getStockWaitRequests();
}

export async function createStockWaitRequest(input: Parameters<typeof local.createStockWaitRequest>[0]) {
  if (isRemoteBackend()) {
    const res = await fetch("/api/stock-wait", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(typeof payload.error === "string" ? payload.error : "Could not join the waitlist.");
    }
    remote.prependStockWaitRequest(payload);
    notifyStoreUpdate();
    return payload as ReturnType<typeof local.createStockWaitRequest>;
  }

  const request = local.createStockWaitRequest(input);
  notifyStoreUpdate();
  return request;
}

export async function setStockWaitRequestStatus(
  id: string,
  status: Parameters<typeof local.setStockWaitRequestStatus>[1]
) {
  if (isRemoteBackend()) {
    const res = await fetch("/api/admin/stock-wait", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(typeof payload.error === "string" ? payload.error : "Could not update waitlist.");
    }
    remote.setStockWaitRequestStatus(id, status);
    notifyStoreUpdate();
    return remote.getStockWaitRequests().find((entry) => entry.id === id);
  }

  const updated = local.setStockWaitRequestStatus(id, status);
  notifyStoreUpdate();
  return updated;
}

export async function syncAuthSession() {
  if (isRemoteBackend()) return remote.syncAuthSession();
  return local.getSession();
}

export async function signOutRemote() {
  if (isRemoteBackend()) return remote.signOutRemote();
}

export function isUsingSupabase() {
  return isRemoteBackend();
}

export async function refreshStockWaitRequestsFromRemote() {
  if (!isRemoteBackend()) return getStockWaitRequests();
  const res = await fetch("/api/admin/stock-wait");
  if (!res.ok) return remote.getStockWaitRequests();
  const data = await res.json();
  if (Array.isArray(data)) {
    remote.setStockWaitRequests(data);
    notifyStoreUpdate();
    return data;
  }
  return remote.getStockWaitRequests();
}

export function getCustomerRequests() {
  return isRemoteBackend() ? remote.getCustomerRequests() : local.getCustomerRequests();
}

export async function createCustomerRequest(input: Parameters<typeof local.createCustomerRequest>[0]) {
  if (isRemoteBackend()) {
    const res = await fetch("/api/admin/customer-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(typeof payload.error === "string" ? payload.error : "Could not save customer request.");
    }
    remote.prependCustomerRequest(payload);
    notifyStoreUpdate();
    return payload as ReturnType<typeof local.createCustomerRequest>;
  }

  const request = local.createCustomerRequest(input);
  notifyStoreUpdate();
  return request;
}

export async function updateCustomerRequest(
  id: string,
  patch: Parameters<typeof local.updateCustomerRequest>[1]
) {
  if (isRemoteBackend()) {
    const res = await fetch("/api/admin/customer-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(typeof payload.error === "string" ? payload.error : "Could not update customer request.");
    }
    if (payload.request) remote.patchCustomerRequestCache(id, payload.request);
    else remote.patchCustomerRequestCache(id, patch);
    notifyStoreUpdate();
    return remote.getCustomerRequests().find((entry) => entry.id === id);
  }

  const updated = local.updateCustomerRequest(id, patch);
  notifyStoreUpdate();
  return updated;
}

export async function deleteCustomerRequest(id: string) {
  if (isRemoteBackend()) {
    const res = await fetch("/api/admin/customer-requests", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(typeof payload.error === "string" ? payload.error : "Could not delete customer request.");
    }
    remote.removeCustomerRequestFromCache(id);
    notifyStoreUpdate();
    return;
  }

  local.deleteCustomerRequest(id);
  notifyStoreUpdate();
}

export async function refreshCustomerRequestsFromRemote() {
  if (!isRemoteBackend()) return getCustomerRequests();
  const res = await fetch("/api/admin/customer-requests");
  if (!res.ok) return remote.getCustomerRequests();
  const data = await res.json();
  if (Array.isArray(data)) {
    remote.setCustomerRequests(data);
    notifyStoreUpdate();
    return data;
  }
  return remote.getCustomerRequests();
}
