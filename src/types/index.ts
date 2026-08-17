export type PropagationType = "Grafted" | "Air-Layered" | "Selective Breeding";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  propagationType: PropagationType;
  size: string;
  fruitImage: string;
  plantImage: string;
  description: string;
  flavorProfile: string;
  featured: boolean;
  limitedSupply?: boolean;
  veryRare?: boolean;
  certified?: boolean;
  inStock?: boolean;
}

export interface Address {
  id: string;
  label: string;
  district: string;
  town: string;
  village: string;
  fullAddress: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash?: string;
  addresses: Address[];
  createdAt: string;
  role: "customer" | "admin";
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface StoredCart {
  items: CartItem[];
  updatedAt: string;
}

export interface BoxSize {
  id: string;
  name: string;
  price: number;
  minPlants: number;
  maxPlants: number;
  description: string;
}

export interface BoxRecommendation {
  boxes: { box: BoxSize; quantity: number }[];
  plantCount: number;
  total: number;
  label: string;
}

export interface CourierRate {
  district: string;
  fee: number;
}

export type IdsPackageTier =
  | "envelope"
  | "xs"
  | "small"
  | "medium"
  | "large"
  | "xl";

export interface IdsZoneRates {
  label: string;
  districts: string[];
  packages: Record<IdsPackageTier, number>;
}

export interface IdsRates {
  courierName: string;
  gstNote: string;
  zones: {
    "central-northern": IdsZoneRates;
    south: IdsZoneRates;
  };
  packageLabels: Record<IdsPackageTier, string>;
  boxToPackage: Record<string, IdsPackageTier>;
  deliverySurcharges: {
    townLimits: number;
    outOfTown: number;
    note: string;
  };
}

export interface Courier {
  id: string;
  name: string;
  active: boolean;
  notes: string;
  rateModel?: "flat" | "ids";
  rates: CourierRate[];
}

export interface LocalDeliverySettings {
  towns: string[];
  fee: number;
  freeThreshold: number;
  currency: string;
}

export interface ShippingSettings {
  localDelivery: LocalDeliverySettings;
  boxes: BoxSize[];
}

export type OrderStatus =
  | "Payment Pending"
  | "Payment Review"
  | "Paid"
  | "Processing"
  | "Shipped"
  | "Completed"
  | "Refunded";

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  district: string;
  town: string;
  village: string;
  fullAddress: string;
  method: "local" | "courier" | "pickup";
  courierId?: string;
  courierName?: string;
}

export interface PaymentInfo {
  method: "bank-transfer";
  proofChannel?: "whatsapp" | "upload";
  proofDataUrl?: string;
  proofFileName?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface OrderEvent {
  status: OrderStatus | string;
  at: string;
  note?: string;
}

export interface Order {
  id: string;
  reference: string;
  invoiceNumber: string;
  invoiceIssuedAt?: string;
  userId: string;
  items: { productId: string; name: string; price: number; quantity: number }[];
  subtotal: number;
  deliveryFee: number;
  boxFee: number;
  /** Approximate fee the customer pays at the courier office — not charged by Greenhouse Co-Op. */
  courierEstimate: number;
  total: number;
  boxRecommendation: BoxRecommendation;
  status: OrderStatus;
  shipping: ShippingInfo;
  payment: PaymentInfo;
  createdAt: string;
  updatedAt: string;
  timeline: OrderEvent[];
}

export interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  swift: string;
  instructions: string;
  accounts?: BankAccount[];
}

export interface Session {
  userId: string;
  email: string;
  role: "customer" | "admin";
}
