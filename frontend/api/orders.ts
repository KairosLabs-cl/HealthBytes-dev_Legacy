import { throwIfNotOk } from "@/lib/apiError";
import { OrderResponse } from "@/types/order";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface OrderItemPayload {
  productId: number;
  quantity: number;
  price: number;
}

interface CreateOrderPayload {
  order: {
    address_id?: number | string;
    payment_method?: string;
  };
  items: OrderItemPayload[];
}

export async function createOrder(
  items: OrderItemPayload[],
  addressId?: number | string,
  paymentMethod?: string,
  getToken?: () => Promise<string | null>
) {
  const token = await getToken?.();

  if (__DEV__) {
    console.log("Token obtenido:", token ? "Token presente" : "Token ausente");
    console.log("Token length:", token?.length || 0);
  }

  if (!token) {
    throw new Error(
      "No se pudo obtener el token de autenticación. Por favor, inicia sesión nuevamente."
    );
  }

  const orderPayload: CreateOrderPayload = {
    order: {
      ...(addressId && { address_id: addressId }),
      ...(typeof paymentMethod === "string" && {
        payment_method: paymentMethod,
      }),
    },
    items,
  };

  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderPayload),
  });

  await throwIfNotOk(res, "Error creando la orden");

  return res.json();
}

/**
 * Obtener todas las órdenes del usuario autenticado
 */
export async function getOrders(
  token: string,
  skip: number = 0,
  limit: number = 50,
  status?: string
): Promise<OrderResponse[]> {
  if (!token) {
    throw new Error("No se pudo obtener el token de autenticación.");
  }

  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });
  if (status) params.append("status", status);

  const res = await fetch(`${API_URL}/orders?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  await throwIfNotOk(res, "Error obteniendo órdenes");

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Obtener una orden específica por ID
 */
export async function getOrderById(
  orderId: string | number,
  token: string
): Promise<OrderResponse> {
  if (!token) {
    throw new Error("No se pudo obtener el token de autenticación.");
  }

  const res = await fetch(`${API_URL}/orders/${orderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  await throwIfNotOk(res, "Error al obtener la orden");

  return res.json();
}
