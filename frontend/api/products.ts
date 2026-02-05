const API_URL = process.env.EXPO_PUBLIC_API_URL;

// se agrego parametro opcional searchTerm para filtrar productos
export async function listProducts(searchTerm?: string) {
  // Construye URL con parámetro de búsqueda si se proporciona
  const url = searchTerm
    ? `${API_URL}/products?search=${encodeURIComponent(searchTerm)}`
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
