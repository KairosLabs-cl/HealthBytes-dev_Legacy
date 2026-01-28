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
import React from "react";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@/lib/cache";

// Create a client
const queryClient = new QueryClient();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Clerk Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file."
  );
}

function RootLayoutNav() {
  const cartItemsNum = useCart((state) => state.items.length);
  const { isSignedIn } = useAuth();

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
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <QueryClientProvider client={queryClient}>
          <GluestackUIProvider>

            <RootLayoutNav />
          </GluestackUIProvider>
        </QueryClientProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
