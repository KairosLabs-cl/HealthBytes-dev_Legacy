import * as ordersApi from "@/api/orders";
import { Order } from "@/types/order";
import { create } from "zustand";

type OrdersState = {
  orders: Order[];
  isLoading: boolean;
  error: string | null;

  // Methods
  fetchOrders: (token: string, skip?: number, limit?: number) => Promise<void>;
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
  error: null,

  /**
   * Obtener todas las órdenes del usuario
   */
  fetchOrders: async (token: string, skip = 0, limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const orders = await ordersApi.getOrders(token, skip, limit);
      set({ orders: orders as Order[], isLoading: false });
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Error desconocido al cargar órdenes";
      console.error("❌ Error fetching orders:", errorMsg);
      set({ error: errorMsg, isLoading: false });
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
      console.error(`❌ Error fetching order ${orderId}:`, errorMsg);
      set({ error: errorMsg });
      return null;
    }
  },

  /**
   * Limpiar órdenes
   */
  clearOrders: () => {
    set({ orders: [], error: null });
  },

  /**
   * Establecer error
   */
  setError: (error: string | null) => {
    set({ error });
  },

  /**
   * Limpiar error
   */
  clearError: () => {
    set({ error: null });
  },
}));
