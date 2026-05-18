import * as ordersApi from "@/api/orders";
import { Order } from "@/types/order";
import { create } from "zustand";

const PAGE_SIZE = 50;

type OrdersState = {
  orders: Order[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  currentStatus: string | null;

  // Methods
  fetchOrders: (
    token: string,
    skip?: number,
    limit?: number,
    status?: string
  ) => Promise<void>;
  loadMoreOrders: (token: string) => Promise<void>;
  fetchOrderById: (
    orderId: string | number,
    token: string
  ) => Promise<Order | null>;
  clearOrders: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
};

export const useOrders = create<OrdersState>((set, get) => ({
  orders: [],
  isLoading: false,
  isLoadingMore: false,
  hasMore: false,
  error: null,
  currentStatus: null,

  /**
   * Obtener primera página de órdenes (resetea la lista)
   */
  fetchOrders: async (
    token: string,
    skip = 0,
    limit = PAGE_SIZE,
    status?: string
  ) => {
    set({ isLoading: true, error: null, currentStatus: status ?? null });
    try {
      const orders = await ordersApi.getOrders(token, skip, limit, status);
      set({
        orders: orders as Order[],
        hasMore: orders.length === PAGE_SIZE,
        isLoading: false,
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Error desconocido al cargar órdenes";
      set({ error: errorMsg, isLoading: false });
    }
  },

  /**
   * Cargar más órdenes (agrega a la lista existente)
   */
  loadMoreOrders: async (token: string) => {
    const { orders, isLoadingMore, currentStatus } = get();
    if (isLoadingMore) return;

    set({ isLoadingMore: true, error: null });
    try {
      const newOrders = await ordersApi.getOrders(
        token,
        orders.length,
        PAGE_SIZE,
        currentStatus ?? undefined
      );
      set({
        orders: [...orders, ...(newOrders as Order[])],
        hasMore: newOrders.length === PAGE_SIZE,
        isLoadingMore: false,
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Error desconocido";
      set({ error: errorMsg, isLoadingMore: false });
    }
  },

  /**
   * Obtener orden específica por ID
   */
  fetchOrderById: async (orderId: string | number, token: string) => {
    try {
      const order = await ordersApi.getOrderById(orderId, token);
      return order as Order;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Error desconocido";
      set({ error: errorMsg });
      return null;
    }
  },

  /**
   * Limpiar órdenes
   */
  clearOrders: () => {
    set({ orders: [], error: null, hasMore: false });
  },

  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
