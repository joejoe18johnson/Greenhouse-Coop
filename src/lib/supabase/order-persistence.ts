import { orderToRow } from "@/lib/supabase/mappers";
import type { Order } from "@/types";

/** Columns added in later migrations — omitted automatically if the DB schema is older. */
const OPTIONAL_ORDER_ROW_COLUMNS = [
  "loyalty_discount_waived",
  "invoice_discount",
  "invoice_discount_note",
  "loyalty_discount",
  "customer_notes",
  "exclude_from_financials",
] as const;

type OrderRowPayload = ReturnType<typeof orderToRow>;
type DbError = { message: string } | null;
type DbResult = { error: DbError };

function stripMissingColumn(payload: OrderRowPayload, errorMessage: string): OrderRowPayload | null {
  const col = OPTIONAL_ORDER_ROW_COLUMNS.find((c) => errorMessage.includes(`'${c}'`));
  if (!col) return null;
  const { [col]: _removed, ...rest } = payload as Record<string, unknown>;
  void _removed;
  return rest as OrderRowPayload;
}

async function runInsert(db: { from: (t: string) => { insert: (row: OrderRowPayload) => Promise<DbResult> } }, payload: OrderRowPayload) {
  return db.from("orders").insert(payload);
}

async function runUpdate(
  db: { from: (t: string) => { update: (row: OrderRowPayload) => { eq: (c: string, v: string) => Promise<DbResult> } } },
  payload: OrderRowPayload,
  id: string
) {
  return db.from("orders").update(payload).eq("id", id);
}

export async function insertOrderRow(db: unknown, order: Order) {
  const client = db as Parameters<typeof runInsert>[0];
  let payload: OrderRowPayload = orderToRow(order);
  let result = await runInsert(client, payload);
  while (result.error) {
    const next = stripMissingColumn(payload, result.error.message);
    if (!next) throw result.error;
    payload = next;
    result = await runInsert(client, payload);
  }
}

export async function updateOrderRow(db: unknown, order: Order) {
  const client = db as Parameters<typeof runUpdate>[0];
  let payload: OrderRowPayload = orderToRow(order);
  let result = await runUpdate(client, payload, order.id);
  while (result.error) {
    const next = stripMissingColumn(payload, result.error.message);
    if (!next) throw result.error;
    payload = next;
    result = await runUpdate(client, payload, order.id);
  }
}
