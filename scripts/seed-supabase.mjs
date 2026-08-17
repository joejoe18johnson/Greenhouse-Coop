/**
 * Seed Supabase with catalog + settings + admin account.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ws from "ws";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

/** Load .env.local / .env for npm scripts (Next.js does not auto-load these for node scripts). */
function loadEnvFile(filename) {
  try {
    const content = readFileSync(join(root, filename), "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // file optional
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

function loadJson(relativePath) {
  return JSON.parse(readFileSync(join(root, relativePath), "utf8"));
}

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing Supabase credentials. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local (see .env.example)."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
});

const products = loadJson("src/data/products.json");
const shipping = loadJson("src/data/shipping.json");
const couriers = loadJson("src/data/couriers.json");
const idsRates = loadJson("src/data/ids-rates.json");
const bank = loadJson("src/data/bank.json");

const productRows = products.map((p) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: p.price,
  propagation_type: p.propagationType,
  size: p.size,
  fruit_image: p.fruitImage,
  plant_image: p.plantImage,
  description: p.description,
  flavor_profile: p.flavorProfile,
  featured: p.featured ?? false,
  limited_supply: p.limitedSupply ?? false,
  very_rare: p.veryRare ?? false,
  certified: p.certified ?? false,
  in_stock: p.inStock ?? true,
}));

const settings = [
  { key: "shipping", value: shipping },
  { key: "couriers", value: couriers },
  { key: "ids_rates", value: idsRates },
  { key: "bank", value: bank },
];

async function seedProducts() {
  const { error } = await supabase.from("products").upsert(productRows);
  if (error) throw error;
  console.log(`Seeded ${productRows.length} products`);
}

async function seedSettings() {
  const { error } = await supabase.from("app_settings").upsert(settings);
  if (error) throw error;
  console.log(`Seeded ${settings.length} app settings`);
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "admin@greenhousebz.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);

  if (existing) {
    await supabase
      .from("profiles")
      .update({ role: "admin", first_name: "Nursery", last_name: "Admin", phone: "+501 624-0588" })
      .eq("id", existing.id);
    console.log(`Admin account already exists: ${email}`);
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: "Nursery",
      last_name: "Admin",
      phone: "+501 624-0588",
      role: "admin",
    },
  });
  if (error) throw error;

  await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", data.user.id);

  console.log(`Created admin account: ${email}`);
}

async function main() {
  await seedProducts();
  await seedSettings();
  await seedAdmin();
  console.log("Supabase seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
