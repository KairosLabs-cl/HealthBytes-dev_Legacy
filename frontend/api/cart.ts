import { getAuthHeader } from '@/lib/authHeaders';
import { throwIfNotOk } from '@/lib/apiError';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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
export async function getCart(token: string): Promise<Cart> {
  const res = await fetch(`${API_URL}/cart`, {
    headers: {
      ...getAuthHeader(token),
    },
  });

  await throwIfNotOk(res, 'Failed to fetch cart');
  return res.json();
}

/**
 * Add item to cart (or increment if exists)
 */
export async function addToCart(
  token: string,
  productId: number,
  quantity: number = 1
): Promise<CartItem> {
  const res = await fetch(`${API_URL}/cart/items`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: productId,
      quantity,
    }),
  });

  await throwIfNotOk(res, 'Failed to add item to cart');
  return res.json();
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  token: string,
  productId: number,
  quantity: number
): Promise<CartItem> {
  const res = await fetch(`${API_URL}/cart/items/${productId}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity }),
  });

  await throwIfNotOk(res, 'Failed to update cart item');
  return res.json();
}

/**
 * Remove item from cart
 */
export async function removeFromCart(
  token: string,
  productId: number
): Promise<void> {
  const res = await fetch(`${API_URL}/cart/items/${productId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(token),
    },
  });

  await throwIfNotOk(res, 'Failed to remove item from cart');
}

/**
 * Clear entire cart
 */
export async function clearCart(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/cart`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(token),
    },
  });

  await throwIfNotOk(res, 'Failed to clear cart');
}

/**
 * Merge local cart with server cart (on login)
 */
export async function mergeCart(
  token: string,
  localItems: CartItemCreate[]
): Promise<Cart> {
  const res = await fetch(`${API_URL}/cart/merge`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: localItems }),
  });

  await throwIfNotOk(res, 'Failed to merge cart');
  return res.json();
}
