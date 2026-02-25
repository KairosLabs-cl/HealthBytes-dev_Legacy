/**
 * Address Store - Zustand state management for addresses
 */

import * as addressApi from "@/api/addresses";
import type { Address, AddressCreate, AddressUpdate } from "@/types/address";
import { create } from "zustand";

type AddressState = {
  addresses: Address[];
  defaultAddress: Address | null;
  isLoading: boolean;
  error: string | null;

  // CRUD operations
  fetchAddresses: (token: string) => Promise<void>;
  createAddress: (data: AddressCreate, token: string) => Promise<Address>;
  updateAddress: (
    addressId: number,
    data: AddressUpdate,
    token: string
  ) => Promise<Address>;
  deleteAddress: (addressId: number, token: string) => Promise<void>;
  setDefaultAddress: (addressId: number, token: string) => Promise<void>;

  // Helpers
  getDefaultAddress: () => Address | null;
  clearAddresses: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
};

export const useAddress = create<AddressState>((set, get) => ({
  addresses: [],
  defaultAddress: null,
  isLoading: false,
  error: null,

  /**
   * Fetch all addresses from server
   */
  fetchAddresses: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await addressApi.fetchAddresses(token);
      const addresses = response.addresses;
      const defaultAddr = addresses.find((addr) => addr.is_default) || null;
      set({ addresses, defaultAddress: defaultAddr, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error loading addresses";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  /**
   * Create a new address
   */
  createAddress: async (data: AddressCreate, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const newAddress = await addressApi.createAddress(data, token);

      // If this is the first address, it becomes default
      const isFirstAddress = get().addresses.length === 0;
      const defaultAddr = isFirstAddress ? newAddress : get().defaultAddress;

      set((state) => ({
        addresses: [...state.addresses, newAddress],
        defaultAddress: defaultAddr,
        isLoading: false,
      }));

      return newAddress;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error creating address";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  /**
   * Update an existing address
   */
  updateAddress: async (
    addressId: number,
    data: AddressUpdate,
    token: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const updatedAddress = await addressApi.updateAddress(
        addressId,
        data,
        token
      );

      set((state) => {
        const addresses = state.addresses.map((addr) =>
          addr.id === addressId ? updatedAddress : addr
        );
        const defaultAddr = updatedAddress.is_default
          ? updatedAddress
          : state.defaultAddress;

        return {
          addresses,
          defaultAddress: defaultAddr,
          isLoading: false,
        };
      });

      return updatedAddress;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error updating address";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  /**
   * Delete an address
   */
  deleteAddress: async (addressId: number, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await addressApi.deleteAddress(addressId, token);

      set((state) => {
        const addresses = state.addresses.filter(
          (addr) => addr.id !== addressId
        );
        const defaultAddr =
          state.defaultAddress?.id === addressId
            ? addresses.find((addr) => addr.is_default) || null
            : state.defaultAddress;

        return {
          addresses,
          defaultAddress: defaultAddr,
          isLoading: false,
        };
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error deleting address";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  /**
   * Set an address as default
   */
  setDefaultAddress: async (addressId: number, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedAddress = await addressApi.setDefaultAddress(
        addressId,
        token
      );

      set((state) => {
        // Unset all other defaults
        const addresses = state.addresses.map((addr) => ({
          ...addr,
          is_default: addr.id === addressId,
        }));

        return {
          addresses,
          defaultAddress: updatedAddress,
          isLoading: false,
        };
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error setting default address";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  /**
   * Get default address (helper)
   */
  getDefaultAddress: () => {
    return get().defaultAddress;
  },

  /**
   * Clear all addresses (on logout)
   */
  clearAddresses: () => {
    set({ addresses: [], defaultAddress: null, error: null });
  },

  /**
   * Set error message
   */
  setError: (error: string | null) => {
    set({ error });
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));
