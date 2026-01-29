import "@/global.css";
import { Link, Stack, useRouter } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/ui/icon";
import { ShoppingCart, User } from "lucide-react-native";
import { Pressable } from "react-native";
import { useCart } from "@/store/cartStore";
import { Text } from "@/components/ui/text";
import BottomNavBar from "@/components/ui/NavBarr/BottomNavBar";
import React, { useEffect } from "react";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@/lib/cache";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";

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

  // Sync cart with authentication state
  useEffect(() => {
    const syncCart = async () => {
      if (isSignedIn) {
        // User logged in
        const token = await getToken();
        if (token) {
          setAuth(true, token);
          // Merge local cart with server cart
          await mergeAndSync();
        }
      } else {
        // User logged out
        setAuth(false, null);
        // Reset cart will be called by setAuth
      }
    };

    syncCart();
  }, [isSignedIn, getToken, setAuth, mergeAndSync]);


  return (
    <>
      <Stack
        screenOptions={{
          headerRight: () =>
            cartItemsNum > 0 && (
              <Link href={"/cart"} asChild>
                <Pressable
                  className="flex-row gap-2"
                  style={{ marginRight: 40 }}
                >
                  <Icon as={ShoppingCart} />
                  <Text>{cartItemsNum}</Text>
                </Pressable>
              </Link>
            ),
        }}
      >
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
        <Stack.Screen name="product/[id]" options={{ title: "Product" }} />
        <Stack.Screen
          name="cart"
          options={{
            title: "Carrito de Compras",
            headerTitleAlign: "center",
          }}
        />
      </Stack>

      <BottomNavBar />
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

              <RootLayoutNav />
            </GluestackUIProvider>
          </QueryClientProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
