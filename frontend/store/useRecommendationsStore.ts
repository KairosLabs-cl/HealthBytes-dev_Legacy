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
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const API_BASE =
        process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_BASE}/products/recommended`, {
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
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
