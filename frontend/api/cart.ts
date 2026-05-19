import { fetchWithAuth } from "./auth";
import { throwIfNotOk } from "@/lib/apiError";

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  product: {
    id: number;
    name: string;
    description?: string;
    image?: string;
    price: number;
    stock: number;
  };
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface CartItemCreate {
  product_id: number;
  quantity: number;
}

/**
 * Get current user's cart
 */
export async function getCart(getToken?: () => Promise<string | null>): Promise<Cart> {
  return fetchWithAuth("/cart", {}, getToken);
}

/**
 * Add item to cart (or increment if exists)
 */
export async function addToCart(
  productId: number,
  quantity: number = 1,
  getToken?: () => Promise<string | null>
): Promise<CartItem> {
  return fetchWithAuth("/cart/items", {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      quantity,
    }),
  }, getToken);
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  productId: number,
  quantity: number,
  getToken?: () => Promise<string | null>
): Promise<CartItem> {
  return fetchWithAuth(`/cart/items/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  }, getToken);
}

/**
 * Remove item from cart
 */
export async function removeFromCart(
  productId: number,
  getToken?: () => Promise<string | null>
): Promise<void> {
  return fetchWithAuth(`/cart/items/${productId}`, {
    method: "DELETE",
  }, getToken);
}

/**
 * Clear entire cart
 */
export async function clearCart(getToken?: () => Promise<string | null>): Promise<void> {
  return fetchWithAuth("/cart", {
    method: "DELETE",
  }, getToken);
}

/**
 * Merge local cart with server cart (on login)
 */
export async function mergeCart(
  localItems: CartItemCreate[],
  getToken?: () => Promise<string | null>
): Promise<Cart> {
  return fetchWithAuth("/cart/merge", {
    method: "POST",
    body: JSON.stringify({ items: localItems }),
  }, getToken);
}
