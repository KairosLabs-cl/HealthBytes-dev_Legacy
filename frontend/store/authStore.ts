import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Auth store for additional user data not managed by Clerk
// Clerk handles the main authentication state (session, tokens)
// This store is for app-specific user data like preferences, cart association, etc.

interface AuthStoreState {
  // Additional user data not stored in Clerk
  additionalUserData: Record<string, any> | null;
  setAdditionalUserData: (data: Record<string, any> | null) => void;
  clearAdditionalData: () => void;
}

export const useAuthStore = create(
  persist<AuthStoreState>(
    (set) => ({
      additionalUserData: null,
      setAdditionalUserData: (data) => set({ additionalUserData: data }),
      clearAdditionalData: () => set({ additionalUserData: null }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Legacy export for backwards compatibility
// Components that used `useAuth` should migrate to `useAuth` from @clerk/clerk-expo
export const useAuth = useAuthStore;