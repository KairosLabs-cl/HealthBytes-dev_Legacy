import { useAuthStore } from "@/store/authStore";
import { throwIfNotOk } from "@/lib/apiError";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    role: string;
    name: string | null;
    address: string | null;
    dietary_preferences: string[];
  };
  token: string;
  refresh_token: string;
}

/**
 * Register a new user
 */
export async function register(data: any): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  await throwIfNotOk(res, "Registration failed");
  return res.json();
}

/**
 * Login existing user
 */
export async function login(data: any): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  await throwIfNotOk(res, "Login failed");
  return res.json();
}

// Silent refresh queue logic
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Helper function to make authenticated API requests with silent refresh support.
 * 
 * Supports two modes:
 * 1. Clerk Mode: Provide a 'getToken' function. Clerk handles refresh internally.
 * 2. Legacy Mode: Uses useAuthStore. Implements silent refresh with rotation.
 */
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
  getToken?: () => Promise<string | null>
) {
  const { accessToken, refreshToken, setTokens, logout } = useAuthStore.getState();

  const makeRequest = async (token: string | null) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };

  // Determine current token
  let currentToken = accessToken;
  if (getToken) {
    currentToken = await getToken();
  }

  let res = await makeRequest(currentToken);

  // If 401 and we have a way to refresh
  if (res.status === 401) {
    // Case 1: Clerk Token (refresh is handled by Clerk's getToken call)
    if (getToken) {
      const newToken = await getToken();
      if (newToken !== currentToken) {
        res = await makeRequest(newToken);
      }
    } 
    // Case 2: Legacy Token (we handle silent refresh via /auth/refresh)
    else if (refreshToken) {
      if (isRefreshing) {
        try {
          const token = await new Promise<string | null>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          res = await makeRequest(token);
        } catch (err) {
          throw err;
        }
      } else {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            setTokens(data.token, data.refresh_token);
            processQueue(null, data.token);
            res = await makeRequest(data.token);
          } else {
            processQueue(new Error("Refresh failed"));
            logout();
            throw new Error("Session expired");
          }
        } catch (error) {
          processQueue(error);
          logout();
          throw error;
        } finally {
          isRefreshing = false;
        }
      }
    } else {
      // No refresh token and not a Clerk call
      logout();
    }
  }

  await throwIfNotOk(res, "API request failed");
  return res.json();
}
