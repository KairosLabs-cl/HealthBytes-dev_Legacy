import { create } from "zustand";
import * as cartApi from "@/api/cart";

type Product = {
  id: string | number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  stock?: number;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isAuthenticated: boolean;
  authToken: string | null;
  
  // Original functions (work locally)
  addProduct: (product: Product) => Promise<void>;
  decrementProduct: (productId: string | number) => Promise<void>;
  removeProduct: (productId: string | number) => Promise<void>;
  resetCart: () => Promise<void>;
  
  // New auth/sync functions
  setAuth: (isAuth: boolean, token: string | null) => void;
  syncWithServer: () => Promise<void>;
  mergeAndSync: () => Promise<void>;
};

export const useCart = create<CartState>((set, get) => ({
  items: [],
  isAuthenticated: false,
  authToken: null,

  /**
   * Set authentication state
   */
  setAuth: (isAuth: boolean, token: string | null) => {
    set({ isAuthenticated: isAuth, authToken: token });
    
    // If logging out, clear cart
    if (!isAuth) {
      set({ items: [] });
    }
  },

  /**
   * Sync cart from server (when authenticated)
   */
  syncWithServer: async () => {
    const { isAuthenticated, authToken } = get();
    
    if (!isAuthenticated || !authToken) {
      return;
    }

    try {
      const cart = await cartApi.getCart(authToken);
      
      // Convert API response to local format
      const items: CartItem[] = cart.items.map((item) => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          description: item.product.description,
          image: item.product.image,
          stock: item.product.stock,
        },
        quantity: item.quantity,
      }));
      
      set({ items });
    } catch (error) {
      console.error('Failed to sync cart from server:', error);
    }
  },

  /**
   * Merge local cart with server and sync (on login)
   */
  mergeAndSync: async () => {
    const { isAuthenticated, authToken, items } = get();
    
    if (!isAuthenticated || !authToken) {
      return;
    }

    try {
      // If there are local items, merge them with server
      if (items.length > 0) {
        const localItems = items.map((item) => ({
          product_id: Number(item.product.id),
          quantity: item.quantity,
        }));
        
        const mergedCart = await cartApi.mergeCart(authToken, localItems);
        
        // Update local state with merged cart
        const mergedItems: CartItem[] = mergedCart.items.map((item) => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            description: item.product.description,
            image: item.product.image,
            stock: item.product.stock,
          },
          quantity: item.quantity,
        }));
        
        set({ items: mergedItems });
      } else {
        // No local items, just sync from server
        await get().syncWithServer();
      }
    } catch (error) {
      console.error('Failed to merge cart:', error);
      // Fallback: just sync from server
      await get().syncWithServer();
    }
  },

  /**
   * Add product to cart
   */
  addProduct: async (product: Product) => {
    const { isAuthenticated, authToken } = get();
    
    // Update local state first (optimistic update)
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
    });

    // Sync with server if authenticated
    if (isAuthenticated && authToken) {
      try {
        await cartApi.addToCart(authToken, Number(product.id), 1);
      } catch (error) {
        console.error('Failed to sync add to server:', error);
        // Local state is already updated, so cart still works
      }
    }
  },

  /**
   * Decrement product quantity
   */
  decrementProduct: async (productId: string | number) => {
    const { isAuthenticated, authToken, items } = get();
    
    const existingItem = items.find(
      (item) => item.product.id === productId
    );

    if (!existingItem) return;

    const newQuantity = existingItem.quantity - 1;

    // Update local state first
    if (newQuantity > 0) {
      set((state) => ({
        items: state.items.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        ),
      }));
    } else {
      set((state) => ({
        items: state.items.filter((item) => item.product.id !== productId),
      }));
    }

    // Sync with server
    if (isAuthenticated && authToken) {
      try {
        if (newQuantity > 0) {
          await cartApi.updateCartItem(authToken, Number(productId), newQuantity);
        } else {
          await cartApi.removeFromCart(authToken, Number(productId));
        }
      } catch (error) {
        console.error('Failed to sync decrement to server:', error);
      }
    }
  },

  /**
   * Remove product from cart
   */
  removeProduct: async (productId: string | number) => {
    const { isAuthenticated, authToken } = get();
    
    // Update local state first
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));

    // Sync with server
    if (isAuthenticated && authToken) {
      try {
        await cartApi.removeFromCart(authToken, Number(productId));
      } catch (error) {
        console.error('Failed to sync remove to server:', error);
      }
    }
  },

  /**
   * Reset/clear entire cart
   */
  resetCart: async () => {
    const { isAuthenticated, authToken } = get();
    
    // Clear local state
    set({ items: [] });

    // Clear on server
    if (isAuthenticated && authToken) {
      try {
        await cartApi.clearCart(authToken);
      } catch (error) {
        console.error('Failed to clear cart on server:', error);
      }
    }
  },
}));
