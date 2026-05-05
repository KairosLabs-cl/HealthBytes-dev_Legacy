import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Icon } from "@/components/ui/icon";
import BottomNavBar from "@/components/ui/NavBar/BottomNavBar";
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
import { useCart } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import OnboardingModal from "@/components/OnboardingModal";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, Stack, useSegments } from "expo-router";
import { User } from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Sentry from "@sentry/react-native";

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
  const setAuth = useCart((state) => state.setAuth);
  const mergeAndSync = useCart((state) => state.mergeAndSync);
  const error = useCart((state) => state.error);
  const clearError = useCart((state) => state.clearError);
  const toast = useToast();

  const { isSignedIn, getToken } = useAuth();

  usePushNotifications();

  // Onboarding
  // ⚡ Bolt: Using granular Zustand selectors instead of destructuring the whole store
  // prevents full layout re-renders when unrelated preferences change
  const hasCompletedOnboarding = usePreferencesStore((state) => state.hasCompletedOnboarding);
  const setOnboardingComplete = usePreferencesStore((state) => state.setOnboardingComplete);

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
  const loadFavorites = useFavoritesStore((state) => state.loadFavorites);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);

  useEffect(() => {
    const syncCart = async () => {
      if (isSignedIn) {
        // User logged in
        const token = await getToken();
        if (token) {
          setAuth(true, token);
          // Merge local cart with server cart
          await mergeAndSync();
          // Load user favorites
          await loadFavorites(token);
        }
      } else {
        // User logged out
        setAuth(false, null);
        clearFavorites();
        // Reset cart will be called by setAuth
      }
    };

    syncCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  const segments = useSegments();
  const hideNavBar = segments[0] === "(auth)";

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: "HealthBytes" }} />
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
        <Stack.Screen
          name="profile"
          options={{
            title: "Mi Perfil",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen name="product/[id]" options={{ title: "Product" }} />
        <Stack.Screen
          name="cart"
          options={{
            title: "Carrito de Compras",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="checkout-v2"
          options={{
            title: "",
            headerTitleAlign: "center",
          }}
        />
      </Stack>

      {!hideNavBar && <BottomNavBar />}
      <CartFlyOverlay />

      <OnboardingModal
        visible={!!(isSignedIn && !hasCompletedOnboarding)}
        onComplete={handleOnboardingComplete}
      />
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
            <GluestackUIProvider>
              <ErrorBoundary>
                <RootLayoutNav />
              </ErrorBoundary>
            </GluestackUIProvider>
          </QueryClientProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </SafeAreaProvider>
  );
});
