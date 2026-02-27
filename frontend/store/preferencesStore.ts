import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PreferencesState {
  dietaryPreferences: string[];
  hasSeenOnboarding: boolean;
  setDietaryPreferences: (tags: string[]) => void;
  togglePreference: (id: string) => void;
  updateDietaryPreferences: (tags: string[]) => Promise<void>;
  markOnboardingComplete: () => void;
  reset: () => void;
}

export const usePreferencesStore = create(
  persist<PreferencesState>(
    (set) => ({
      dietaryPreferences: [],
      hasSeenOnboarding: false,
      setDietaryPreferences: (tags) => set({ dietaryPreferences: tags }),
      togglePreference: (id) => set((state) => ({
        dietaryPreferences: state.dietaryPreferences.includes(id)
          ? state.dietaryPreferences.filter((p) => p !== id)
          : [...state.dietaryPreferences, id]
      })),
      updateDietaryPreferences: async (tags) => {
        set({ dietaryPreferences: tags });
        // Simular llamada a API si fuera necesario
      },
      markOnboardingComplete: () => set({ hasSeenOnboarding: true }),
      reset: () => set({ dietaryPreferences: [], hasSeenOnboarding: false }),
    }),
    {
      name: "preferences-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
