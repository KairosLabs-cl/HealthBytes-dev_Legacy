/**
 * Mercado Pago API Client
 * Handles payment preference creation and status checking
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface CreatePreferenceRequest {
  order_id: number;
  description?: string;
  payer_email?: string;
}

export interface CreatePreferenceResponse {
  payment_id: number;
  preference_id: string;
  init_point: string; // URL where user goes to pay
  sandbox_init_point?: string; // For sandbox testing
}

export interface PaymentStatusResponse {
  payment_id: string;
  status:
    | "pending"
    | "approved"
    | "in_process"
    | "rejected"
    | "cancelled"
    | "refunded";
  status_detail?: string;
  external_reference?: string;
}

/**
 * Create a Mercado Pago payment preference
 * This generates a checkout URL that the frontend redirects to
 *
 * @param request - Order ID and payer info
 * @param getToken - Function to get Clerk auth token
 * @returns Preference with init_point URL
 */
export async function createMercadoPagoPreference(
  request: CreatePreferenceRequest,
  getToken: () => Promise<string | null>
): Promise<CreatePreferenceResponse> {
  const token = await getToken();

  if (!token) {
    throw new Error("No authentication token available");
  }

  const res = await fetch(
    `${API_URL}/api/v1/payments/mercadopago/create-preference`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    let errorMsg = `Error ${res.status}`;

    if (typeof data.detail === "string") {
      errorMsg = data.detail;
    } else if (typeof data.detail === "object" && data.detail?.message) {
      errorMsg = data.detail.message;
    } else if (data.message) {
      errorMsg = data.message;
    }

    if (__DEV__) {
      console.error("Error creating MP preference:", errorMsg);
    }
    throw new Error(errorMsg);
  }

  if (__DEV__) {
    console.log("MP preference created:", data.preference_id);
  }
  return data;
}

/**
 * Get payment status from Mercado Pago
 * Useful for polling to check if payment was completed
 *
 * @param paymentId - Mercado Pago payment ID
 * @param getToken - Function to get Clerk auth token
 * @returns Payment status
 */
export async function getMercadoPagoPaymentStatus(
  paymentId: string,
  getToken: () => Promise<string | null>
): Promise<PaymentStatusResponse> {
  const token = await getToken();

  if (!token) {
    throw new Error("No authentication token available");
  }

  const res = await fetch(
    `${API_URL}/api/v1/payments/mercadopago/payment/${paymentId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || `Failed to get payment status`);
  }

  if (__DEV__) {
    console.log("Payment status:", data.status);
  }
  return data;
}
