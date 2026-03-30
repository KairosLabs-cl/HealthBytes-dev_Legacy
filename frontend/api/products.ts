import { throwIfNotOk } from "@/lib/apiError";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type ProductFilters = {
  search?: string;
  category?: string;
  dietary?: string[]; // Array de etiquetas como ["vegano", "sin-gluten"]
  minPrice?: number;
  maxPrice?: number;
};

// Función mejorada que acepta múltiples filtros
export async function listProducts(filters?: ProductFilters) {
  // Construir query string dinámicamente
  const params = new URLSearchParams();

  if (filters?.search) {
    params.append("search", filters.search);
  }
  if (filters?.category) {
    params.append("category", filters.category);
  }
  if (filters?.dietary && filters.dietary.length > 0) {
    params.append("dietary", filters.dietary.join(","));
  }
  if (filters?.minPrice !== undefined) {
    params.append("min_price", filters.minPrice.toString());
  }
  if (filters?.maxPrice !== undefined) {
    params.append("max_price", filters.maxPrice.toString());
  }

  const url = params.toString()
    ? `${API_URL}/products?${params.toString()}`
    : `${API_URL}/products`;

  const res = await fetch(url);
  await throwIfNotOk(res, "Error fetching products");
  return res.json();
}

export async function getFeaturedProduct() {
  const res = await fetch(`${API_URL}/products/featured`);
  await throwIfNotOk(res, "Error fetching featured product");
  return res.json();
}

export async function fetchProductById(id: number) {
  const res = await fetch(`${API_URL}/products/${id}`);
  await throwIfNotOk(res, "Error fetching product");
  return res.json();
}

export type ProductRating = {
  avg_rating: number;
  review_count: number;
};

export type Review = {
  id: number;
  user_id: number;
  product_id?: number;
  vendor_id?: number;
  rating: number;
  comment?: string;
  created_at: string;
  user_name?: string;
};

export async function getProductRating(productId: number): Promise<ProductRating> {
  const res = await fetch(`${API_URL}/products/${productId}/rating`);
  await throwIfNotOk(res, 'Error fetching rating');
  return res.json();
}

export async function getProductReviews(productId: number, skip = 0, limit = 20): Promise<Review[]> {
  const res = await fetch(`${API_URL}/products/${productId}/reviews?skip=${skip}&limit=${limit}`);
  await throwIfNotOk(res, 'Error fetching reviews');
  return res.json();
}
