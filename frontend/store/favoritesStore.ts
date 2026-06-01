import { create } from "zustand";
import { addFavorite, removeFavorite, getFavoriteIds } from "@/api/favorites";
import { ApiError } from "@/lib/apiError";

const pendingToggles = new Map<number, Promise<void>>();
const toggleVersions = new Map<number, number>();

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
    const shouldBeFavorite = !wasFavorite;
    const version = (toggleVersions.get(productId) ?? 0) + 1;
    toggleVersions.set(productId, version);

    // Optimistic update - UI changes immediately
    const newIds = new Set(favoriteIds);
    if (wasFavorite) {
      newIds.delete(productId);
    } else {
      newIds.add(productId);
    }
    set({ favoriteIds: newIds });

    const previousToggle = pendingToggles.get(productId);
    const runToggle = async () => {
      if (previousToggle) {
        await previousToggle;
      }

      try {
        if (shouldBeFavorite) {
          await addFavorite(productId, getToken);
        } else {
          await removeFavorite(productId, getToken);
        }
      } catch (error) {
        const alreadyConverged =
          error instanceof ApiError &&
          ((shouldBeFavorite && error.status === 409) ||
            (!shouldBeFavorite && error.status === 404));

        if (!alreadyConverged && toggleVersions.get(productId) === version) {
          set((state) => {
            const rolledBackIds = new Set(state.favoriteIds);
            if (shouldBeFavorite) {
              rolledBackIds.delete(productId);
            } else {
              rolledBackIds.add(productId);
            }
            return { favoriteIds: rolledBackIds };
          });
        }
      }
    };

    const currentToggle = runToggle();
    pendingToggles.set(productId, currentToggle);
    await currentToggle;

    if (pendingToggles.get(productId) === currentToggle) {
      pendingToggles.delete(productId);
      toggleVersions.delete(productId);
    }
  },

  isFavorite: (productId: number) => {
    return get().favoriteIds.has(productId);
  },

  clearFavorites: () => {
    set({ favoriteIds: new Set<number>() });
  },
}));
