/**
 * Address API client
 * Handles all HTTP requests for address management
 */

import type {
  Address,
  AddressCreate,
  AddressListResponse,
  AddressUpdate,
} from "@/types/address";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Fetch all addresses for authenticated user
 */
export async function fetchAddresses(
  token: string
): Promise<AddressListResponse> {
  const res = await fetch(`${API_URL}/addresses`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail?.message || "Error fetching addresses");
  }

  return res.json();
}

/**
 * Fetch a single address by ID
 */
export async function fetchAddressById(
  addressId: number,
  token: string
): Promise<Address> {
  const res = await fetch(`${API_URL}/addresses/${addressId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail?.message || "Error fetching address");
  }

  return res.json();
}

/**
 * Create a new address
 */
export async function createAddress(
  data: AddressCreate,
  token: string
): Promise<Address> {
  const res = await fetch(`${API_URL}/addresses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail?.message || "Error creating address");
  }

  return res.json();
}

/**
 * Update an existing address
 */
export async function updateAddress(
  addressId: number,
  data: AddressUpdate,
  token: string
): Promise<Address> {
  const res = await fetch(`${API_URL}/addresses/${addressId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail?.message || "Error updating address");
  }

  return res.json();
}

/**
 * Delete an address (soft delete)
 */
export async function deleteAddress(
  addressId: number,
  token: string
): Promise<void> {
  const res = await fetch(`${API_URL}/addresses/${addressId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail?.message || "Error deleting address");
  }
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(
  addressId: number,
  token: string
): Promise<Address> {
  const res = await fetch(`${API_URL}/addresses/${addressId}/set-default`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail?.message || "Error setting default address");
  }

  return res.json();
}
