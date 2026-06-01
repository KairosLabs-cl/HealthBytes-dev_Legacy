import { useFavoritesStore } from "../favoritesStore";
import * as favoritesApi from "@/api/favorites";
import { ApiError } from "@/lib/apiError";

jest.mock("@/api/favorites", () => ({
  getFavoriteIds: jest.fn(),
  addFavorite: jest.fn(),
  removeFavorite: jest.fn(),
}));

const TOKEN = "test-token";
const getToken = jest.fn(async () => TOKEN);

describe("Favorites Store", () => {
  const initialState = useFavoritesStore.getState();

  beforeEach(() => {
    useFavoritesStore.setState({
      ...initialState,
      favoriteIds: new Set<number>(),
      isLoading: false,
    });
    jest.clearAllMocks();
  });

  describe("loadFavorites", () => {
    test("loads favorite IDs from API", async () => {
      (favoritesApi.getFavoriteIds as jest.Mock).mockResolvedValue([1, 5, 10]);

      await useFavoritesStore.getState().loadFavorites(getToken);

      const ids = useFavoritesStore.getState().favoriteIds;
      expect(ids.has(1)).toBe(true);
      expect(ids.has(5)).toBe(true);
      expect(ids.has(10)).toBe(true);
      expect(ids.size).toBe(3);
      expect(useFavoritesStore.getState().isLoading).toBe(false);
    });

    test("handles error gracefully", async () => {
      (favoritesApi.getFavoriteIds as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await useFavoritesStore.getState().loadFavorites(getToken);

      expect(useFavoritesStore.getState().favoriteIds.size).toBe(0);
      expect(useFavoritesStore.getState().isLoading).toBe(false);
    });
  });

  describe("toggleFavorite", () => {
    test("adds favorite optimistically", async () => {
      (favoritesApi.addFavorite as jest.Mock).mockResolvedValue({});

      await useFavoritesStore.getState().toggleFavorite(5, getToken);

      expect(useFavoritesStore.getState().favoriteIds.has(5)).toBe(true);
      expect(favoritesApi.addFavorite).toHaveBeenCalledWith(5, getToken);
    });

    test("removes favorite optimistically", async () => {
      useFavoritesStore.setState({ favoriteIds: new Set([5, 10]) });
      (favoritesApi.removeFavorite as jest.Mock).mockResolvedValue(undefined);

      await useFavoritesStore.getState().toggleFavorite(5, getToken);

      expect(useFavoritesStore.getState().favoriteIds.has(5)).toBe(false);
      expect(useFavoritesStore.getState().favoriteIds.has(10)).toBe(true);
      expect(favoritesApi.removeFavorite).toHaveBeenCalledWith(5, getToken);
    });

    test("rolls back on add failure", async () => {
      (favoritesApi.addFavorite as jest.Mock).mockRejectedValue(
        new Error("API Error")
      );

      await useFavoritesStore.getState().toggleFavorite(5, getToken);

      expect(useFavoritesStore.getState().favoriteIds.has(5)).toBe(false);
    });

    test("rolls back on remove failure", async () => {
      useFavoritesStore.setState({ favoriteIds: new Set([5]) });
      (favoritesApi.removeFavorite as jest.Mock).mockRejectedValue(
        new Error("API Error")
      );

      await useFavoritesStore.getState().toggleFavorite(5, getToken);

      expect(useFavoritesStore.getState().favoriteIds.has(5)).toBe(true);
    });

    test("serializes add then remove for rapid presses on the same product", async () => {
      let resolveAdd: (() => void) | undefined;
      (favoritesApi.addFavorite as jest.Mock).mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveAdd = resolve;
          })
      );
      (favoritesApi.removeFavorite as jest.Mock).mockResolvedValue(undefined);

      const add = useFavoritesStore.getState().toggleFavorite(5, getToken);
      const remove = useFavoritesStore.getState().toggleFavorite(5, getToken);

      expect(useFavoritesStore.getState().favoriteIds.has(5)).toBe(false);
      expect(favoritesApi.addFavorite).toHaveBeenCalledTimes(1);
      expect(favoritesApi.removeFavorite).not.toHaveBeenCalled();

      resolveAdd?.();
      await Promise.all([add, remove]);

      expect(favoritesApi.removeFavorite).toHaveBeenCalledWith(5, getToken);
      expect(useFavoritesStore.getState().favoriteIds.has(5)).toBe(false);
    });

    test("serializes remove then add for rapid presses on the same product", async () => {
      let resolveRemove: (() => void) | undefined;
      useFavoritesStore.setState({ favoriteIds: new Set([5]) });
      (favoritesApi.removeFavorite as jest.Mock).mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveRemove = resolve;
          })
      );
      (favoritesApi.addFavorite as jest.Mock).mockResolvedValue({});

      const remove = useFavoritesStore.getState().toggleFavorite(5, getToken);
      const add = useFavoritesStore.getState().toggleFavorite(5, getToken);

      expect(useFavoritesStore.getState().favoriteIds.has(5)).toBe(true);
      expect(favoritesApi.removeFavorite).toHaveBeenCalledTimes(1);
      expect(favoritesApi.addFavorite).not.toHaveBeenCalled();

      resolveRemove?.();
      await Promise.all([remove, add]);

      expect(favoritesApi.addFavorite).toHaveBeenCalledWith(5, getToken);
      expect(useFavoritesStore.getState().favoriteIds.has(5)).toBe(true);
    });

    test("does not apply a stale rollback after later rapid presses", async () => {
      let rejectFirstAdd: ((error: Error) => void) | undefined;
      (favoritesApi.addFavorite as jest.Mock)
        .mockImplementationOnce(
          () =>
            new Promise<void>((_, reject) => {
              rejectFirstAdd = reject;
            })
        )
        .mockResolvedValueOnce({});
      (favoritesApi.removeFavorite as jest.Mock).mockResolvedValue(undefined);

      const firstAdd = useFavoritesStore.getState().toggleFavorite(5, getToken);
      const remove = useFavoritesStore.getState().toggleFavorite(5, getToken);
      const finalAdd = useFavoritesStore.getState().toggleFavorite(5, getToken);

      expect(useFavoritesStore.getState().favoriteIds.has(5)).toBe(true);
      rejectFirstAdd?.(new Error("Network error"));
      await Promise.all([firstAdd, remove, finalAdd]);

      expect(favoritesApi.removeFavorite).toHaveBeenCalledWith(5, getToken);
      expect(favoritesApi.addFavorite).toHaveBeenCalledTimes(2);
      expect(useFavoritesStore.getState().favoriteIds.has(5)).toBe(true);
    });

    test("treats duplicate POST 409 as converged favorite state", async () => {
      (favoritesApi.addFavorite as jest.Mock).mockRejectedValue(
        new ApiError(409, "Favorite already exists")
      );

      await useFavoritesStore.getState().toggleFavorite(5, getToken);

      expect(useFavoritesStore.getState().favoriteIds.has(5)).toBe(true);
    });

    test("treats absent DELETE 404 as converged non-favorite state", async () => {
      useFavoritesStore.setState({ favoriteIds: new Set([5]) });
      (favoritesApi.removeFavorite as jest.Mock).mockRejectedValue(
        new ApiError(404, "Favorite not found")
      );

      await useFavoritesStore.getState().toggleFavorite(5, getToken);

      expect(useFavoritesStore.getState().favoriteIds.has(5)).toBe(false);
    });
  });

  describe("isFavorite", () => {
    test("returns true for favorited product", () => {
      useFavoritesStore.setState({ favoriteIds: new Set([5]) });
      expect(useFavoritesStore.getState().isFavorite(5)).toBe(true);
    });

    test("returns false for non-favorited product", () => {
      expect(useFavoritesStore.getState().isFavorite(99)).toBe(false);
    });
  });

  describe("clearFavorites", () => {
    test("clears all favorites", () => {
      useFavoritesStore.setState({ favoriteIds: new Set([1, 2, 3]) });
      useFavoritesStore.getState().clearFavorites();
      expect(useFavoritesStore.getState().favoriteIds.size).toBe(0);
    });
  });
});
