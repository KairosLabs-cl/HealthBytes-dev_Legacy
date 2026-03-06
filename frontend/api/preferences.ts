/**
 * Dietary preferences API client
 */

import { throwIfNotOk } from "@/lib/apiError";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Update the authenticated user's dietary preferences
 */
export async function updateDietaryPreferences(
  tags: string[],
  token: string
): Promise<void> {
  const res = await fetch(`${API_URL}/users/me/dietary-preferences`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tags }),
  });

  await throwIfNotOk(res, "Error al guardar preferencias dietarias");
}
