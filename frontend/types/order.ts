// Tipos para órdenes
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_transit"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  id: string | number;
  order_id: string | number;
  product_id: string | number;
  quantity: number;
  price: number;
};

export type Order = {
  id: string | number;
  user_id: string | number;
  created_at: string; // ISO date string
  status: OrderStatus;

  items: OrderItem[];
};

export type OrderResponse = {
  id: string | number;
  user_id: string | number;
  created_at: string;
  status: OrderStatus;

  items: OrderItem[];
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "No confirmado",
  confirmed: "Confirmado",
  in_transit: "En tránsito",
  shipped: "Despachado",
  delivered: "Enviado",
  cancelled: "Cancelado",
};

const STATUS_ALIASES: Record<string, OrderStatus> = {
  pending: "pending",
  confirmed: "confirmed",
  in_transit: "in_transit",
  "in transit": "in_transit",
  intransit: "in_transit",
  shipped: "shipped",
  dispatched: "shipped",
  processing: "in_transit",
  packed: "in_transit",
  delivered: "delivered",
  cancelled: "cancelled",
  canceled: "cancelled",
  new: "pending",
};

export function normalizeStatus(status?: string | null): OrderStatus {
  const key = (status ?? "").toString().trim().toLowerCase();
  return STATUS_ALIASES[key] ?? "pending";
}

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-50 border border-yellow-300",
  confirmed: "bg-emerald-50 border border-emerald-300",
  in_transit: "bg-blue-50 border border-blue-300",
  shipped: "bg-purple-50 border border-purple-300",
  delivered: "bg-green-50 border border-green-300",
  cancelled: "bg-red-50 border border-red-300",
};

export const STATUS_BADGE_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  in_transit: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};
