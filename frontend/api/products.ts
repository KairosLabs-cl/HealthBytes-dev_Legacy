const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function listProducts(searchTerm?: string) {
  if (!API_URL) {
    console.error("❌ EXPO_PUBLIC_API_URL is not defined in .env file");
    throw new Error("Configuration Error: API URL missing");
  }

  // Construye URL con parámetro de búsqueda si se proporciona
  const url = searchTerm 
    ? `${API_URL}/products?search=${encodeURIComponent(searchTerm)}`
    : `${API_URL}/products`;
  
  console.log(`[API] Fetching products from: ${url}`);

  try {
    // Add a timeout to prevent infinite loading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      console.error(`[API] Error ${res.status}: ${errorText}`);
      throw new Error(`API Error: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.error("[API] Network request failed:", error);
    if (error.name === 'AbortError') {
      throw new Error("Connection timeout. Check your network or API URL.");
    }
    throw error;
  }
}

export async function fetchProductById(id: number) {
  if (!API_URL) {
    throw new Error("Configuration Error: API URL missing");
  }

  const url = `${API_URL}/products/${id}`;
  console.log(`[API] Fetching product details: ${url}`);

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`[API] Failed to fetch product ${id}:`, error);
    throw error;
  }
}
