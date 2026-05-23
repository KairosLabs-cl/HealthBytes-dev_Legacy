import { AuthGate } from "@/components/AuthGate";
import { FlatList, Pressable, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { useCallback, useMemo } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { Heart, HeartOff, RefreshCw } from "lucide-react-native";
import WishlistTableRow from "@/components/WishlistTableRow";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import ProductCardSkeleton, {
  useShimmerStyle,
} from "@/components/ProductCardSkeleton";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Product } from "@/types/product";
import { Favorite, getUserFavorites } from "@/api/favorites";

export default function WishlistScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const shimmerStyle = useShimmerStyle();

  const {
    data: favorites,
    isLoading,
    error,
    refetch,
  } = useQuery<Favorite[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      return getUserFavorites(getToken);
    },
    enabled: isSignedIn,
  });

  // Granular selector for favoriteIds to avoid re-renders on other store updates
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);

  const reactiveFavorites = useMemo(() => {
    if (!favorites) return [];
    return favorites.filter((fav) => favoriteIds.has(Number(fav.product?.id)));
  }, [favorites, favoriteIds]);

  const renderItem = useCallback(({ item }: { item: Favorite }) => {
    if (!item.product) return null;
    return <WishlistTableRow product={item.product as Product} />;
  }, []);

  const listHeader = useMemo(
    () => (
      <ScreenHeader
        title="Lista de deseos"
        icon={Heart}
        showBackButton={true}
      />
    ),
    []
  );

  const renderEmpty = useMemo(
    () => (
      <View className="flex-1 items-center justify-center p-8 mt-10">
        <View className="items-start rounded-[28px] border border-slate-200/70 bg-white p-6">
          <View className="mb-6 h-16 w-16 items-center justify-center rounded-[24px] bg-rose-50">
            <HeartOff size={32} color="#e11d48" />
          </View>
          <Text className="mb-2 text-xl font-black tracking-[-0.3px] text-[#09090b]">
            Lista vacía
          </Text>
          <Text className="mb-6 text-base leading-6 text-zinc-600">
            Guarda productos para volver rápido a tus favoritos.
          </Text>
          <Pressable
            onPress={() => router.push("/")}
            className="rounded-2xl bg-[#09090b] px-6 py-3 active:opacity-80"
            style={{ minHeight: 48 }}
            accessibilityRole="button"
            accessibilityLabel="Explorar productos"
          >
            <Text className="text-base font-bold text-white">
              Explorar productos
            </Text>
          </Pressable>
        </View>
      </View>
    ),
    [router]
  );

  if (!isLoaded || isLoading) {
    return (
      <View className="flex-1 bg-[#fafafa]">
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Lista de deseos"
          icon={Heart}
          showBackButton={true}
        />
        <View className="px-4 mt-4 gap-3">
          <ProductCardSkeleton shimmerStyle={shimmerStyle} />
          <ProductCardSkeleton shimmerStyle={shimmerStyle} />
          <ProductCardSkeleton shimmerStyle={shimmerStyle} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#fafafa]">
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Lista de deseos"
          icon={Heart}
          showBackButton={true}
        />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 text-base mb-4">
            Error cargando tu lista de deseos
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="flex-row items-center gap-2 rounded-2xl bg-[#09090b] px-6 py-3"
            style={{ minHeight: 48 }}
            accessibilityRole="button"
            accessibilityLabel="Reintentar cargar lista de deseos"
          >
            <RefreshCw size={18} color="white" />
            <Text className="text-white font-bold">Reintentar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <AuthGate message="Inicia sesión para ver tu lista de deseos.">
      <View className="flex-1 bg-[#fafafa]">
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />

        <FlatList
          className="flex-1 bg-[#fafafa]"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
          ListHeaderComponent={listHeader}
          data={reactiveFavorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          initialNumToRender={8}
          windowSize={7}
          maxToRenderPerBatch={6}
        />
      </View>
    </AuthGate>
  );
}
