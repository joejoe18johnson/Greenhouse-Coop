import { BRAND } from "@/lib/constants";
import { bankAccounts } from "@/lib/bank";
import { fulfillmentLabel } from "@/lib/shipping";
import { formatBZD } from "@/lib/utils";
import type { BankDetails, Order } from "@/types";

function courierEstimate(order: Order) {
  return order.courierEstimate ?? (order as Order & { courierFee?: number }).courierFee ?? 0;
}

function fulfillmentLine(order: Order) {
  if (order.shipping.method === "pickup") return "Belmopan Bus Terminal pickup";
  if (order.shipping.method === "local") return `Local drop-off · ${order.shipping.town}`;
  return `${order.shipping.courierName || "Courier"} · ${order.shipping.town}`;
}

function addressLine(order: Order) {
  if (order.shipping.method === "pickup") return "Belmopan Bus Terminal";
  const parts = [order.shipping.fullAddress, order.shipping.village, order.shipping.town, order.shipping.district]
    .filter(Boolean);
  return parts.join(", ");
}

export function OrderInvoice({
  order,
  bank,
  id,
}: {
  order: Order;
  customer?: unknown;
  bank: BankDetails;
  id?: string;
}) {
  const accounts = bankAccounts(bank);
  const issued = order.invoiceIssuedAt || order.createdAt;
  const confirmed = ["Paid", "Processing", "Shipped", "Completed"].includes(order.status);
  const courierFee = courierEstimate(order);

  return (
    <article
      id={id}
      className="invoice-sheet mx-auto w-full max-w-[8.5in] overflow-hidden rounded-[20px] border border-forest/10 bg-white text-ink shadow-card sm:rounded-[24px]"
    >
      <header className="flex items-start justify-between gap-4 border-b border-forest/10 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="/logos/logo-icon.png"
            alt=""
            width={48}
            height={48}
            className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12"
            crossOrigin="anonymous"
          />
          <div className="min-w-0">
            <p className="text-base font-semibold leading-tight text-forest-dark sm:text-lg">{BRAND.name}</p>
            <p className="text-[11px] text-ink/55 sm:text-xs">{BRAND.tagline}</p>
            <p className="mt-0.5 text-[10px] text-ink/45 sm:text-[11px]">
              {BRAND.location} · <span className="keep-case">{BRAND.phone}</span>
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-semibold leading-none text-forest-dark sm:text-2xl">Invoice</p>
          <p className="mt-1 text-xs text-ink/50 keep-case sm:text-sm">{order.invoiceNumber}</p>
          {confirmed && (
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-leaf sm:text-[11px]">
              Issued
            </p>
          )}
        </div>
      </header>

      <section className="grid gap-4 border-b border-forest/10 px-4 py-4 sm:grid-cols-2 sm:px-6">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/40">Bill to</p>
          <p className="mt-1 text-sm font-semibold text-forest-dark">
            {order.shipping.firstName} {order.shipping.lastName}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink/65">{addressLine(order)}</p>
          <p className="mt-1 text-xs text-ink/65 keep-case">{order.shipping.phone}</p>
          <p className="text-xs text-ink/65 keep-case">{order.shipping.email}</p>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs sm:text-sm sm:justify-items-end">
          <dt className="text-ink/45">Date</dt>
          <dd>{new Date(issued).toLocaleDateString()}</dd>
          <dt className="text-ink/45">Reference</dt>
          <dd className="keep-case font-medium text-forest">{order.reference}</dd>
          <dt className="text-ink/45">Fulfillment</dt>
          <dd>{fulfillmentLine(order)}</dd>
          <dt className="text-ink/45">Payment</dt>
          <dd>{confirmed ? "Paid in full" : "Due on confirmation"}</dd>
          <dt className="text-ink/45">Status</dt>
          <dd>{order.status}</dd>
        </dl>
      </section>

      {order.customerNotes && (
        <section className="border-b border-forest/10 px-4 py-3 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/40">Customer notes</p>
          <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-ink/70">{order.customerNotes}</p>
        </section>
      )}

      <section className="px-4 py-4 sm:px-6">
        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full min-w-[520px] text-left text-[11px] sm:text-xs">
            <thead className="bg-forest text-cream">
              <tr>
                <th className="px-2 py-2 font-medium sm:px-3">Qty</th>
                <th className="px-2 py-2 font-medium sm:px-3">Description</th>
                <th className="px-2 py-2 text-right font-medium sm:px-3">Unit</th>
                <th className="px-2 py-2 text-right font-medium sm:px-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={item.productId} className={i % 2 ? "bg-cream/40" : "bg-white"}>
                  <td className="px-2 py-1.5 tabular-nums sm:px-3 sm:py-2">{item.quantity.toFixed(2)}</td>
                  <td className="px-2 py-1.5 sm:px-3 sm:py-2">{item.name}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums sm:px-3 sm:py-2">{formatBZD(item.price)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums sm:px-3 sm:py-2">
                    {formatBZD(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
              {order.deliveryFee > 0 && (
                <tr className="bg-cream/40">
                  <td className="px-2 py-1.5 sm:px-3 sm:py-2">1</td>
                  <td className="px-2 py-1.5 sm:px-3 sm:py-2">Local delivery</td>
                  <td className="px-2 py-1.5 text-right sm:px-3 sm:py-2">{formatBZD(order.deliveryFee)}</td>
                  <td className="px-2 py-1.5 text-right sm:px-3 sm:py-2">{formatBZD(order.deliveryFee)}</td>
                </tr>
              )}
              {order.boxFee > 0 && (
                <tr className="bg-cream/40">
                  <td className="px-2 py-1.5 sm:px-3 sm:py-2">1</td>
                  <td className="px-2 py-1.5 sm:px-3 sm:py-2">Shipping box · {order.boxRecommendation.label}</td>
                  <td className="px-2 py-1.5 text-right sm:px-3 sm:py-2">{formatBZD(order.boxFee)}</td>
                  <td className="px-2 py-1.5 text-right sm:px-3 sm:py-2">{formatBZD(order.boxFee)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ml-auto mt-3 w-full max-w-[240px] space-y-1 text-xs sm:text-sm">
          <div className="flex justify-between text-ink/60">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatBZD(order.subtotal)}</span>
          </div>
          <div className="flex justify-between border-t border-forest/10 pt-1.5 text-sm font-semibold text-forest-dark sm:text-base">
            <span>Total due to {BRAND.short}</span>
            <span className="tabular-nums">{formatBZD(order.total)}</span>
          </div>
          {courierFee > 0 && (
            <div className="border-t border-dashed border-forest/15 pt-1.5 text-[10px] text-ink/55 sm:text-[11px]">
              <div className="flex justify-between gap-2">
                <span>{order.shipping.courierName || "Courier"} (approx.)</span>
                <span className="shrink-0 tabular-nums">{formatBZD(courierFee)}</span>
              </div>
              <p className="mt-0.5 leading-snug text-ink/45">Paid at courier when collecting — not included above.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-forest/10 px-4 py-4 sm:px-6">
        <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-ink/40">
          Banking & payment
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 sm:gap-3">
          {accounts.map((account) => (
            <div key={account.accountNumber} className="rounded-xl bg-cream/80 px-3 py-2.5 text-[11px] sm:text-xs">
              <p className="font-semibold text-forest">{account.bankName}</p>
              <p className="mt-0.5 text-ink/70">{account.accountName}</p>
              <p className="mt-0.5 font-mono tracking-wide">{account.accountNumber}</p>
              {account.branch && <p className="mt-0.5 text-[10px] text-ink/45">{account.branch}</p>}
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[10px] text-ink/50 sm:text-[11px]">
          Include reference <strong className="keep-case text-forest">{order.reference}</strong> in transfer notes.
        </p>
        <p className="mt-2 text-center text-xs italic text-ink/45">Thank you for your business.</p>
        <p className="mt-0.5 text-center text-[10px] text-ink/35">{fulfillmentLabel(order.shipping)}</p>
      </footer>
    </article>
  );
}
