const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type ProductFilters = {
  search?: string;
  category?: string;
  dietary?: string[];  // Array de etiquetas como ["vegano", "sin-gluten"]
  minPrice?: number;
  maxPrice?: number;
};

// Función mejorada que acepta múltiples filtros
export async function listProducts(filters?: ProductFilters) {
  // Construir query string dinámicamente
  const params = new URLSearchParams();

  if (filters?.search) {
    params.append('search', filters.search);
  }
  if (filters?.category) {
    params.append('category', filters.category);
  }
  if (filters?.dietary && filters.dietary.length > 0) {
    params.append('dietary', filters.dietary.join(','));
  }
  if (filters?.minPrice !== undefined) {
    params.append('min_price', filters.minPrice.toString());
  }
  if (filters?.maxPrice !== undefined) {
    params.append('max_price', filters.maxPrice.toString());
  }

  const url = params.toString()
    ? `${API_URL}/products?${params.toString()}`
    : `${API_URL}/products`;

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
