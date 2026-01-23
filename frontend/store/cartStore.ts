import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Product Type - Minimal definition for cart
 */
interface Product {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  description?: string;
}

/**
 * Cart Item Type
 */
interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Cart State Interface
 */
interface CartState {
  items: CartItem[];
  addProduct: (product: Product) => void;
  decrementProduct: (productId: string | number) => void;
  removeProduct: (productId: string | number) => void;
  resetCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

/**
 * Cart Store with AsyncStorage persistence
 */
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addProduct: (product) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { product, quantity: 1 }],
          };
        }),

      decrementProduct: (productId) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === productId
          );
          if (existingItem && existingItem.quantity > 1) {
            return {
              items: state.items.map((item) =>
                item.product.id === productId
                  ? { ...item, quantity: item.quantity - 1 }
                  : item
              ),
            };
          }
          // Si la cantidad es 1, eliminar el producto
          return {
            items: state.items.filter((item) => item.product.id !== productId),
          };
        }),

      removeProduct: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),

      resetCart: () => set({ items: [] }),

      getTotalPrice: () => {
        const state = get();
        return state.items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Selector hooks for better performance
export const useCartItems = () => useCart((state) => state.items);
export const useCartTotal = () => useCart((state) => state.getTotalPrice());
export const useCartItemCount = () => useCart((state) => state.getTotalItems());
