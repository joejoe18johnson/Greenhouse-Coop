/**
 * Create a large pending order in Supabase (admin / phone-in style).
 *
 *   node scripts/create-bulk-order.mjs
 *
 * Optional env:
 *   BULK_ORDER_CUSTOMER_NAME="Jane Doe"
 *   BULK_ORDER_PHONE="+501 600-0000"
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import ws from "ws";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

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
    // optional
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch },
  realtime: { transport: ws },
});

const products = JSON.parse(readFileSync(join(root, "src/data/products.json"), "utf8"));
const catalog = new Map(products.map((p) => [p.id, p]));

/** Order preview — 15 Oct 2026 (31 lines). Update customer name via env when ready. */
const LINE_ITEMS = [
  { productId: "valencia-red-orange", quantity: 1 },
  { productId: "white-grapefruit", quantity: 1 },
  { productId: "strawberry-guava", quantity: 1 },
  { productId: "tangerine", quantity: 2 },
  { productId: "red-grapefruit", quantity: 1 },
  { productId: "strawberry-deleez", quantity: 4 },
  { productId: "pomelo", quantity: 1 },
  { productId: "purple-passion-fruit", quantity: 1 },
  { productId: "pitaya-red", quantity: 1 },
  { productId: "pomegranate", quantity: 2 },
  { productId: "papaya", quantity: 1 },
  { productId: "meyer-lemon", quantity: 3 },
  { productId: "orange-coconut", quantity: 1 },
  { productId: "mulberry-dwarf", quantity: 1 },
  { productId: "lychee", quantity: 1 },
  { productId: "jamaican-lime", quantity: 1 },
  { productId: "kumquat", quantity: 2 },
  { productId: "hass-black-avocado", quantity: 1 },
  { productId: "jackfruit", quantity: 1 },
  { productId: "green-star-apple", quantity: 1 },
  { productId: "hamlin-orange", quantity: 1 },
  { productId: "glenn-mango", quantity: 1 },
  { productId: "green-coconut", quantity: 1 },
  { productId: "febroy-avocado", quantity: 2 },
  { productId: "fig-black-mission", quantity: 1 },
  { productId: "breadfruit", quantity: 1 },
  { productId: "cara-cara-orange", quantity: 1 },
  { productId: "black-sapote", quantity: 1 },
  { productId: "blood-orange", quantity: 1 },
  { productId: "barbados-berry", quantity: 1 },
  { productId: "april-avocado", quantity: 1 },
];

const CUSTOMER_NAME = process.env.BULK_ORDER_CUSTOMER_NAME?.trim() || "Customer name TBD";
const CUSTOMER_PHONE = process.env.BULK_ORDER_PHONE?.trim() || "+501 000-0000";

function generateReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function generateInvoiceNumber() {
  const n = Date.now().toString(36).toUpperCase().slice(-8);
  return `INV-${n}`;
}

function recommendBox(plantCount) {
  if (plantCount <= 3) return { label: "1 sq.ft box", total: 0 };
  if (plantCount <= 8) return { label: "2 sq.ft box", total: 0 };
  if (plantCount <= 15) return { label: "3 sq.ft box", total: 0 };
  return { label: "4 sq.ft box", total: 0 };
}

async function ensureCustomerUserId() {
  const email = `bulk-order+${Date.now()}@orders.greenhousecoop.local`;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      first_name: "Pending",
      last_name: "Customer",
      phone: CUSTOMER_PHONE,
      role: "customer",
    },
  });
  if (error) throw error;

  await supabase
    .from("profiles")
    .update({
      first_name: "Pending",
      last_name: "Customer",
      phone: CUSTOMER_PHONE,
    })
    .eq("id", data.user.id);

  return data.user.id;
}

async function main() {
  const items = LINE_ITEMS.map(({ productId, quantity }) => {
    const product = catalog.get(productId);
    if (!product) throw new Error(`Unknown product: ${productId}`);
    return {
      productId,
      name: product.name,
      price: product.price,
      quantity,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const plantCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const boxRecommendation = recommendBox(plantCount);
  const userId = await ensureCustomerUserId();

  const now = new Date().toISOString();
  const reference = generateReference();
  const order = {
    id: crypto.randomUUID(),
    reference,
    invoice_number: generateInvoiceNumber(),
    invoice_issued_at: null,
    user_id: userId,
    items,
    subtotal,
    delivery_fee: 0,
    box_fee: 0,
    courier_estimate: 0,
    total: subtotal,
    loyalty_discount: 0,
    invoice_discount: 0,
    invoice_discount_note: null,
    box_recommendation: boxRecommendation,
    status: "Payment Pending",
    shipping: {
      firstName: CUSTOMER_NAME.includes(" ") ? CUSTOMER_NAME.split(/\s+/)[0] : CUSTOMER_NAME,
      lastName: CUSTOMER_NAME.includes(" ") ? CUSTOMER_NAME.split(/\s+/).slice(1).join(" ") : "",
      email: "",
      phone: CUSTOMER_PHONE,
      district: "Cayo",
      town: "Belmopan",
      village: "",
      fullAddress: "Belmopan Bus Terminal",
      method: "pickup",
    },
    payment: { method: "bank-transfer", proofChannel: "whatsapp", paymentPlan: "deposit" },
    customer_notes: `Bulk order from preview (${plantCount} plants). Customer name to be updated.`,
    exclude_from_financials: false,
    timeline: [
      {
        status: "Payment Pending",
        at: now,
        note: `Order created from Oct 15 preview for ${CUSTOMER_NAME}. ${plantCount} trees — pickup at Belmopan Bus Terminal until delivery is confirmed.`,
      },
    ],
    created_at: now,
    updated_at: now,
  };

  const optionalColumns = [
    "loyalty_discount_waived",
    "invoice_discount",
    "invoice_discount_note",
    "loyalty_discount",
    "customer_notes",
    "exclude_from_financials",
  ];

  let payload = { ...order };
  let { error } = await supabase.from("orders").insert(payload);
  while (error && optionalColumns.some((col) => error.message.includes(`'${col}'`))) {
    const col = optionalColumns.find((c) => error.message.includes(`'${c}'`));
    if (!col) break;
    const { [col]: _removed, ...rest } = payload;
    void _removed;
    payload = rest;
    ({ error } = await supabase.from("orders").insert(payload));
  }
  if (error) throw error;

  console.log("Created order:");
  console.log(`  Reference: ${reference}`);
  console.log(`  Customer: ${CUSTOMER_NAME} (${CUSTOMER_PHONE})`);
  console.log(`  Lines: ${items.length} · Plants: ${plantCount} · Subtotal: BZD $${subtotal.toFixed(2)}`);
  console.log(`  Status: Payment Pending · Pickup at Belmopan Bus Terminal`);
  console.log("\nUpdate the customer in Admin → Orders → Edit, or set BULK_ORDER_CUSTOMER_NAME and re-run if you need a different account.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
