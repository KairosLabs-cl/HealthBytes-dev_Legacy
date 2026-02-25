import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PreferencesState {
  dietaryPreferences: string[];
  hasSeenOnboarding: boolean;
  setDietaryPreferences: (tags: string[]) => void;
  markOnboardingComplete: () => void;
  reset: () => void;
}

export const usePreferencesStore = create(
  persist<PreferencesState>(
    (set) => ({
      dietaryPreferences: [],
      hasSeenOnboarding: false,
      setDietaryPreferences: (tags) => set({ dietaryPreferences: tags }),
      markOnboardingComplete: () => set({ hasSeenOnboarding: true }),
      reset: () => set({ dietaryPreferences: [], hasSeenOnboarding: false }),
    }),
    {
      name: "preferences-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
