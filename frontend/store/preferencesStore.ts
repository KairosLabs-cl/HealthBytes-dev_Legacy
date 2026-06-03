import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PreferencesState {
  dietaryPreferences: string[];
  themePreference: "light" | "dark" | "system";
  hasSeenOnboarding: boolean;
  hasCompletedOnboarding: boolean;
  hasHydrated: boolean;
  setHasHydrated: () => void;
  setDietaryPreferences: (tags: string[]) => void;
  togglePreference: (id: string) => void;
  updateDietaryPreferences: (tags: string[]) => Promise<void>;
  setThemePreference: (theme: "light" | "dark" | "system") => void;
  markOnboardingComplete: () => void;
  setOnboardingComplete: () => void;
  reset: () => void;
}

export const usePreferencesStore = create(
  persist<PreferencesState>(
    (set) => ({
      dietaryPreferences: [],
      themePreference: "system",
      hasSeenOnboarding: false,
      hasCompletedOnboarding: false,
      hasHydrated: false,
      setHasHydrated: () => set({ hasHydrated: true }),
      setDietaryPreferences: (tags) => set({ dietaryPreferences: tags }),
      togglePreference: (id) =>
        set((state) => ({
          dietaryPreferences: state.dietaryPreferences.includes(id)
            ? state.dietaryPreferences.filter((p) => p !== id)
            : [...state.dietaryPreferences, id],
        })),
      updateDietaryPreferences: async (tags) => {
        set({ dietaryPreferences: tags });
        // Simular llamada a API si fuera necesario
      },
      setThemePreference: (theme) => set({ themePreference: theme }),
      markOnboardingComplete: () =>
        set({ hasSeenOnboarding: true, hasCompletedOnboarding: true }),
      setOnboardingComplete: () =>
        set({ hasSeenOnboarding: true, hasCompletedOnboarding: true }),
      reset: () =>
        set({
          dietaryPreferences: [],
          themePreference: "system",
          hasSeenOnboarding: false,
          hasCompletedOnboarding: false,
        }),
    }),
    {
      name: "preferences-store",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated();
      },
    }
  )
);
