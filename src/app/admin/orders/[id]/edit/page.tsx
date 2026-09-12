"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  Minus,
  Plus,
  Search,
  Store,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderReceipt } from "@/components/checkout/order-receipt";
import { useCouriers } from "@/hooks/use-couriers";
import { useIdsRates } from "@/hooks/use-ids-rates";
import { useProducts } from "@/hooks/use-products";
import { useShippingSettings } from "@/hooks/use-shipping-settings";
import {
  buildAdminOrderEditPreview,
  orderItemsToQuantities,
  orderToAdminEditInput,
  validateAdminEditOrderInput,
  type AdminEditOrderInput,
} from "@/lib/admin-order";
import {
  formatAmountDueNow,
  formatOrderBalance,
  type PaymentPlan,
} from "@/lib/order-deposit";
import { getOrders, updateAdminOrder } from "@/lib/store";
import { localDeliveryFeeForTownText } from "@/lib/shipping-copy";
import { isLocalTown } from "@/lib/shipping";
import { formatBZD } from "@/lib/utils";
import { COURIER_ESTIMATE_NOTICE, PICKUP_LOCATION, PICKUP_NOTE } from "@/lib/constants";
import locations from "@/data/locations.json";
import type { PaymentInfo } from "@/types";

type LineQty = Record<string, number>;

const emptyCustomer = {
  userId: "" as string | undefined,
  customerName: "",
  phone: "",
  email: "",
  district: "Cayo",
  town: "Belmopan",
  village: "",
  fullAddress: "",
};

export default function AdminEditOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const order = getOrders().find((entry) => entry.id === id);

  const products = useProducts();
  const shipping = useShippingSettings();
  const couriers = useCouriers().filter((courier) => courier.active);
  const idsRates = useIdsRates();

  const [initialized, setInitialized] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [customer, setCustomer] = useState(emptyCustomer);
  const [quantities, setQuantities] = useState<LineQty>({});
  const [wantsDelivery, setWantsDelivery] = useState(true);
  const [courierId, setCourierId] = useState(couriers[0]?.id || "ids");
  const [paymentMethod, setPaymentMethod] = useState<PaymentInfo["method"]>("bank-transfer");
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("deposit");
  const [codMeetingLocation, setCodMeetingLocation] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [editNote, setEditNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!order || initialized) return;
    const input = orderToAdminEditInput(order);
    setCustomer({
      ...emptyCustomer,
      ...input.customer,
      email: input.customer.email ?? "",
      village: input.customer.village ?? "",
    });
    setQuantities(orderItemsToQuantities(order));
    setWantsDelivery(input.wantsDelivery);
    setCourierId(input.courierId || couriers[0]?.id || "ids");
    setPaymentMethod(input.paymentMethod);
    setPaymentPlan(input.paymentPlan ?? "deposit");
    setCodMeetingLocation(input.codMeetingLocation ?? "");
    setCustomerNotes(input.customerNotes ?? "");
    setInitialized(true);
  }, [order, initialized, couriers]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    const list = [...products].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return list;
    return list.filter(
      (product) =>
        product.name.toLowerCase().includes(q) || product.category.toLowerCase().includes(q)
    );
  }, [products, productQuery]);

  const towns = locations.districts.find((d) => d.name === customer.district)?.towns ?? [];
  const local = isLocalTown(customer.town, shipping.localDelivery);
  const courierOnly = wantsDelivery && !local;

  useEffect(() => {
    if (courierOnly && paymentMethod === "cod") {
      setPaymentMethod("bank-transfer");
    }
  }, [courierOnly, paymentMethod]);

  const selectedItems = useMemo(
    () =>
      Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([productId, quantity]) => ({ productId, quantity })),
    [quantities]
  );

  const draftInput = useMemo<AdminEditOrderInput>(
    () => ({
      customer: {
        ...customer,
        userId: order?.userId,
        email: customer.email || undefined,
      },
      items: selectedItems,
      wantsDelivery,
      courierId,
      paymentMethod,
      paymentPlan,
      customerNotes: customerNotes || undefined,
      codMeetingLocation: codMeetingLocation || undefined,
      editNote: editNote || undefined,
    }),
    [
      customer,
      selectedItems,
      wantsDelivery,
      courierId,
      paymentMethod,
      paymentPlan,
      customerNotes,
      codMeetingLocation,
      editNote,
      order?.userId,
    ]
  );

  const preview = useMemo(() => {
    if (!order || !selectedItems.length || !customer.customerName.trim() || !customer.phone.trim()) {
      return null;
    }
    try {
      return buildAdminOrderEditPreview({
        existing: order,
        input: draftInput,
        products,
        shipping,
        couriers,
        idsRates,
      });
    } catch {
      return null;
    }
  }, [order, selectedItems, customer.customerName, customer.phone, draftInput, products, shipping, couriers, idsRates]);

  const paymentContext: PaymentInfo = preview?.payment ?? { method: paymentMethod, paymentPlan };
  const isCod = paymentMethod === "cod";

  function setQty(productId: string, next: number) {
    setQuantities((prev) => {
      const qty = Math.max(0, next);
      if (qty === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: qty };
    });
  }

  async function handleSave() {
    if (!order) return;
    setError("");
    setSubmitting(true);
    try {
      validateAdminEditOrderInput(draftInput);
      await updateAdminOrder(order.id, draftInput);
      router.push(`/admin/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update order.");
      setSubmitting(false);
    }
  }

  if (!order) {
    return (
      <div className="px-6 py-20 text-center">
        <p>Order not found.</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link href="/admin/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  if (!initialized) return null;

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-3 -ml-2 gap-2" asChild>
            <Link href={`/admin/orders/${order.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to order
            </Link>
          </Button>
          <h1 className="page-title">Edit order</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink/60">
            Fix customer mistakes — update trees, delivery, payment type, or notes. Reference{" "}
            <span className="keep-case font-medium text-forest">{order.reference}</span> and invoice{" "}
            <span className="keep-case">{order.invoiceNumber}</span> stay the same. Totals recalculate
            automatically.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-[28px] bg-white p-6">
            <h2 className="font-display text-2xl text-forest">Customer</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Full name</Label>
                <Input
                  className="mt-1"
                  value={customer.customerName}
                  onChange={(e) => setCustomer({ ...customer, customerName: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  className="mt-1"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Email (optional)</Label>
                <Input
                  className="mt-1"
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-6">
            <h2 className="font-display text-2xl text-forest">Trees</h2>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
              <Input
                className="pl-9"
                placeholder="Search catalog"
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
              />
            </div>
            <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {filteredProducts.map((product) => {
                const qty = quantities[product.id] ?? 0;
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 rounded-[18px] border border-forest/8 bg-cream/30 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-forest">{product.name}</p>
                      <p className="text-xs text-ink/45">
                        {product.category} · {formatBZD(product.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQty(product.id, qty - 1)}
                        aria-label={`Decrease ${product.name}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQty(product.id, qty + 1)}
                        aria-label={`Increase ${product.name}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-6">
            <h2 className="flex items-center gap-2 font-display text-2xl text-forest">
              <Truck className="h-6 w-6" />
              Delivery
            </h2>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3 rounded-[18px] border border-forest/10 p-4">
                <Checkbox checked={wantsDelivery} onChange={setWantsDelivery} />
                <span>Deliver to customer</span>
              </label>
              {!wantsDelivery && (
                <>
                  <p className="text-sm text-ink/55">
                    Customer collects at <strong>{PICKUP_LOCATION}</strong>. {PICKUP_NOTE}
                  </p>
                  {isCod && (
                    <div>
                      <Label htmlFor="cod-meeting-location">Preferred meet location in Belmopan (optional)</Label>
                      <Input
                        id="cod-meeting-location"
                        className="mt-1"
                        value={codMeetingLocation}
                        onChange={(e) => setCodMeetingLocation(e.target.value)}
                        placeholder="e.g. Near Brodies, Ring Road"
                        maxLength={200}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            {wantsDelivery && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>District</Label>
                  <Select
                    className="mt-1"
                    value={customer.district}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        district: e.target.value,
                        town:
                          locations.districts.find((d) => d.name === e.target.value)?.towns[0] ??
                          customer.town,
                      })
                    }
                  >
                    {locations.districts.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Town</Label>
                  <Select
                    className="mt-1"
                    value={customer.town}
                    onChange={(e) => setCustomer({ ...customer, town: e.target.value })}
                  >
                    {towns.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Village / area</Label>
                  <Input
                    className="mt-1"
                    value={customer.village}
                    onChange={(e) => setCustomer({ ...customer, village: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Full address</Label>
                  <Textarea
                    className="mt-1"
                    value={customer.fullAddress}
                    onChange={(e) => setCustomer({ ...customer, fullAddress: e.target.value })}
                    placeholder="Street, landmarks, directions"
                  />
                </div>
                {local ? (
                  <p className="sm:col-span-2 text-sm text-ink/55">
                    Local delivery to {customer.town}.{" "}
                    {localDeliveryFeeForTownText(shipping, customer.town) === "FREE"
                      ? "FREE"
                      : `Flat ${localDeliveryFeeForTownText(shipping, customer.town)}.`}
                  </p>
                ) : (
                  <div className="sm:col-span-2">
                    <Label>Courier</Label>
                    <Select
                      className="mt-1"
                      value={courierId}
                      onChange={(e) => setCourierId(e.target.value)}
                    >
                      {couriers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                    <p className="mt-2 text-xs text-ink/45">{COURIER_ESTIMATE_NOTICE}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="rounded-[28px] bg-white p-6">
            <h2 className="flex items-center gap-2 font-display text-2xl text-forest">
              <Banknote className="h-6 w-6" />
              Payment
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                disabled={courierOnly}
                className={`rounded-[18px] border p-4 text-left ${
                  paymentMethod === "cod" ? "border-forest bg-forest/5" : "border-forest/10"
                } ${courierOnly ? "opacity-50" : ""}`}
              >
                <p className="font-semibold text-forest">Cash on delivery</p>
                <p className="mt-1 text-xs text-ink/50">Local delivery or pickup only</p>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("bank-transfer")}
                className={`rounded-[18px] border p-4 text-left ${
                  paymentMethod === "bank-transfer" ? "border-forest bg-forest/5" : "border-forest/10"
                }`}
              >
                <p className="font-semibold text-forest">Bank transfer</p>
                <p className="mt-1 text-xs text-ink/50">Deposit or pay in full</p>
              </button>
            </div>
            {paymentMethod === "bank-transfer" && (
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentPlan("deposit")}
                  className={`rounded-full px-4 py-2 text-sm ${
                    paymentPlan === "deposit" ? "bg-forest text-cream" : "bg-forest/10 text-forest"
                  }`}
                >
                  50% deposit
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentPlan("full")}
                  className={`rounded-full px-4 py-2 text-sm ${
                    paymentPlan === "full" ? "bg-forest text-cream" : "bg-forest/10 text-forest"
                  }`}
                >
                  Pay in full
                </button>
              </div>
            )}
            <p className="mt-4 text-xs text-ink/45">
              Order status stays <strong>{order.status}</strong>. Change status from the order page if needed.
            </p>
          </section>

          <section className="rounded-[28px] bg-white p-6">
            <h2 className="font-display text-2xl text-forest">Notes</h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label>Customer notes</Label>
                <Textarea
                  className="mt-1"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Delivery instructions, substitutions, etc."
                />
              </div>
              <div>
                <Label>Update note for customer timeline (optional)</Label>
                <Textarea
                  className="mt-1"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="e.g. We updated your delivery address per your WhatsApp message."
                />
              </div>
            </div>
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button size="lg" className="w-full sm:w-auto" disabled={submitting} onClick={handleSave}>
            {submitting ? "Saving changes…" : "Save changes"}
          </Button>
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          {preview ? (
            <OrderReceipt
              title="Updated preview"
              items={preview.items.map((item) => ({
                id: item.productId,
                name: item.name,
                quantity: item.quantity,
                amount: formatBZD(item.price * item.quantity),
              }))}
              rows={[
                { label: "Subtotal", value: formatBZD(preview.subtotal) },
                ...(preview.deliveryFee > 0
                  ? [{ label: "Local delivery", value: formatBZD(preview.deliveryFee) }]
                  : preview.shipping.method === "pickup"
                    ? [{ label: "Delivery", value: "Collect" }]
                    : []),
                ...(preview.boxFee > 0 ? [{ label: "Box", value: formatBZD(preview.boxFee) }] : []),
              ]}
              total={formatBZD(preview.total)}
              depositDue={!isCod ? formatAmountDueNow(preview.total, paymentContext) : undefined}
              balanceDue={!isCod ? formatOrderBalance(preview.total) : undefined}
              dueNowLabel={
                isCod
                  ? "Pay in cash on delivery"
                  : paymentPlan === "full"
                    ? "Pay in full now"
                    : "Deposit due now (50%)"
              }
              note={`Status unchanged: ${order.status}`}
              estimates={
                preview.courierEstimate > 0
                  ? [{ label: "Courier estimate (at office)", value: formatBZD(preview.courierEstimate) }]
                  : undefined
              }
            >
              {preview.total !== order.total && (
                <p className="text-xs text-citrus">
                  Total was {formatBZD(order.total)} — now {formatBZD(preview.total)}
                </p>
              )}
            </OrderReceipt>
          ) : (
            <div className="rounded-[28px] bg-white p-6 text-sm text-ink/50">
              <Store className="mb-3 h-8 w-8 text-forest/30" />
              Add customer details and at least one tree to preview changes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
