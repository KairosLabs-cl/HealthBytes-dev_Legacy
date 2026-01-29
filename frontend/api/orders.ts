import Constants from 'expo-constants';
const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

export async function createOrder(items: any[], getToken: () => Promise<string | null>) {
  const token = await getToken();

  console.log("Token obtenido:", token ? "Token presente" : "Token ausente");
  console.log("Token length:", token?.length || 0);

  if (!token) {
    throw new Error("No se pudo obtener el token de autenticación. Por favor, inicia sesión nuevamente.");
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
    console.log("❌ Error del servidor - Response:", JSON.stringify(data, null, 2));
    
    /* Lanzar error específico del backend para mostrar en la UI */
    let errorMsg = `Error ${res.status}`;
    
    // Intentar extraer mensaje de error del backend
    if (typeof data.detail === 'string') {
      errorMsg = data.detail;
    } else if (typeof data.detail === 'object' && data.detail?.message) {
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
