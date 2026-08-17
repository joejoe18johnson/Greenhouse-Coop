import { BRAND } from "@/lib/constants";
import { bankAccounts } from "@/lib/bank";
import { fulfillmentLabel } from "@/lib/shipping";
import { formatBZD } from "@/lib/utils";
import { COURIER_ESTIMATE_NOTICE } from "@/lib/constants";
import type { BankDetails, Order, User } from "@/types";

function courierEstimate(order: Order) {
  return order.courierEstimate ?? (order as Order & { courierFee?: number }).courierFee ?? 0;
}

function conditionLine(order: Order) {
  if (order.shipping.method === "pickup") return "Collect at Belmopan Bus Terminal";
  if (order.shipping.method === "local") {
    return `Local drop-off in ${order.shipping.town}`;
  }
  return `${order.shipping.courierName || "Courier"} · office-to-office, ${order.shipping.town}`;
}

export function OrderInvoice({
  order,
  customer,
  bank,
  id,
}: {
  order: Order;
  customer?: User | null;
  bank: BankDetails;
  id?: string;
}) {
  const accounts = bankAccounts(bank);
  const issued = order.invoiceIssuedAt || order.createdAt;
  const confirmed = ["Paid", "Processing", "Shipped", "Completed"].includes(order.status);

  return (
    <article
      id={id}
      className="invoice-sheet overflow-hidden rounded-[28px] border border-forest/10 bg-white text-ink shadow-card print:rounded-none print:border-0 print:shadow-none"
    >
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-forest/10 px-8 py-6">
        <div className="flex items-center gap-4">
          <img
            src="/logos/logo-icon.png"
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
            crossOrigin="anonymous"
          />
          <div>
            <p className="text-2xl font-semibold tracking-tight text-forest-dark">{BRAND.name}</p>
            <p className="text-sm text-ink/55">{BRAND.tagline}</p>
            <p className="mt-1 text-xs text-ink/45">
              {BRAND.location} · <span className="keep-case">{BRAND.phone}</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold text-forest-dark">Invoice</p>
          <p className="mt-1 text-sm text-ink/50 keep-case">{order.invoiceNumber}</p>
          {confirmed && (
            <p className="mt-1 text-xs font-semibold text-leaf">Issued</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 px-8 py-6 md:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold text-ink/40">To</p>
          <p className="mt-1 font-semibold text-forest-dark">
            {order.shipping.firstName} {order.shipping.lastName}
          </p>
          <p className="text-sm text-ink/65">
            {order.shipping.method === "pickup"
              ? "Belmopan Bus Terminal pickup"
              : `${order.shipping.fullAddress}${order.shipping.village ? `, ${order.shipping.village}` : ""}`}
          </p>
          <p className="text-sm text-ink/65">
            {order.shipping.town}, {order.shipping.district}
          </p>
          <p className="text-sm text-ink/65 keep-case">{order.shipping.phone}</p>
          <p className="text-sm text-ink/65 keep-case">{order.shipping.email}</p>
          {customer?.addresses[0] && (
            <p className="mt-1 text-xs text-ink/45">Account: <span className="keep-case">{customer.email}</span></p>
          )}
        </div>
        <div className="text-sm md:text-right">
          <p><span className="text-ink/45">Date</span> · {new Date(issued).toLocaleDateString()}</p>
          <p className="mt-1"><span className="text-ink/45">Invoice #</span> · <span className="keep-case">{order.invoiceNumber}</span></p>
          <p className="mt-1"><span className="text-ink/45">Reference</span> · <span className="keep-case">{order.reference}</span></p>
          <p className="mt-1"><span className="text-ink/45">Customer ID</span> · <span className="keep-case">{order.userId.replace("user_", "").slice(0, 8).toUpperCase()}</span></p>
        </div>
      </div>

      {order.customerNotes && (
        <div className="border-t border-forest/10 px-8 py-5">
          <p className="text-[11px] font-semibold text-ink/40">Customer notes</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink/70">{order.customerNotes}</p>
        </div>
      )}

      <div className="px-8">
        <table className="w-full overflow-hidden rounded-xl text-left text-sm">
          <thead className="bg-forest text-cream">
            <tr>
              <th className="px-4 py-2.5 font-medium">Salesperson</th>
              <th className="px-4 py-2.5 font-medium">Fulfillment</th>
              <th className="px-4 py-2.5 font-medium">Payment</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-cream/60">
              <td className="px-4 py-3">GreenHouse</td>
              <td className="px-4 py-3">{conditionLine(order)}</td>
              <td className="px-4 py-3">{confirmed ? "Paid in full" : "Due on confirmation"}</td>
              <td className="px-4 py-3">{order.status}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="px-8 py-6">
        <table className="w-full text-left text-sm">
          <thead className="bg-forest text-cream">
            <tr>
              <th className="px-4 py-2.5 font-medium">Qty</th>
              <th className="px-4 py-2.5 font-medium">Description</th>
              <th className="px-4 py-2.5 text-right font-medium">Unit Price</th>
              <th className="px-4 py-2.5 text-right font-medium">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={item.productId} className={i % 2 ? "bg-cream/50" : "bg-white"}>
                <td className="px-4 py-2.5 tabular-nums">{item.quantity.toFixed(2)}</td>
                <td className="px-4 py-2.5">{item.name}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatBZD(item.price)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatBZD(item.price * item.quantity)}</td>
              </tr>
            ))}
            {order.deliveryFee > 0 && (
              <tr className="bg-cream/50">
                <td className="px-4 py-2.5">1.00</td>
                <td className="px-4 py-2.5">Local delivery</td>
                <td className="px-4 py-2.5 text-right">{formatBZD(order.deliveryFee)}</td>
                <td className="px-4 py-2.5 text-right">{formatBZD(order.deliveryFee)}</td>
              </tr>
            )}
            {order.boxFee > 0 && (
              <tr className="bg-cream/50">
                <td className="px-4 py-2.5">1.00</td>
                <td className="px-4 py-2.5">Shipping box · {order.boxRecommendation.label}</td>
                <td className="px-4 py-2.5 text-right">{formatBZD(order.boxFee)}</td>
                <td className="px-4 py-2.5 text-right">{formatBZD(order.boxFee)}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="ml-auto mt-4 w-full max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between text-ink/60">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatBZD(order.subtotal)}</span>
          </div>
          <div className="flex justify-between border-t border-forest/10 pt-2 text-base font-semibold text-forest-dark">
            <span>Total due to {BRAND.short}</span>
            <span className="tabular-nums">{formatBZD(order.total)}</span>
          </div>
          {courierEstimate(order) > 0 && (
            <div className="border-t border-dashed border-forest/15 pt-2 text-ink/55">
              <div className="flex justify-between">
                <span>{order.shipping.courierName || "Courier"} (approx.)</span>
                <span className="tabular-nums">{formatBZD(courierEstimate(order))}</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-ink/45">{COURIER_ESTIMATE_NOTICE}</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-forest/10 px-8 py-6">
        <p className="text-center text-[11px] font-semibold text-ink/40">
          Banking and payment information
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {accounts.map((account) => (
            <div key={account.accountNumber} className="rounded-2xl bg-cream px-5 py-4 text-sm">
              <p className="font-semibold text-forest">{account.bankName}</p>
              <p className="mt-2 text-ink/70">{account.accountName}</p>
              <p className="mt-1 font-mono text-sm tracking-wide">{account.accountNumber}</p>
              {account.branch && <p className="mt-1 text-xs text-ink/45">{account.branch}</p>}
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-ink/50">
          Include reference <strong className="keep-case text-forest">{order.reference}</strong> in your transfer notes.
        </p>
        <p className="mt-4 text-center text-sm italic text-ink/45">Thank you for your business.</p>
        <p className="mt-1 text-center text-[11px] text-ink/35">{fulfillmentLabel(order.shipping)}</p>
      </div>
    </article>
  );
}
