type Product = {
  id: string | number; // Usa el tipo correcto según tu modelo de producto
  name: string;
  price: number;
};

//Definimos types para el carrito de compras, ya que Zustand no infiere el tipo de estado
type CartItem = {
  product: Product; // Aquí usas Product, no solo name y price
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addProduct: (product: any) => void;
  decrementProduct: (productId: string | number) => void;
  removeProduct: (productId: string | number) => void;
  resetCart: () => void;
};
// ------------------------------------------------------

import { create } from "zustand";

export const useCart = create<CartState>((set) => ({
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
      } else {
        // Si la cantidad es 1, eliminar el producto
        return {
          items: state.items.filter((item) => item.product.id !== productId),
        };
      }
    }),

  removeProduct: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    })),

  resetCart: () => set({ items: [] }),
}));
