import { useAuth } from '@clerk/clerk-expo';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
  timeout?: number;
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API Client with authentication and error handling
 * 
 * Usage:
 * const client = createApiClient();
 * const data = await client.get('/products');
 */
export function createApiClient() {
  const { getToken } = useAuth();

  /**
   * Make an authenticated API request
   */
  async function request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      requiresAuth = false,
      timeout = 10000,
      headers: customHeaders = {},
      ...otherConfig
    } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(customHeaders as Record<string, string>),
      };

      // Add auth token if required
      if (requiresAuth) {
        const token = await getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          throw new ApiError('No authentication token available', 401);
        }
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...otherConfig,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      if (!response.ok) {
        const errorData = isJson ? await response.json() : await response.text();
        throw new ApiError(
          errorData?.message || errorData || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      // Return parsed JSON or empty object
      return isJson ? await response.json() : ({} as T);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408);
        }
        throw new ApiError(error.message, 500);
      }

      throw new ApiError('Unknown error occurred', 500);
    }
  }

  return {
    get: <T>(endpoint: string, config?: RequestConfig) =>
      request<T>(endpoint, { ...config, method: 'GET' }),

    post: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
      request<T>(endpoint, {
        ...config,
        method: 'POST',
        body: JSON.stringify(data),
      }),

    put: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
      request<T>(endpoint, {
        ...config,
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: <T>(endpoint: string, config?: RequestConfig) =>
      request<T>(endpoint, { ...config, method: 'DELETE' }),
  };
}

/**
 * Hook for using API client
 * Must be used inside a Clerk-wrapped component
 */
export function useApiClient() {
  return createApiClient();
}
