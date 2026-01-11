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

// Legacy login/signup functions - Keep for reference but these are now replaced by Clerk
// You can remove these once migration is complete

export async function login(email: string, password: string) {
  console.warn("Deprecated: Use Clerk's useSignIn hook instead");
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.log(data);
    throw Error("Failed to login");
  }
  return data;
}

export async function signup(email: string, password: string) {
  console.warn("Deprecated: Use Clerk's useSignUp hook instead");
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw Error("Failed to signup");
  }
  return data;
}
