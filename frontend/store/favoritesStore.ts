import { create } from 'zustand';
import { addFavorite, removeFavorite, getFavoriteIds } from '@/api/favorites';

interface FavoritesState {
    favoriteIds: Set<number>;
    isLoading: boolean;

    // Actions
    loadFavorites: (token: string) => Promise<void>;
    toggleFavorite: (productId: number, token: string) => Promise<void>;
    isFavorite: (productId: number) => boolean;
    clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    favoriteIds: new Set<number>(),
    isLoading: false,

    loadFavorites: async (token: string) => {
        try {
            set({ isLoading: true });
            const ids = await getFavoriteIds(token);
            set({ favoriteIds: new Set(ids), isLoading: false });
        } catch (error) {
            console.error('Error loading favorites:', error);
            set({ isLoading: false });
        }
    },

    toggleFavorite: async (productId: number, token: string) => {
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
                await removeFavorite(productId, token);
            } else {
                await addFavorite(productId, token);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            // Rollback on error
            set({ favoriteIds });
        }
    },

    isFavorite: (productId: number) => {
        return get().favoriteIds.has(productId);
    },

    clearFavorites: () => {
        set({ favoriteIds: new Set<number>() });
    }
}));
