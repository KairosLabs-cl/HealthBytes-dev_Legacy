import { isThemePreference } from "@/lib/themePreference";
import { usePreferencesStore } from "@/store/preferencesStore";
import { useUser } from "@clerk/clerk-expo";
import { useEffect } from "react";

export function useThemePreferenceSync() {
  const { isLoaded, user } = useUser();
  const setThemePreference = usePreferencesStore(
    (state) => state.setThemePreference
  );

  useEffect(() => {
    if (!isLoaded || !user) return;

    const clerkThemePreference = user.unsafeMetadata?.themePreference;
    if (isThemePreference(clerkThemePreference)) {
      setThemePreference(clerkThemePreference);
    }
  }, [isLoaded, setThemePreference, user]);
}
