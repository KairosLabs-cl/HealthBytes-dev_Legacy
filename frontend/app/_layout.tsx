import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Icon } from "@/components/ui/icon";
import BottomNavBar from "@/components/ui/NavBar/BottomNavBar";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import "@/global.css";
import { tokenCache } from "@/lib/cache";
import { useCart } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { updateDietaryPreferences } from "@/api/preferences";
import OnboardingModal from "@/components/OnboardingModal";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, Stack } from "expo-router";
import { User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Constants removed

// Create a client
const queryClient = new QueryClient();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing Clerk Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file."
  );
}

function RootLayoutNav() {
  const cartItemsNum = useCart((state) => state.items.length);
  const setAuth = useCart((state) => state.setAuth);
  const mergeAndSync = useCart((state) => state.mergeAndSync);
  const error = useCart((state) => state.error);
  const clearError = useCart((state) => state.clearError);
  const toast = useToast();

  const { isSignedIn, getToken } = useAuth();

  // Onboarding
  const { hasSeenOnboarding, markOnboardingComplete, setDietaryPreferences } =
    usePreferencesStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (isSignedIn && !hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [isSignedIn, hasSeenOnboarding]);

  const handleOnboardingComplete = async (tags: string[]) => {
    setDietaryPreferences(tags);
    markOnboardingComplete();
    setShowOnboarding(false);
    if (tags.length > 0) {
      const token = await getToken();
      if (token) {
        updateDietaryPreferences(tags, token).catch(() => {
          // fire-and-forget: failure is non-critical
        });
      }
    }
  };

  const handleOnboardingSkip = () => {
    markOnboardingComplete();
    setShowOnboarding(false);
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

      <BottomNavBar />

      <OnboardingModal
        visible={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    </>
  );
}

export default function RootLayout() {
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
}
