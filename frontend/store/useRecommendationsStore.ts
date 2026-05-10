import { getRecommendedProducts } from "@/api/products";
import { create } from "zustand";
import { Product } from "@/types/product";

interface RecommendationsState {
  recommendedProducts: Product[];
  isLoading: boolean;
  error: string | null;
  fetchRecommendations: (token?: string | null) => Promise<void>;
}

export const useRecommendationsStore = create<RecommendationsState>((set) => ({
  recommendedProducts: [],
  isLoading: false,
  error: null,
  fetchRecommendations: async (token?: string | null) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getRecommendedProducts(token);
      set({ recommendedProducts: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
}));
