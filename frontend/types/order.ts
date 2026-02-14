// Tipos para órdenes
export type OrderStatus =
  | "pending"
  | "packed"
  | "in_transit"
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
  pending: "Pendiente",
  packed: "Preparando",
  in_transit: "En tránsito",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_ALIASES: Record<string, OrderStatus> = {
  pending: "pending",
  packed: "packed",
  in_transit: "in_transit",
  "in transit": "in_transit",
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
  pending: "bg-yellow-200 border border-yellow-400",
  packed: "bg-blue-50 border border-blue-300",
  in_transit: "bg-purple-200 border border-purple-400",
  delivered: "bg-green-50 border border-green-300",
  cancelled: "bg-red-50 border border-red-300",
};

export const STATUS_BADGE_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-300 text-yellow-900",
  packed: "bg-blue-100 text-blue-800",
  in_transit: "bg-purple-300 text-purple-900",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};
