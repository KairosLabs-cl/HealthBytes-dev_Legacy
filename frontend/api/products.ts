const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * List products with optional search and filter parameters
 * @param searchTerm - Optional search term for full-text search
 * @param filter - Optional comma-separated dietary tag names (e.g., "gluten_free,vegan")
 */
export async function listProducts(searchTerm?: string, filter?: string) {
  // Build URL with query parameters
  const params = new URLSearchParams();
  if (searchTerm) params.append("search", searchTerm);
  if (filter) params.append("filter", filter);

  const queryString = params.toString();
  const url = queryString ? `${API_URL}/products?${queryString}` : `${API_URL}/products`;

  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error("Error");
  }
  return data;
}

export async function fetchProductById(id: number) {
  const res = await fetch(`${API_URL}/products/${id}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error("Error");
  }
  return data;
}
