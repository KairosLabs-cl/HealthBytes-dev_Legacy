/**
 * Centralized auth header builder for all API requests.
 * Ensures consistent Bearer token format across all modules.
 */
export function getAuthHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
