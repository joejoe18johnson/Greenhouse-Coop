import type {
  Address,
  BankDetails,
  CartItem,
  Courier,
  IdsRates,
  Order,
  Product,
  Session,
  ShippingSettings,
  StoredCart,
  User,
} from "@/types";

export interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  propagation_type: string;
  size: string;
  fruit_image: string;
  plant_image: string;
  description: string;
  flavor_profile: string;
  featured: boolean;
  limited_supply: boolean;
  very_rare: boolean;
  certified: boolean;
  in_stock: boolean;
}

export interface ProfileRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: "customer" | "admin";
  created_at: string;
}

export interface AddressRow {
  id: string;
  user_id: string;
  label: string;
  district: string;
  town: string;
  village: string;
  full_address: string;
  is_default: boolean;
}

export interface OrderRow {
  id: string;
  reference: string;
  invoice_number: string;
  invoice_issued_at: string | null;
  user_id: string;
  items: Order["items"];
  subtotal: number;
  delivery_fee: number;
  box_fee: number;
  courier_estimate: number;
  total: number;
  box_recommendation: Order["boxRecommendation"];
  status: Order["status"];
  shipping: Order["shipping"];
  payment: Order["payment"];
  timeline: Order["timeline"];
  customer_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export function productFromRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    propagationType: row.propagation_type as Product["propagationType"],
    size: row.size,
    fruitImage: row.fruit_image,
    plantImage: row.plant_image,
    description: row.description,
    flavorProfile: row.flavor_profile,
    featured: row.featured,
    limitedSupply: row.limited_supply,
    veryRare: row.very_rare,
    certified: row.certified,
    inStock: row.in_stock,
  };
}

export function productToRow(product: Product): ProductRow {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    propagation_type: product.propagationType,
    size: product.size,
    fruit_image: product.fruitImage,
    plant_image: product.plantImage,
    description: product.description,
    flavor_profile: product.flavorProfile,
    featured: product.featured,
    limited_supply: product.limitedSupply ?? false,
    very_rare: product.veryRare ?? false,
    certified: product.certified ?? false,
    in_stock: product.inStock ?? true,
  };
}

export function profileToUser(profile: ProfileRow, addresses: AddressRow[]): User {
  return {
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    phone: profile.phone,
    passwordHash: "",
    role: profile.role,
    createdAt: profile.created_at,
    addresses: addresses.map(addressFromRow),
  };
}

export function addressFromRow(row: AddressRow): Address {
  return {
    id: row.id,
    label: row.label,
    district: row.district,
    town: row.town,
    village: row.village,
    fullAddress: row.full_address,
    isDefault: row.is_default,
  };
}

export function addressToRow(address: Address, userId: string): Omit<AddressRow, "created_at"> {
  return {
    id: address.id,
    user_id: userId,
    label: address.label,
    district: address.district,
    town: address.town,
    village: address.village,
    full_address: address.fullAddress,
    is_default: address.isDefault ?? false,
  };
}

export function orderFromRow(row: OrderRow): Order {
  return {
    id: row.id,
    reference: row.reference,
    invoiceNumber: row.invoice_number,
    invoiceIssuedAt: row.invoice_issued_at ?? undefined,
    userId: row.user_id,
    items: row.items,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    boxFee: Number(row.box_fee),
    courierEstimate: Number(row.courier_estimate),
    total: Number(row.total),
    boxRecommendation: row.box_recommendation,
    status: row.status,
    shipping: row.shipping,
    payment: row.payment,
    customerNotes: row.customer_notes?.trim() || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    timeline: row.timeline,
  };
}

export function orderToRow(order: Order): Omit<OrderRow, "created_at" | "updated_at"> {
  return {
    id: order.id,
    reference: order.reference,
    invoice_number: order.invoiceNumber,
    invoice_issued_at: order.invoiceIssuedAt ?? null,
    user_id: order.userId,
    items: order.items,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    box_fee: order.boxFee,
    courier_estimate: order.courierEstimate,
    total: order.total,
    box_recommendation: order.boxRecommendation,
    status: order.status,
    shipping: order.shipping,
    payment: order.payment,
    timeline: order.timeline,
    customer_notes: order.customerNotes?.trim() || null,
  };
}

export interface DataCache {
  products: Product[];
  users: User[];
  orders: Order[];
  shipping: ShippingSettings | null;
  couriers: Courier[];
  idsRates: IdsRates | null;
  bank: BankDetails | null;
  session: Session | null;
  cart: StoredCart;
}

export function createEmptyCache(): DataCache {
  return {
    products: [],
    users: [],
    orders: [],
    shipping: null,
    couriers: [],
    idsRates: null,
    bank: null,
    session: null,
    cart: { items: [], updatedAt: new Date().toISOString() },
  };
}

export function sessionFromProfile(profile: ProfileRow): Session {
  return {
    userId: profile.id,
    email: profile.email,
    role: profile.role,
  };
}

export type { CartItem, StoredCart };
