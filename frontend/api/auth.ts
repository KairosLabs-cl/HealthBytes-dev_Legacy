const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Helper function to make authenticated API requests using Clerk token
export async function fetchWithAuth(
  endpoint: string,
  getToken: () => Promise<string | null>,
  options: RequestInit = {}
) {
  const token = await getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("API Error:", data);
    throw new Error(data.error || data.message || "API request failed");
  }

  return data;
}
