import { throwIfNotOk } from "@/lib/apiError";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface Review {
  id: number;
  user_id: number;
  product_id: number | null;
  rating: number;
  comment: string | null;
  created_at: string | null;
}

export interface ReviewCreate {
  rating: number;
  comment?: string;
}

export async function getProductReviews(
  productId: number,
  skip = 0,
  limit = 20
): Promise<Review[]> {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });
  const res = await fetch(`${API_URL}/products/${productId}/reviews?${params}`);
  await throwIfNotOk(res, "Error obteniendo reseñas");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createReview(
  productId: number,
  data: ReviewCreate,
  token: string
): Promise<Review> {
  if (!token) {
    throw new Error("Se requiere autenticación para dejar una reseña.");
  }
  const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  await throwIfNotOk(res, "Error creando reseña");
  return res.json();
}
