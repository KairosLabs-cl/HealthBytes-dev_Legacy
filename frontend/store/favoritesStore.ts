import { create } from "zustand";
import { addFavorite, removeFavorite, getFavoriteIds } from "@/api/favorites";

interface FavoritesState {
  favoriteIds: Set<number>;
  isLoading: boolean;

  // Actions
  loadFavorites: (getToken?: () => Promise<string | null>) => Promise<void>;
  toggleFavorite: (productId: number, getToken?: () => Promise<string | null>) => Promise<void>;
  isFavorite: (productId: number) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: new Set<number>(),
  isLoading: false,

  loadFavorites: async (getToken) => {
    try {
      set({ isLoading: true });
      const ids = await getFavoriteIds(getToken);
      set({ favoriteIds: new Set(ids), isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (productId: number, getToken) => {
    const { favoriteIds } = get();
    const wasFavorite = favoriteIds.has(productId);

    // Optimistic update - UI changes immediately
    const newIds = new Set(favoriteIds);
    if (wasFavorite) {
      newIds.delete(productId);
    } else {
      newIds.add(productId);
    }
    set({ favoriteIds: newIds });

    // API request in background
    try {
      if (wasFavorite) {
        await removeFavorite(productId, getToken);
      } else {
        await addFavorite(productId, getToken);
      }
    } catch {
      // Rollback on error
      set({ favoriteIds });
    }
  },

  isFavorite: (productId: number) => {
    return get().favoriteIds.has(productId);
  },

  clearFavorites: () => {
    set({ favoriteIds: new Set<number>() });
  },
}));
