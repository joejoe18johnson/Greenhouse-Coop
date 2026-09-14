import { PICKUP_LOCATION } from "@/lib/constants";
import { customerTimelineNote } from "@/lib/order-status-messages";
import { splitCustomerName } from "@/lib/split-customer-name";
import {
  applyLoyaltyDiscountToTotal,
  isLoyaltyDiscountEligibleForCheckout,
} from "@/lib/loyalty-discount";
import { computeOrderTotal, quoteShipping } from "@/lib/shipping";
import { formatBZD, generateInvoiceNumber, generateReference } from "@/lib/utils";
import { LOYALTY_DISCOUNT_LABEL } from "@/lib/loyalty-discount";
import type {
  Courier,
  IdsRates,
  Order,
  OrderStatus,
  PaymentInfo,
  Product,
  ShippingInfo,
  ShippingSettings,
} from "@/types";

export interface AdminOrderCustomerInput {
  userId?: string;
  customerName: string;
  phone: string;
  email?: string;
  district: string;
  town: string;
  village?: string;
  fullAddress: string;
}

export interface AdminOrderLineItem {
  productId: string;
  quantity: number;
  /** Override catalog unit price on the invoice. */
  price?: number;
}

export interface AdminCreateOrderInput {
  customer: AdminOrderCustomerInput;
  items: AdminOrderLineItem[];
  /** Flat BZD discount applied after loyalty (large-order / custom pricing). */
  invoiceDiscount?: number;
  invoiceDiscountNote?: string;
  wantsDelivery: boolean;
  courierId?: string;
  paymentMethod: PaymentInfo["method"];
  paymentPlan?: PaymentInfo["paymentPlan"];
  customerNotes?: string;
  codMeetingLocation?: string;
  /** When set, overrides the default status from payment method. */
  initialStatus?: OrderStatus;
  adminNote?: string;
}

export interface AdminEditOrderInput extends AdminCreateOrderInput {
  editNote?: string;
}

export function defaultAdminOrderStatus(input: AdminCreateOrderInput): OrderStatus {
  if (input.initialStatus) return input.initialStatus;
  return input.paymentMethod === "cod" ? "Processing" : "Payment Pending";
}

function quoteShippingMethod(town: string, shipping: ShippingSettings) {
  const local = shipping.localDelivery.towns.some(
    (entry) => entry.name.toLowerCase() === town.trim().toLowerCase()
  );
  return local ? "local" : "courier";
}

function buildPaymentForInput(
  input: AdminCreateOrderInput,
  status: OrderStatus,
  existing?: PaymentInfo
): PaymentInfo {
  if (input.paymentMethod === "cod") {
    return { method: "cod" };
  }

  return {
    method: "bank-transfer",
    proofChannel: existing?.proofChannel ?? "whatsapp",
    paymentPlan: input.paymentPlan ?? existing?.paymentPlan ?? "deposit",
    reviewedAt: existing?.reviewedAt ?? (status === "Paid" ? new Date().toISOString() : undefined),
    reviewedBy: existing?.reviewedBy ?? (status === "Paid" ? "admin" : undefined),
    rejectionReason: existing?.rejectionReason,
    proofDataUrl: existing?.proofDataUrl,
    proofFileName: existing?.proofFileName,
  };
}

function computeAdminOrderContent(options: {
  input: AdminCreateOrderInput;
  products: Product[];
  shipping: ShippingSettings;
  couriers: Courier[];
  idsRates?: IdsRates;
  userId?: string;
  orders?: Order[];
  excludeOrderId?: string;
}) {
  const { input, products, shipping, couriers, idsRates } = options;
  const catalog = new Map(products.map((product) => [product.id, product]));

  const lineItems = input.items
    .filter((item) => item.quantity > 0)
    .map((item) => {
      const product = catalog.get(item.productId);
      if (!product) throw new Error(`Unknown product: ${item.productId}`);
      const unitPrice =
        item.price !== undefined && item.price >= 0
          ? Math.round(item.price * 100) / 100
          : product.price;
      return {
        productId: product.id,
        name: product.name,
        price: unitPrice,
        quantity: item.quantity,
      };
    });

  if (!lineItems.length) {
    throw new Error("Add at least one tree to the order.");
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const plantCount = lineItems.reduce((sum, item) => sum + item.quantity, 0);
  const { firstName, lastName } = splitCustomerName(input.customer.customerName);
  const activeCouriers = couriers.filter((courier) => courier.active);
  const courier = activeCouriers.find((entry) => entry.id === input.courierId) ?? activeCouriers[0];
  const district = input.wantsDelivery ? input.customer.district : "Cayo";
  const town = input.wantsDelivery ? input.customer.town : "Belmopan";
  const quote = quoteShipping({
    plantCount,
    subtotal,
    town,
    district,
    method: !input.wantsDelivery ? "pickup" : quoteShippingMethod(town, shipping),
    courier,
    shipping,
    idsRates,
  });
  const baseTotal = computeOrderTotal({
    subtotal,
    deliveryFee: quote.deliveryFee,
    boxFee: quote.boxFee,
  });
  const eligible =
    options.userId && options.orders
      ? isLoyaltyDiscountEligibleForCheckout(options.userId, options.orders, baseTotal, {
          excludeOrderId: options.excludeOrderId,
        })
      : false;
  const { total: afterLoyalty, loyaltyDiscount } = applyLoyaltyDiscountToTotal(baseTotal, eligible);
  const invoiceDiscount = Math.max(0, Math.floor(input.invoiceDiscount ?? 0));
  const total = Math.max(0, afterLoyalty - invoiceDiscount);
  const discountNote = input.invoiceDiscountNote?.trim();

  const shippingInfo: ShippingInfo = {
    firstName,
    lastName,
    email: input.customer.email?.trim() || "",
    phone: input.customer.phone.trim(),
    district,
    town,
    village: input.wantsDelivery ? input.customer.village?.trim() || "" : "",
    fullAddress: input.wantsDelivery ? input.customer.fullAddress.trim() : PICKUP_LOCATION,
    method: quote.method,
    codMeetingLocation:
      input.paymentMethod === "cod" && !input.wantsDelivery && input.codMeetingLocation?.trim()
        ? input.codMeetingLocation.trim()
        : undefined,
    courierId: quote.method === "courier" ? courier?.id : undefined,
    courierName: quote.method === "courier" ? courier?.name : undefined,
  };

  return {
    items: lineItems,
    subtotal,
    deliveryFee: quote.deliveryFee,
    boxFee: quote.boxFee,
    courierEstimate: quote.courierEstimate,
    total,
    loyaltyDiscount: loyaltyDiscount || undefined,
    invoiceDiscount: invoiceDiscount > 0 ? invoiceDiscount : undefined,
    invoiceDiscountNote:
      invoiceDiscount > 0 ? discountNote || "Custom pricing adjustment" : undefined,
    boxRecommendation: quote.box,
    shipping: shippingInfo,
  };
}

export function buildAdminOrderDraft(options: {
  input: AdminCreateOrderInput;
  userId: string;
  products: Product[];
  shipping: ShippingSettings;
  couriers: Courier[];
  idsRates?: IdsRates;
  orders?: Order[];
}): Omit<Order, "id" | "createdAt" | "updatedAt"> {
  const { input, userId, products, shipping, couriers, idsRates, orders } = options;
  const content = computeAdminOrderContent({
    input,
    products,
    shipping,
    couriers,
    idsRates,
    userId,
    orders,
  });
  const status = defaultAdminOrderStatus(input);
  const payment = buildPaymentForInput(input, status);
  const now = new Date().toISOString();
  const timelineNote =
    input.adminNote?.trim() ||
    `Order created by admin for ${input.customer.customerName.trim()}. ${customerTimelineNote(status, undefined, payment)}`;

  return {
    reference: generateReference(),
    invoiceNumber: generateInvoiceNumber(),
    invoiceIssuedAt: ["Paid", "Processing", "Shipped", "Completed"].includes(status) ? now : undefined,
    userId,
    ...content,
    status,
    payment,
    customerNotes: input.customerNotes?.trim() || undefined,
    timeline: [{ status, at: now, note: timelineNote }],
  };
}

export function orderToAdminEditInput(order: Order): AdminEditOrderInput {
  return {
    customer: {
      userId: order.userId,
      customerName: `${order.shipping.firstName} ${order.shipping.lastName}`.trim(),
      phone: order.shipping.phone,
      email: order.shipping.email,
      district: order.shipping.district,
      town: order.shipping.town,
      village: order.shipping.village,
      fullAddress: order.shipping.method === "pickup" ? "" : order.shipping.fullAddress,
    },
    items: order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    })),
    invoiceDiscount: order.invoiceDiscount,
    invoiceDiscountNote: order.invoiceDiscountNote,
    wantsDelivery: order.shipping.method !== "pickup",
    courierId: order.shipping.courierId,
    paymentMethod: order.payment.method,
    paymentPlan: order.payment.paymentPlan,
    customerNotes: order.customerNotes,
    codMeetingLocation: order.shipping.codMeetingLocation,
  };
}

export function orderItemsToQuantities(order: Order) {
  return Object.fromEntries(order.items.map((item) => [item.productId, item.quantity]));
}

export function orderLinePricesFromOrder(order: Order) {
  return Object.fromEntries(order.items.map((item) => [item.productId, item.price]));
}

export function buildAdminOrderLineItems(
  quantities: Record<string, number>,
  linePrices: Record<string, number | undefined>
): AdminOrderLineItem[] {
  return Object.entries(quantities)
    .filter(([, quantity]) => quantity > 0)
    .map(([productId, quantity]) => {
      const item: AdminOrderLineItem = { productId, quantity };
      const price = linePrices[productId];
      if (price !== undefined && price >= 0) {
        item.price = price;
      }
      return item;
    });
}

export function buildAdminOrderUpdate(options: {
  existing: Order;
  input: AdminEditOrderInput;
  products: Product[];
  shipping: ShippingSettings;
  couriers: Courier[];
  idsRates?: IdsRates;
  orders?: Order[];
}): Order {
  const { existing, input, products, shipping, couriers, idsRates, orders } = options;
  const content = computeAdminOrderContent({
    input,
    products,
    shipping,
    couriers,
    idsRates,
    userId: existing.userId,
    orders,
    excludeOrderId: existing.id,
  });
  const payment = buildPaymentForInput(input, existing.status, existing.payment);
  const now = new Date().toISOString();
  const editNote =
    input.editNote?.trim() ||
    "Order details updated by admin. Totals and fulfillment may have changed — check your invoice.";

  return {
    ...existing,
    ...content,
    payment,
    customerNotes: input.customerNotes?.trim() || undefined,
    updatedAt: now,
    timeline: [...existing.timeline, { status: "Updated", at: now, note: editNote }],
  };
}

export function validateAdminCreateOrderInput(input: AdminCreateOrderInput) {
  if (!input.customer.customerName.trim()) {
    throw new Error("Customer name is required.");
  }
  if (!input.customer.phone.trim()) {
    throw new Error("Customer phone is required.");
  }
  if (input.wantsDelivery && !input.customer.fullAddress.trim()) {
    throw new Error("Delivery address is required.");
  }
  if (!input.items.some((item) => item.quantity > 0)) {
    throw new Error("Add at least one tree to the order.");
  }
  for (const item of input.items) {
    if (item.price !== undefined && item.price < 0) {
      throw new Error("Line prices cannot be negative.");
    }
  }
  if ((input.invoiceDiscount ?? 0) < 0) {
    throw new Error("Invoice discount cannot be negative.");
  }
}

export function validateAdminEditOrderInput(input: AdminEditOrderInput) {
  validateAdminCreateOrderInput(input);
}

export function adminOrderReceiptRows(
  order: Pick<
    Order,
    | "subtotal"
    | "deliveryFee"
    | "boxFee"
    | "loyaltyDiscount"
    | "invoiceDiscount"
    | "invoiceDiscountNote"
    | "shipping"
  >
) {
  return [
    { label: "Subtotal", value: formatBZD(order.subtotal) },
    ...(order.deliveryFee > 0
      ? [{ label: "Local delivery", value: formatBZD(order.deliveryFee) }]
      : order.shipping.method === "pickup"
        ? [{ label: "Delivery", value: "Collect" }]
        : []),
    ...(order.boxFee > 0 ? [{ label: "Box", value: formatBZD(order.boxFee) }] : []),
    ...((order.loyaltyDiscount ?? 0) > 0
      ? [{ label: LOYALTY_DISCOUNT_LABEL, value: `−${formatBZD(order.loyaltyDiscount!)}` }]
      : []),
    ...((order.invoiceDiscount ?? 0) > 0
      ? [
          {
            label: order.invoiceDiscountNote || "Custom pricing adjustment",
            value: `−${formatBZD(order.invoiceDiscount!)}`,
          },
        ]
      : []),
  ];
}

/** Build a preview draft when editing — preserves identity fields from the existing order. */
export function buildAdminOrderEditPreview(options: {
  existing: Order;
  input: AdminEditOrderInput;
  products: Product[];
  shipping: ShippingSettings;
  couriers: Courier[];
  idsRates?: IdsRates;
  orders?: Order[];
}): Order {
  return buildAdminOrderUpdate(options);
}
