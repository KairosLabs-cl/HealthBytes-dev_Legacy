import { create } from "zustand";
import * as cartApi from "@/api/cart";
import { Alert } from "react-native";

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
  updateQuantity: (productId: string | number, quantity: number) => Promise<void>;
  removeProduct: (productId: string | number) => Promise<void>;
  resetCart: () => Promise<void>;

  // New auth/sync functions
  setAuth: (isAuth: boolean, token: string | null) => void;
  syncWithServer: () => Promise<void>;
  mergeAndSync: () => Promise<void>;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Loading states
  addingProducts: Set<string | number>;
  updatingProducts: Set<string | number>;
  removingProducts: Set<string | number>;
};

export const useCart = create<CartState>((set, get) => ({
  items: [],
  isAuthenticated: false,
  authToken: null,
  error: null,
  addingProducts: new Set(),
  updatingProducts: new Set(),
  removingProducts: new Set(),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

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
      if (__DEV__) console.error('Failed to sync cart from server:', error);
      set({ error: "No se pudo sincronizar el carrito." });
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
      if (__DEV__) console.error('Failed to merge cart:', error);
      set({ error: "No se pudo fusionar el carrito." });
      // Fallback: just sync from server
      await get().syncWithServer();
    }
  },

  /**
   * Add product to cart
   */
  addProduct: async (product: Product) => {
    const { isAuthenticated, authToken, items: previousItems, addingProducts } = get();

    // Prevent multiple simultaneous adds of the same product
    if (addingProducts.has(product.id)) {
      return;
    }

    // Validate stock limit
    if (product.stock !== undefined && product.stock !== null) {
      const existingItem = previousItems.find((item) => item.product.id === product.id);
      const currentQty = existingItem ? existingItem.quantity : 0;
      if (currentQty + 1 > product.stock) {
        set({ error: "No hay suficiente stock disponible" });
        return;
      }
    }

    // Add to adding set
    set((state) => ({
      addingProducts: new Set(state.addingProducts).add(product.id)
    }));

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
        if (__DEV__) console.error('Failed to sync add to server:', error);
        // Rollback: re-fetch actual server state instead of restoring stale snapshot
        await get().syncWithServer();
        set({ error: "No se pudo agregar el producto al carrito. Por favor intenta de nuevo." });
      }
    }

    // Remove from adding set
    set((state) => {
      const newSet = new Set(state.addingProducts);
      newSet.delete(product.id);
      return { addingProducts: newSet };
    });
  },

  /**
   * Update product quantity directly
   */
  updateQuantity: async (productId: string | number, newQuantity: number) => {
    const { isAuthenticated, authToken, items, updatingProducts } = get();

    // Prevent multiple simultaneous updates of the same product
    if (updatingProducts.has(productId)) {
      return;
    }

    // Validate quantity
    if (newQuantity < 1) {
      set({ error: "La cantidad debe ser al menos 1" });
      return;
    }

    // Add to updating set
    set((state) => ({
      updatingProducts: new Set(state.updatingProducts).add(productId)
    }));

    // Update local state first
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ),
    }));

    // Sync with server
    if (isAuthenticated && authToken) {
      try {
        await cartApi.updateCartItem(authToken, Number(productId), newQuantity);
      } catch (error) {
        if (__DEV__) console.error('Failed to sync quantity update to server:', error);
        await get().syncWithServer();
        set({ error: "No se pudo actualizar la cantidad. Por favor intenta de nuevo." });
      }
    }

    // Remove from updating set
    set((state) => {
      const newSet = new Set(state.updatingProducts);
      newSet.delete(productId);
      return { updatingProducts: newSet };
    });
  },

  /**
   * Decrement product quantity
   */
  decrementProduct: async (productId: string | number) => {
    const { isAuthenticated, authToken, items, updatingProducts } = get();

    const existingItem = items.find(
      (item) => item.product.id === productId
    );

    if (!existingItem) return;

    // Prevent multiple simultaneous updates of the same product
    if (updatingProducts.has(productId)) {
      return;
    }

    // Add to updating set
    set((state) => ({
      updatingProducts: new Set(state.updatingProducts).add(productId)
    }));

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
        if (__DEV__) console.error('Failed to sync decrement to server:', error);
        await get().syncWithServer();
        set({ error: "No se pudo actualizar el carrito. Por favor intenta de nuevo." });
      }
    }

    // Remove from updating set
    set((state) => {
      const newSet = new Set(state.updatingProducts);
      newSet.delete(productId);
      return { updatingProducts: newSet };
    });
  },

  /**
   * Remove product from cart
   */
  removeProduct: async (productId: string | number) => {
    const { isAuthenticated, authToken, items: previousItems, removingProducts } = get();

    // Prevent multiple simultaneous removes of the same product
    if (removingProducts.has(productId)) {
      return;
    }

    // Add to removing set
    set((state) => ({
      removingProducts: new Set(state.removingProducts).add(productId)
    }));

    // Update local state first (optimistic update)
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));

    // Sync with server if authenticated
    if (isAuthenticated && authToken) {
      try {
        await cartApi.removeFromCart(authToken, Number(productId));
      } catch (error) {
        if (__DEV__) console.error('Failed to sync remove to server:', error);
        await get().syncWithServer();
        set({ error: "No se pudo eliminar el producto. Por favor intenta de nuevo." });
      }
    }

    // Remove from removing set
    set((state) => {
      const newSet = new Set(state.removingProducts);
      newSet.delete(productId);
      return { removingProducts: newSet };
    });
  },

  /**
   * Reset/clear entire cart
   */
  resetCart: async () => {
    const { isAuthenticated, authToken, items: previousItems } = get();

    // Clear local state
    set({ items: [] });

    // Clear on server
    if (isAuthenticated && authToken) {
      try {
        await cartApi.clearCart(authToken);
      } catch (error) {
        if (__DEV__) console.error('Failed to clear cart on server:', error);
        // Rollback to previous state
        set({ items: previousItems, error: "No se pudo vaciar el carrito. Por favor intenta de nuevo." });
      }
    }
  },
}));

/**
 * Memoized selector for cart item count.
 * Use this instead of inline `state.items.reduce(...)` to avoid
 * unnecessary re-renders when unrelated cart state changes.
 */
export const selectCartItemCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);
