import { PICKUP_LOCATION } from "@/lib/constants";
import { customerTimelineNote } from "@/lib/order-status-messages";
import { splitCustomerName } from "@/lib/split-customer-name";
import { computeOrderTotal, quoteShipping } from "@/lib/shipping";
import { generateInvoiceNumber, generateReference } from "@/lib/utils";
import type {
  Courier,
  IdsRates,
  Order,
  OrderStatus,
  PaymentInfo,
  Product,
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

export interface AdminCreateOrderInput {
  customer: AdminOrderCustomerInput;
  items: { productId: string; quantity: number }[];
  wantsDelivery: boolean;
  courierId?: string;
  paymentMethod: PaymentInfo["method"];
  paymentPlan?: PaymentInfo["paymentPlan"];
  customerNotes?: string;
  /** When set, overrides the default status from payment method. */
  initialStatus?: OrderStatus;
  adminNote?: string;
}

export function defaultAdminOrderStatus(input: AdminCreateOrderInput): OrderStatus {
  if (input.initialStatus) return input.initialStatus;
  return input.paymentMethod === "cod" ? "Processing" : "Payment Pending";
}

export function buildAdminOrderDraft(options: {
  input: AdminCreateOrderInput;
  userId: string;
  products: Product[];
  shipping: ShippingSettings;
  couriers: Courier[];
  idsRates?: IdsRates;
}): Omit<Order, "id" | "createdAt" | "updatedAt"> {
  const { input, userId, products, shipping, couriers, idsRates } = options;
  const catalog = new Map(products.map((product) => [product.id, product]));

  const lineItems = input.items
    .filter((item) => item.quantity > 0)
    .map((item) => {
      const product = catalog.get(item.productId);
      if (!product) throw new Error(`Unknown product: ${item.productId}`);
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
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
  const total = computeOrderTotal({
    subtotal,
    deliveryFee: quote.deliveryFee,
    boxFee: quote.boxFee,
  });
  const status = defaultAdminOrderStatus(input);
  const payment: PaymentInfo =
    input.paymentMethod === "cod"
      ? { method: "cod" }
      : {
          method: "bank-transfer",
          proofChannel: "whatsapp",
          paymentPlan: input.paymentPlan ?? "deposit",
          ...(status === "Paid" ? { reviewedAt: new Date().toISOString(), reviewedBy: "admin" } : {}),
        };
  const now = new Date().toISOString();
  const timelineNote =
    input.adminNote?.trim() ||
    `Order created by admin for ${input.customer.customerName.trim()}. ${customerTimelineNote(status, undefined, payment)}`;

  return {
    reference: generateReference(),
    invoiceNumber: generateInvoiceNumber(),
    invoiceIssuedAt: ["Paid", "Processing", "Shipped", "Completed"].includes(status) ? now : undefined,
    userId,
    items: lineItems,
    subtotal,
    deliveryFee: quote.deliveryFee,
    boxFee: quote.boxFee,
    courierEstimate: quote.courierEstimate,
    total,
    boxRecommendation: quote.box,
    status,
    shipping: {
      firstName,
      lastName,
      email: input.customer.email?.trim() || "",
      phone: input.customer.phone.trim(),
      district,
      town,
      village: input.wantsDelivery ? input.customer.village?.trim() || "" : "",
      fullAddress: input.wantsDelivery ? input.customer.fullAddress.trim() : PICKUP_LOCATION,
      method: quote.method,
      courierId: quote.method === "courier" ? courier?.id : undefined,
      courierName: quote.method === "courier" ? courier?.name : undefined,
    },
    payment,
    customerNotes: input.customerNotes?.trim() || undefined,
    timeline: [{ status, at: now, note: timelineNote }],
  };
}

function quoteShippingMethod(town: string, shipping: ShippingSettings) {
  const local = shipping.localDelivery.towns.some(
    (entry) => entry.name.toLowerCase() === town.trim().toLowerCase()
  );
  return local ? "local" : "courier";
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
}
