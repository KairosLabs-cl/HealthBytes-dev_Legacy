import { Product } from "@/types/product";
import { fetchWithAuth } from "./auth";

export interface Favorite {
  id: number;
  user_id: string;
  product_id: number;
  product?: Product;
}

export async function addFavorite(productId: number, getToken?: () => Promise<string | null>) {
  return fetchWithAuth("/favorites", {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
  }, getToken);
}

export async function removeFavorite(productId: number, getToken?: () => Promise<string | null>) {
  return fetchWithAuth(`/favorites/${productId}`, {
    method: "DELETE",
  }, getToken);
}

export async function getUserFavorites(getToken?: () => Promise<string | null>) {
  return fetchWithAuth("/favorites", {}, getToken);
}

export async function checkFavorite(productId: number, getToken?: () => Promise<string | null>) {
  return fetchWithAuth(`/favorites/check/${productId}`, {}, getToken);
}

export async function getFavoriteIds(getToken?: () => Promise<string | null>): Promise<number[]> {
  return fetchWithAuth("/favorites/ids", {}, getToken);
}
