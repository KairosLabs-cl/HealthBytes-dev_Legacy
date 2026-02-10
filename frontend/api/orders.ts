import { OrderResponse } from "@/types/order";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function createOrder(
  items: any[],
  getToken: () => Promise<string | null>
) {
  const token = await getToken();

  console.log("Token obtenido:", token ? "Token presente" : "Token ausente");
  console.log("Token length:", token?.length || 0);

  if (!token) {
    throw new Error(
      "No se pudo obtener el token de autenticación. Por favor, inicia sesión nuevamente."
    );
  }

  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ order: {}, items }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.log("❌ Error del servidor - Status:", res.status);
    console.log(
      "❌ Error del servidor - Response:",
      JSON.stringify(data, null, 2)
    );

    /* Lanzar error específico del backend para mostrar en la UI */
    let errorMsg = `Error ${res.status}`;

    // Intentar extraer mensaje de error del backend
    if (typeof data.detail === "string") {
      errorMsg = data.detail;
    } else if (typeof data.detail === "object" && data.detail?.message) {
      errorMsg = data.detail.message;
    } else if (data.message) {
      errorMsg = data.message;
    } else if (data.error) {
      errorMsg = data.error;
    }

    console.error("❌ Error finalizado:", errorMsg);
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Obtener todas las órdenes del usuario autenticado
 */
export async function getOrders(
  token: string,
  skip: number = 0,
  limit: number = 50
): Promise<OrderResponse[]> {
  if (!token) {
    throw new Error("No se pudo obtener el token de autenticación.");
  }

  const res = await fetch(`${API_URL}/orders?skip=${skip}&limit=${limit}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ Error obteniendo órdenes:", data);
    let errorMsg = `Error ${res.status}`;

    if (typeof data.detail === "string") {
      errorMsg = data.detail;
    } else if (typeof data.detail === "object" && data.detail?.message) {
      errorMsg = data.detail.message;
    } else if (data.message) {
      errorMsg = data.message;
    }

    throw new Error(errorMsg);
  }

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

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ Error obteniendo orden:", data);
    throw new Error(data.detail || "Error al obtener la orden");
  }

  return data;
}
