import { FlatList, Pressable, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";

import { useCallback, useMemo } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { HeartOff, RefreshCw } from "lucide-react-native";

import WishlistTableRow from "@/components/WishlistTableRow";
import { Header } from "@/components/Header";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { useFavoritesStore } from "@/store/favoritesStore";

import { Product } from "@/types/product";
import { Favorite } from "@/api/favorites";
import { getUserFavorites } from "@/api/favorites";

export default function WishlistScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const {
    data: favorites,
    isLoading,
    error,
    refetch,
  } = useQuery<Favorite[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const token = await getToken();
      return getUserFavorites(token || "");
    },
    enabled: isSignedIn,
  });

  const { favoriteIds } = useFavoritesStore();

  const reactiveFavorites = useMemo(() => {
    if (!favorites) return [];
    return favorites.filter(fav => favoriteIds.has(Number(fav.product?.id)));
  }, [favorites, favoriteIds]);

  const renderItem = useCallback(({ item }: { item: Favorite }) => {
    if (!item.product) return null;
    return <WishlistTableRow product={item.product as Product} />;
  }, []);

  const renderHeader = useMemo(() => {
    if (!reactiveFavorites || reactiveFavorites.length === 0) return null;
    return (
      <View>
        <Header userName="Usuario" showBackButton={true} />
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: "#F9FAFB",
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
            alignItems: "center"
          }}
        >
          {/* Spacer for remove btn + image */}
          <View style={{ width: 132 }} />

          <View style={{ flex: 3 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: "#6B7280", letterSpacing: 0.5 }}>
              NOMBRE DE PRODUCTO
            </Text>
          </View>
          <View style={{ flex: 1.5 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: "#6B7280", letterSpacing: 0.5 }}>
              PRECIO UNITARIO
            </Text>
          </View>
          <View style={{ flex: 1.5 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: "#6B7280", letterSpacing: 0.5 }}>
              ESTADO DEL STOCK
            </Text>
          </View>
          {/* Spacer for button */}
          <View style={{ minWidth: 100 }} />
        </View>
      </View>
    );
  }, [favorites]);

  const renderEmpty = useMemo(
    () => (
      <View className="flex-1 items-center justify-center p-8 mt-10">
        <View className="bg-gray-100 p-6 rounded-full mb-6">
          <HeartOff size={48} color="#9CA3AF" />
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2">
          Lista vacía
        </Text>
        <Text className="text-center text-gray-500 mb-6">
          Aún no tienes productos en tu lista de deseos. Explora y guarda tus favoritos.
        </Text>
        <Pressable
          onPress={() => router.push("/")}
          className="bg-black px-6 py-3 rounded-full active:opacity-80"
          style={{ minHeight: 44 }}
        >
          <Text className="text-white font-bold text-base">Explorar productos</Text>
        </Pressable>
      </View>
    ),
    [router]
  );

  if (!isLoaded || isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Stack.Screen options={{ title: "Mi lista de Deseos" }} />
        <View className="px-3 mt-4">
          <View className="mb-2">
            <ProductCardSkeleton />
          </View>
          <View className="mb-2">
            <ProductCardSkeleton />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!isSignedIn) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Stack.Screen options={{ title: "Mi lista de Deseos" }} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-900 text-lg mb-4 text-center">
            Inicia sesión para ver tu lista de deseos
          </Text>
          <Pressable
            onPress={() => router.push("/(auth)/login")}
            className="bg-black px-6 py-3 rounded-full active:opacity-80"
          >
            <Text className="text-white font-bold">Iniciar sesión</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Stack.Screen options={{ title: "Mi lista de Deseos" }} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 text-base mb-4">
            Error cargando tu lista de deseos
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="flex-row items-center gap-2 bg-black px-6 py-3 rounded-full active:opacity-80"
          >
            <RefreshCw size={18} color="white" />
            <Text className="text-white font-bold">Reintentar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="max-w-[1200px] mx-auto w-full pb-44"
        ListHeaderComponent={renderHeader}
        data={reactiveFavorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        initialNumToRender={10}
        windowSize={11}
      />
    </SafeAreaView>
  );
}
