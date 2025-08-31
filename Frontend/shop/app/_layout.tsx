import "@/global.css";
import { Link, Stack } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/ui/icon";
import { ShoppingCart, User } from "lucide-react-native";
import { Pressable } from "react-native";
import { useCart } from "@/store/cartStore";
import { Text } from "@/components/ui/text";
import BottomNavBar from "@/components/ui/NavBarr/BottomNavBar";
import { useAuth } from "@/store/authStore";


// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
    const cartItemsNum = useCart((state) => state.items.length);
    const isLoggedIn = useAuth((s) => !!s.token);

    return (
      <QueryClientProvider client={queryClient}>
        <GluestackUIProvider>
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
            <Stack.Screen name="categories" options={{ title: "Categories" }} />
            <Stack.Screen
              name="(auth)/login"
              options={{
                title: "Mi cuenta",
                headerTitleAlign: "center",
                headerLeft: () => !isLoggedIn && (
                  <Link href={"/login"} asChild>
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
        </GluestackUIProvider>
      </QueryClientProvider>
    );
}