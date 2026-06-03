import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppThemeProvider } from "@/components/AppThemeProvider";
import { Icon } from "@/components/ui/icon";
import CartFlyOverlay from "@/components/CartFlyOverlay";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import "@/global.css";
import { tokenCache } from "@/lib/cache";
import { useAppFonts } from "@/lib/fonts";
import { useAuthStore } from "@/store/authStore";
import { useCart } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, Stack } from "expo-router";
import { User } from "lucide-react-native";
import { Suspense, lazy, useEffect } from "react";
import { Pressable } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Sentry from "@sentry/react-native";
import { useShallow } from "zustand/react/shallow";

// Lazy-load OnboardingModal — it's only shown once per device and adds unnecessary
// bundle weight to every app cold start. Loading it lazily defers the JS parsing
// until the first time it's actually needed.
const OnboardingModal = lazy(() => import("@/components/OnboardingModal"));

// Initialize Sentry if DSN is configured
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: __DEV__ ? "development" : "production",
    debug: __DEV__,
    tracesSampleRate: __DEV__ ? 0 : 0.1,
  });
}

// Constants removed

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30000),
    },
  },
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing Clerk Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file."
  );
}

function RootLayoutNav() {
  const { mergeAndSync, clearLocalCart, error, clearError } = useCart(
    useShallow((state) => ({
      mergeAndSync: state.mergeAndSync,
      clearLocalCart: state.clearLocalCart,
      error: state.error,
      clearError: state.clearError,
    }))
  );
  const toast = useToast();

  const { isSignedIn, getToken } = useAuth();

  usePushNotifications();

  // Onboarding
  // ⚡ Bolt: Using granular Zustand selectors instead of destructuring the whole store
  // prevents full layout re-renders when unrelated preferences change
  const { hasCompletedOnboarding, setOnboardingComplete } = usePreferencesStore(
    useShallow((state) => ({
      hasCompletedOnboarding: state.hasCompletedOnboarding,
      setOnboardingComplete: state.setOnboardingComplete,
    }))
  );

  const handleOnboardingComplete = () => {
    setOnboardingComplete();
  };

  // Handle cart errors
  useEffect(() => {
    if (error) {
      toast.show({
        placement: "top",
        duration: 3000,
        render: ({ id }) => {
          const toastId = "toast-" + id;
          return (
            <Toast nativeID={toastId} action="error" variant="accent">
              <ToastTitle>Error</ToastTitle>
              <ToastDescription>{error}</ToastDescription>
            </Toast>
          );
        },
      });
      clearError();
    }
  }, [error, clearError, toast]);

  // Sync cart and favorites with authentication state
  const { loadFavorites, clearFavorites } = useFavoritesStore(
    useShallow((state) => ({
      loadFavorites: state.loadFavorites,
      clearFavorites: state.clearFavorites,
    }))
  );

  useEffect(() => {
    let cancelled = false;

    const syncUserData = async () => {
      if (isSignedIn) {
        // User logged in via Clerk
        const token = await getToken();
        if (token && !cancelled) {
          // Sync Clerk token with our unified AuthStore
          useAuthStore.getState().setTokens(token, ""); // No refresh token for Clerk
          
          // Merge local cart with server cart
          await mergeAndSync(getToken);
          // Load user favorites
          await loadFavorites(getToken);
        }
      } else {
        // User logged out
        useAuthStore.getState().logout();
        clearLocalCart();
        clearFavorites();
      }
    };

    syncUserData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(auth)/login"
          options={{
            title: "Mi cuenta",
            headerTitleAlign: "center",
            headerLeft: () =>
              !isSignedIn && (
                <Link href={"/(auth)/login"} asChild>
                  <Pressable
                    className="flex-row gap-2"
                    style={{ marginLeft: 50 }}
                  >
                    <Icon as={User} />
                  </Pressable>
                </Link>
              ),
          }}
        />
        <Stack.Screen name="product/[id]" options={{ title: "Product" }} />
        <Stack.Screen
          name="checkout-v2"
          options={{
            title: "",
            headerTitleAlign: "center",
          }}
        />
      </Stack>

      <CartFlyOverlay />

      <Suspense fallback={null}>
        <OnboardingModal
          visible={!!(isSignedIn && !hasCompletedOnboarding)}
          onComplete={handleOnboardingComplete}
        />
      </Suspense>
    </>
  );
}

export default Sentry.wrap(function RootLayout() {
  // Load fonts in background - don't block UI
  useAppFonts();

  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ClerkLoaded>
          <QueryClientProvider client={queryClient}>
            <AppThemeProvider>
              <ErrorBoundary>
                <RootLayoutNav />
              </ErrorBoundary>
            </AppThemeProvider>
          </QueryClientProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </SafeAreaProvider>
  );
});
