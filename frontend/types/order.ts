// Tipos para órdenes
export type OrderStatus =
  | "unpaid"
  | "processing"
  | "shipped"
  | "delivered"
  | "returns"
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
  unpaid: "Sin pagar",
  processing: "En proceso",
  shipped: "Enviado",
  delivered: "Entregado",
  returns: "Revisión de devolución",
  cancelled: "Cancelado",
};

const STATUS_ALIASES: Record<string, OrderStatus> = {
  unpaid: "unpaid",
  pending: "unpaid",
  new: "unpaid",
  processing: "processing",
  confirmed: "processing",
  in_transit: "processing",
  "in transit": "processing",
  intransit: "processing",
  packed: "processing",
  shipped: "shipped",
  dispatched: "shipped",
  delivered: "delivered",
  returns: "returns",
  return: "returns",
  refund: "returns",
  review: "returns",
  dispute: "returns",
  cancelled: "cancelled",
  canceled: "cancelled",
};

export function normalizeStatus(status?: string | null): OrderStatus {
  const key = (status ?? "").toString().trim().toLowerCase();
  return STATUS_ALIASES[key] ?? "pending";
}

export const STATUS_COLORS: Record<OrderStatus, string> = {
  unpaid: "bg-yellow-50 border border-yellow-300",
  processing: "bg-blue-50 border border-blue-300",
  shipped: "bg-purple-50 border border-purple-300",
  delivered: "bg-green-50 border border-green-300",
  returns: "bg-orange-50 border border-orange-300",
  cancelled: "bg-red-50 border border-red-300",
};

export const STATUS_BADGE_COLORS: Record<OrderStatus, string> = {
  unpaid: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  returns: "bg-orange-100 text-orange-800",
  cancelled: "bg-red-100 text-red-800",
};
