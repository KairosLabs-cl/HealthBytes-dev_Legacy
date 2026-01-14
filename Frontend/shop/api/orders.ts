const API_URL = process.env.EXPO_PUBLIC_API_URL;

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
    console.log("Error del servidor:", data);
    console.log("Status:", res.status);
    /* Lanzar error específico del backend para mostrar en la UI */
    throw new Error(data.message || data.error || "Error al procesar la solicitud, Debe iniciar sesión");
  }

  return data;
}
