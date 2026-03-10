import { create } from "zustand";

export type DietaryTag =
  | "sin-gluten"
  | "vegano"
  | "sin-lactosa"
  | "bajo-en-azucar"
  | "alto-en-proteina"
  | "para-diabeticos";

interface ProductFiltersState {
  category?: string;
  dietaryTags: DietaryTag[];
  minPrice?: number;
  maxPrice?: number;

  // Actions
  setCategory: (category: string | undefined) => void;
  toggleDietaryTag: (tag: DietaryTag) => void;
  setDietaryTags: (tags: DietaryTag[]) => void;
  setPriceRange: (min?: number, max?: number) => void;
  clearFilters: () => void;
}

export const useProductFilters = create<ProductFiltersState>((set) => ({
  category: undefined,
  dietaryTags: [],
  minPrice: undefined,
  maxPrice: undefined,

  setCategory: (category) => set({ category }),

  toggleDietaryTag: (tag) =>
    set((state) => ({
      dietaryTags: state.dietaryTags.includes(tag)
        ? state.dietaryTags.filter((t) => t !== tag)
        : [...state.dietaryTags, tag],
    })),

  setDietaryTags: (tags) => set({ dietaryTags: tags }),

  setPriceRange: (min, max) => set({ minPrice: min, maxPrice: max }),

  clearFilters: () =>
    set({
      category: undefined,
      dietaryTags: [],
      minPrice: undefined,
      maxPrice: undefined,
    }),
}));
