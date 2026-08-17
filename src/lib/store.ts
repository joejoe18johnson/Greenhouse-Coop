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

export function saveProducts(next: Parameters<typeof local.saveProducts>[0]) {
  if (isRemoteBackend()) return remote.saveProducts(next);
  return local.saveProducts(next);
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

export function saveShippingSettings(next: Parameters<typeof local.saveShippingSettings>[0]) {
  if (isRemoteBackend()) return remote.saveShippingSettings(next);
  return local.saveShippingSettings(next);
}

export function getCouriers() {
  return isRemoteBackend() ? remote.getCouriers() : local.getCouriers();
}

export function saveCouriers(next: Parameters<typeof local.saveCouriers>[0]) {
  if (isRemoteBackend()) return remote.saveCouriers(next);
  return local.saveCouriers(next);
}

export function getIdsRates() {
  return isRemoteBackend() ? remote.getIdsRates() : local.getIdsRates();
}

export function saveIdsRates(next: Parameters<typeof local.saveIdsRates>[0]) {
  if (isRemoteBackend()) return remote.saveIdsRates(next);
  return local.saveIdsRates(next);
}

export function getBankDetails() {
  return isRemoteBackend() ? remote.getBankDetails() : local.getBankDetails();
}

export function saveBankDetails(next: Parameters<typeof local.saveBankDetails>[0]) {
  if (isRemoteBackend()) return remote.saveBankDetails(next);
  return local.saveBankDetails(next);
}

export function upsertProduct(product: Parameters<typeof local.upsertProduct>[0]) {
  if (isRemoteBackend()) return remote.upsertProduct(product);
  return local.upsertProduct(product);
}

export function deleteProduct(id: string) {
  if (isRemoteBackend()) return remote.deleteProduct(id);
  return local.deleteProduct(id);
}

export function createUser(input: Parameters<typeof local.createUser>[0]): ReturnType<typeof local.createUser> {
  if (isRemoteBackend()) {
    throw new Error("Use Supabase Auth to create users.");
  }
  return local.createUser(input);
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
