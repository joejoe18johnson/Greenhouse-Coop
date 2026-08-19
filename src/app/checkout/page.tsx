"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, CircleCheck, Landmark, MessageSquare, Store, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Radio } from "@/components/ui/checkbox";
import { IconBubble } from "@/components/ui/icon-bubble";
import { BankAccountCard } from "@/components/checkout/bank-account-card";
import { OrderReceipt } from "@/components/checkout/order-receipt";
import { InventoryNotice } from "@/components/product/inventory-notice";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useCouriers } from "@/hooks/use-couriers";
import { useIdsRates } from "@/hooks/use-ids-rates";
import { useShippingSettings } from "@/hooks/use-shipping-settings";
import { getBankDetails, createOrder } from "@/lib/store";
import { bankAccounts } from "@/lib/bank";
import { isLocalTown, computeOrderTotal, getCourierEstimate, quoteShipping } from "@/lib/shipping";
import { getIdsZoneLabel } from "@/lib/ids-rates";
import { localDeliveryWaivedText } from "@/lib/shipping-copy";
import { formatBZD } from "@/lib/utils";
import { COURIER_ESTIMATE_NOTICE, PAYMENT_NOTICE, PICKUP_LOCATION, PICKUP_NOTE } from "@/lib/constants";
import {
  DEPOSIT_NOTICE,
  FULL_PAYMENT_NOTICE,
  formatAmountDueNow,
  formatOrderBalance,
  formatOrderDeposit,
  type PaymentPlan,
} from "@/lib/order-deposit";
import locations from "@/data/locations.json";

export default function CheckoutPage() {
  const { user, ready } = useAuth();
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const shipping = useShippingSettings();
  const couriers = useCouriers().filter((c) => c.active);
  const idsRateTable = useIdsRates();
  const bank = getBankDetails();

  const [wantsDelivery, setWantsDelivery] = useState(true);
  const [district, setDistrict] = useState(user?.addresses[0]?.district || "Cayo");
  const [town, setTown] = useState(user?.addresses[0]?.town || "Belmopan");
  const [village, setVillage] = useState(user?.addresses[0]?.village || "");
  const [fullAddress, setFullAddress] = useState(user?.addresses[0]?.fullAddress || "");
  const [courierId, setCourierId] = useState(couriers[0]?.id || "ids");
  const [customerNotes, setCustomerNotes] = useState("");
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("deposit");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<string>();

  const towns = locations.districts.find((d) => d.name === district)?.towns || [];
  const local = isLocalTown(town, shipping.localDelivery);
  const method = !wantsDelivery ? "pickup" : local ? "local" : "courier";
  const courier = couriers.find((c) => c.id === courierId);
  const plantCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const quote = useMemo(
    () =>
      quoteShipping({
        plantCount,
        subtotal,
        town,
        district,
        method,
        courier,
        shipping,
        idsRates: idsRateTable,
      }),
    [plantCount, subtotal, town, district, method, courier, shipping, idsRateTable]
  );
  const total = computeOrderTotal({
    subtotal,
    deliveryFee: quote.deliveryFee,
    boxFee: quote.boxFee,
  });
  const amountDueNow = formatAmountDueNow(total, paymentPlan);
  const dueNowLabel = paymentPlan === "full" ? "Pay in full now" : "Deposit due now (50%)";

  if (!ready) return null;

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-display text-4xl text-forest-dark">Create an account to checkout</h1>
        <p className="mt-4 text-ink/65">Orders require an account so we can track payment, delivery, and invoices.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="w-full sm:w-auto"><Link href="/register?next=/cart">Create account</Link></Button>
          <Button variant="outline" asChild className="w-full sm:w-auto"><Link href="/login?next=/cart">Sign in</Link></Button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !placed) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-display text-4xl">Your cart is empty</h1>
        <Button className="mt-6" asChild><Link href="/shop">Shop trees</Link></Button>
      </div>
    );
  }

  function placeOrder() {
    if (submitting) return;
    setError("");

    if (wantsDelivery && !fullAddress.trim()) {
      const message = "Please enter your full delivery address.";
      setError(message);
      document.getElementById("checkout-address")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);

    try {
      const order = createOrder({
        userId: user!.id,
        items: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
        })),
        subtotal,
        deliveryFee: quote.deliveryFee,
        boxFee: quote.boxFee,
        courierEstimate: quote.courierEstimate,
        total,
        boxRecommendation: quote.box,
        status: "Payment Pending",
        shipping: {
          firstName: user!.firstName,
          lastName: user!.lastName,
          email: user!.email,
          phone: user!.phone,
          district: wantsDelivery ? district : "Cayo",
          town: wantsDelivery ? town : "Belmopan",
          village: wantsDelivery ? village : "",
          fullAddress: wantsDelivery ? fullAddress : PICKUP_LOCATION,
          method,
          courierId: method === "courier" ? courier?.id : undefined,
          courierName: method === "courier" ? courier?.name : undefined,
        },
        payment: {
          method: "bank-transfer",
          proofChannel: "whatsapp",
          paymentPlan,
        },
        customerNotes: customerNotes.trim() || undefined,
      });

      setPlaced(order.reference);
      clear();
      router.push(`/dashboard/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place your order. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 pb-32 sm:px-6 lg:pb-12">
      <h1 className="page-title">Checkout</h1>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="order-2 space-y-8 lg:order-1">
          <section className="rounded-[28px] bg-white/80 p-6">
            <h2 className="flex items-center gap-2 font-display text-2xl text-forest">
              <Truck className="h-6 w-6" />
              Delivery
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Radio
                name="fulfillment"
                checked={wantsDelivery}
                onChange={() => setWantsDelivery(true)}
                className={`rounded-2xl border p-4 ${wantsDelivery ? "border-forest bg-forest/5" : "border-forest/10"}`}
                label={
                  <span className="flex items-start gap-3">
                    <IconBubble icon={Truck} size="sm" />
                    <span>
                      <span className="block font-semibold text-forest">I want delivery</span>
                      <span className="text-sm text-ink/60">Local drop-off or courier to your area</span>
                    </span>
                  </span>
                }
              />
              <Radio
                name="fulfillment"
                checked={!wantsDelivery}
                onChange={() => {
                  setWantsDelivery(false);
                  setError("");
                }}
                className={`rounded-2xl border p-4 ${!wantsDelivery ? "border-forest bg-forest/5" : "border-forest/10"}`}
                label={
                  <span className="flex items-start gap-3">
                    <IconBubble icon={Store} size="sm" />
                    <span>
                      <span className="block font-semibold text-forest">No delivery — I’ll collect</span>
                      <span className="text-sm text-ink/60">Pick up at the Belmopan Bus Terminal</span>
                    </span>
                  </span>
                }
              />
            </div>

            {!wantsDelivery ? (
              <p className="mt-4 flex items-start gap-3 rounded-2xl bg-leaf/10 p-4 text-sm text-forest">
                <Store className="mt-0.5 h-4 w-4 shrink-0" />
                {PICKUP_NOTE}
              </p>
            ) : (
              <>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>District</Label>
                    <Select className="mt-1" value={district} onChange={(e) => { setDistrict(e.target.value); setTown(locations.districts.find(d => d.name === e.target.value)?.towns[0] || ""); }}>
                      {locations.districts.map((d) => <option key={d.name}>{d.name}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Town</Label>
                    <Select className="mt-1" value={town} onChange={(e) => setTown(e.target.value)}>
                      {towns.map((t) => <option key={t}>{t}</option>)}
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Village</Label>
                    <Input className="mt-1" value={village} onChange={(e) => setVillage(e.target.value)} placeholder="Optional" />
                  </div>
                  <div className="md:col-span-2" id="checkout-address">
                    <Label>Full address</Label>
                    <Textarea
                      className="mt-1"
                      value={fullAddress}
                      onChange={(e) => {
                        setFullAddress(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Street, lot, landmarks"
                      required={wantsDelivery}
                    />
                  </div>
                </div>
                {local ? (
                  <p className="mt-4 flex items-start gap-3 rounded-2xl bg-leaf/10 p-4 text-sm text-forest">
                    <Truck className="mt-0.5 h-4 w-4 shrink-0" />
                    Local delivery to {town}. Flat {formatBZD(shipping.localDelivery.fee)}
                    {subtotal >= shipping.localDelivery.freeThreshold ? localDeliveryWaivedText(shipping) : "."}
                  </p>
                ) : (
                  <div className="mt-4">
                    <p className="flex items-start gap-3 rounded-2xl border border-citrus/30 bg-citrus/10 p-4 text-sm text-ink/75">
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                      <span>
                        Couriers usually work <strong>office-to-office</strong>. Your trees go to the courier office in your area — not door-to-door. You pay courier shipping directly at their office when you collect. We show approximate rates below to help you plan.
                      </span>
                    </p>
                    <Label className="mt-4 block">Courier</Label>
                    <div className="mt-2 grid gap-3">
                      {couriers.map((c) => {
                        const estimate = getCourierEstimate(c, district, quote.box, idsRateTable);
                        const zone =
                          c.rateModel === "ids" || c.id === "ids"
                            ? getIdsZoneLabel(district, idsRateTable)
                            : district;
                        return (
                        <Radio
                          key={c.id}
                          name="courier"
                          checked={courierId === c.id}
                          onChange={() => setCourierId(c.id)}
                          className={`rounded-2xl border p-4 ${courierId === c.id ? "border-forest bg-forest/5" : "border-forest/10"}`}
                          label={
                            <span className="flex items-start gap-3">
                              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                              <span>
                                <span className="block font-semibold text-forest">{c.name}</span>
                                <span className="text-sm text-ink/60">{c.notes}</span>
                                <span className="mt-1 block text-sm text-forest">
                                  Approx. {formatBZD(estimate)} at courier · {zone}
                                  {(c.rateModel === "ids" || c.id === "ids") && quote.box.label ? ` · ${quote.box.label}` : ""}
                                </span>
                                <span className="mt-0.5 block text-[11px] text-ink/45">Paid at courier office, not in your order total</span>
                              </span>
                            </span>
                          }
                        />
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          <section className="rounded-[28px] bg-white/80 p-6">
            <h2 className="flex items-center gap-2 font-display text-2xl text-forest">
              <MessageSquare className="h-6 w-6" />
              Order notes
            </h2>
            <p className="mt-2 text-sm text-ink/60">
              Optional — request substitutions, note delivery instructions, or ask us anything about your order.
            </p>
            <Label htmlFor="customer-notes" className="sr-only">
              Order notes
            </Label>
            <Textarea
              id="customer-notes"
              className="mt-4 min-h-[120px] rounded-2xl"
              placeholder="e.g. If mangosteen is unavailable, substitute Julie mango. Leave plants in shade at courier office."
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              maxLength={1000}
            />
            <p className="mt-2 text-xs text-ink/45">{customerNotes.length}/1000 characters</p>
          </section>

          <section className="rounded-[28px] bg-white/80 p-6">
            <h2 className="flex items-center gap-2 font-display text-2xl text-forest">
              <Landmark className="h-6 w-6" />
              Payment
            </h2>

            <div className="mt-4 grid gap-3">
              <Radio
                name="payment-plan"
                checked={paymentPlan === "deposit"}
                onChange={() => setPaymentPlan("deposit")}
                className={`rounded-2xl border p-4 ${paymentPlan === "deposit" ? "border-forest bg-forest/5" : "border-forest/10"}`}
                label={
                  <span>
                    <span className="block font-semibold text-forest">50% deposit — {formatOrderDeposit(total)} now</span>
                    <span className="mt-1 block text-sm text-ink/60">{DEPOSIT_NOTICE}</span>
                    <span className="mt-1 block text-sm text-ink/55">Balance {formatOrderBalance(total)} due at pickup.</span>
                  </span>
                }
              />
              <Radio
                name="payment-plan"
                checked={paymentPlan === "full"}
                onChange={() => setPaymentPlan("full")}
                className={`rounded-2xl border p-4 ${paymentPlan === "full" ? "border-forest bg-forest/5" : "border-forest/10"}`}
                label={
                  <span>
                    <span className="block font-semibold text-forest">Pay in full — {formatBZD(total)} now</span>
                    <span className="mt-1 block text-sm text-ink/60">{FULL_PAYMENT_NOTICE}</span>
                  </span>
                }
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 text-sm">
              {bankAccounts(bank).map((account) => (
                <BankAccountCard key={account.accountNumber} account={account} />
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-citrus/40 bg-citrus/10 p-4 text-sm">
              <p className="font-semibold text-forest">After you place the order</p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-ink/75">
                <li>You will receive a 6-character reference such as <strong className="keep-case">A7B2K9</strong>.</li>
                <li>Transfer <strong>{amountDueNow}</strong> and put that reference in the payment notes.</li>
                <li>Send your transfer screenshot on WhatsApp with the same reference.</li>
              </ol>
              <p className="mt-3">{PAYMENT_NOTICE}</p>
            </div>
          </section>
          <InventoryNotice />
          {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <Button
            type="button"
            size="lg"
            className="hidden w-full lg:inline-flex"
            disabled={submitting}
            onClick={placeOrder}
          >
            <CircleCheck className="h-4 w-4" />
            {submitting ? "Placing order…" : "Place order"}
          </Button>
          <p className="hidden text-sm text-ink/50 lg:block">You will send payment proof on WhatsApp after this order is placed.</p>
        </div>

        <div className="order-1 lg:order-2">
        <OrderReceipt
          items={items.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            quantity: i.quantity,
            amount: formatBZD(i.product.price * i.quantity),
          }))}
          rows={[
            { label: "Subtotal", value: formatBZD(subtotal) },
            { label: "Delivery", value: wantsDelivery ? formatBZD(quote.deliveryFee) : "Collect" },
            ...(wantsDelivery && method === "courier"
              ? [{ label: "Box", value: quote.boxFee ? formatBZD(quote.boxFee) : "Included" }]
              : wantsDelivery && method === "local"
                ? [{ label: "Box", value: "Included" }]
                : []),
          ]}
          estimates={
            quote.courierEstimate > 0
              ? [
                  {
                    label: `${courier?.name || "Courier"} (approx.)`,
                    value: formatBZD(quote.courierEstimate),
                  },
                ]
              : undefined
          }
          total={formatBZD(total)}
          depositDue={amountDueNow}
          balanceDue={paymentPlan === "deposit" ? formatOrderBalance(total) : undefined}
          dueNowLabel={dueNowLabel}
          note={
            wantsDelivery && quote.box.label
              ? method === "courier"
                ? `Recommended: ${quote.box.label}. ${COURIER_ESTIMATE_NOTICE}`
                : `Recommended: ${quote.box.label}`
              : undefined
          }
        />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-forest/10 bg-cream/95 p-4 backdrop-blur-lg safe-bottom lg:hidden">
        <div className="mx-auto max-w-6xl space-y-2">
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-ink/50">{dueNowLabel}</p>
              <p className="text-xl font-semibold text-forest">{amountDueNow}</p>
            </div>
            <Button
              type="button"
              size="lg"
              className="min-w-[9.5rem] shrink-0"
              disabled={submitting}
              onClick={placeOrder}
            >
              <CircleCheck className="h-4 w-4" />
              {submitting ? "Placing…" : "Place order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
