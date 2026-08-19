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
