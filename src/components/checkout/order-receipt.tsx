import Image from "next/image";
import { cn } from "@/lib/utils";

function ReceiptRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-3",
        strong ? "font-semibold text-forest-dark" : "text-ink/70"
      )}
    >
      <span>{label}</span>
      <span className="tabular-nums tracking-tight">{value}</span>
    </div>
  );
}

export function OrderReceipt({
  title = "Order",
  items,
  rows,
  total,
  depositDue,
  balanceDue,
  dueNowLabel = "Deposit due now",
  note,
  estimates,
  children,
}: {
  title?: string;
  items: { id: string; name: string; quantity: number; amount: string }[];
  rows: { label: string; value: string }[];
  total: string;
  depositDue?: string;
  balanceDue?: string;
  dueNowLabel?: string;
  note?: string;
  estimates?: { label: string; value: string }[];
  children?: React.ReactNode;
}) {
  return (
    <aside className="h-fit [filter:drop-shadow(0_18px_40px_rgba(31,41,55,0.16))]">
      <div className="border-x border-t border-forest/10 bg-[#FFFEF8]">
        <div className="bg-forest-dark px-6 py-5 text-center text-cream">
          <Image
            src="/logos/logo-icon.png"
            alt=""
            width={44}
            height={44}
            className="mx-auto"
          />
          <p className="mt-2 font-display text-xl leading-none">Greenhouse Co-Op</p>
          <p className="mt-2 text-[10px] text-lime-bright">
            Belmopan, Belize
          </p>
        </div>

        <div className="px-6 pb-5 pt-5">
          <p className="text-center font-display text-2xl text-forest">{title}</p>
          <p className="mt-1 text-center text-[11px] text-ink/40">
            {new Date().toLocaleDateString("en-BZ", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>

          <div className="my-4 border-t border-dashed border-forest/25" />

          {items.length > 0 && (
            <ul className="space-y-2.5 text-sm text-ink">
              {items.map((item) => (
                <li key={item.id} className="flex items-baseline gap-2">
                  <span className="min-w-0 truncate">
                    {item.name}{" "}
                    <span className="text-ink/45">× {item.quantity}</span>
                  </span>
                  <span className="min-w-4 flex-1 border-b border-dotted border-forest/20" />
                  <span className="shrink-0 tabular-nums tracking-tight text-forest-dark">
                    {item.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="my-4 border-t border-dashed border-forest/25" />

          <div className="space-y-1.5 text-sm">
            {rows.map((row) => (
              <ReceiptRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>

          {note && (
            <p className="mt-3 text-center text-[11px] font-medium text-leaf">
              {note}
            </p>
          )}

          <div className="my-4 border-t border-dashed border-forest/25" />

          <div className="flex items-baseline justify-between gap-3 text-sm text-ink/70">
            <span>Order total</span>
            <span className="tabular-nums">{total}</span>
          </div>

          {depositDue && (
            <div className="mt-2 flex items-baseline justify-between gap-3 font-display text-xl text-forest-dark">
              <span>{dueNowLabel}</span>
              <span className="tabular-nums">{depositDue}</span>
            </div>
          )}

          {balanceDue && (
            <div className="mt-1.5 flex items-baseline justify-between gap-3 text-sm text-ink/55">
              <span>Balance at pickup</span>
              <span className="tabular-nums">{balanceDue}</span>
            </div>
          )}

          {!depositDue && (
            <div className="flex items-baseline justify-between gap-3 font-display text-xl text-forest-dark">
              <span>Total</span>
              <span className="tabular-nums">{total}</span>
            </div>
          )}

          {estimates && estimates.length > 0 && (
            <div className="mt-4 space-y-1.5 border-t border-dashed border-forest/20 pt-4 text-sm">
              <p className="text-[11px] font-medium text-ink/45">Pay separately at courier</p>
              {estimates.map((row) => (
                <ReceiptRow key={row.label} label={row.label} value={row.value} />
              ))}
            </div>
          )}

          {children}

          <p className="mt-5 text-center text-[11px] italic text-ink/40">
            Thank you for growing with us
          </p>
        </div>
      </div>
      <div
        aria-hidden
        className="h-3 w-full"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #FFFEF8 50%, transparent 50%), linear-gradient(-135deg, #FFFEF8 50%, transparent 50%)",
          backgroundPosition: "0 0, 8px 0",
          backgroundSize: "16px 16px",
          backgroundRepeat: "repeat-x",
        }}
      />
    </aside>
  );
}
