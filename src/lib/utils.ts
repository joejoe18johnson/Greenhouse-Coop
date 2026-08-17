import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBZD(amount: number) {
  return `$${amount.toFixed(2)} BZD`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function generateReference() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const alphabet = letters + numbers;
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  if (!code.split("").some((c) => letters.includes(c))) {
    const i = Math.floor(Math.random() * 6);
    code = code.slice(0, i) + letters[Math.floor(Math.random() * letters.length)] + code.slice(i + 1);
  }
  if (!code.split("").some((c) => numbers.includes(c))) {
    const i = Math.floor(Math.random() * 6);
    code = code.slice(0, i) + numbers[Math.floor(Math.random() * numbers.length)] + code.slice(i + 1);
  }
  return code;
}

export function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${seq}`;
}

export async function hashPassword(password: string) {
  const data = new TextEncoder().encode(`${password}::ghco-v1`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isLocalDeliveryTown(town: string, towns: string[]) {
  return towns.some((t) => t.toLowerCase() === town.trim().toLowerCase());
}

export function safeNextPath(value: string | null) {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}
