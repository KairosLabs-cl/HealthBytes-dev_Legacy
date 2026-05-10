import { throwIfNotOk } from "@/lib/apiError";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function updatePushToken(
  token: string,
  expoPushToken: string | null
): Promise<void> {
  if (!token) {
    throw new Error("Se requiere autenticación para actualizar push token.");
  }

  const res = await fetch(`${API_URL}/users/me/push-token`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ token: expoPushToken }),
  });

  await throwIfNotOk(res, "Error actualizando push token");
}
