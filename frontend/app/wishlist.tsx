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
import { ListEmptyState } from "@/components/ui/ListEmptyState";
import WishlistSkeletonRow from "@/components/WishlistSkeletonRow";
import { useShimmerStyle } from "@/components/ProductCardSkeleton";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Product } from "@/types/product";
import { Favorite, getUserFavorites } from "@/api/favorites";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function WishlistScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const shimmerStyle = useShimmerStyle();
  const { palette, statusBarStyle } = useAppTheme();

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
    staleTime: 2 * 60 * 1000, // 2 minutes
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
      <ListEmptyState
        icon={HeartOff}
        iconColor={palette.colors.state.error}
        iconBgColor={`${palette.colors.state.error}1F`}
        title="Lista vacía"
        description="Guarda productos para volver rápido a tus favoritos."
        actionLabel="Explorar productos"
        onActionPress={() => router.push("/")}
        style={{ marginTop: 40 }}
      />
    ),
    [palette.colors.state.error, router]
  );

  if (!isLoaded || isLoading) {
    return (
      <View
        className="flex-1"
        style={{ backgroundColor: palette.colors.surface.warm }}
      >
        <StatusBar style={statusBarStyle} />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Lista de deseos"
          icon={Heart}
          showBackButton={true}
        />
        <View className="mt-4 flex-1">
          <WishlistSkeletonRow shimmerStyle={shimmerStyle} />
          <WishlistSkeletonRow shimmerStyle={shimmerStyle} />
          <WishlistSkeletonRow shimmerStyle={shimmerStyle} />
          <WishlistSkeletonRow shimmerStyle={shimmerStyle} />
          <WishlistSkeletonRow shimmerStyle={shimmerStyle} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="flex-1"
        style={{ backgroundColor: palette.colors.surface.warm }}
      >
        <StatusBar style={statusBarStyle} />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Lista de deseos"
          icon={Heart}
          showBackButton={true}
        />
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="text-base mb-4"
            style={{ color: palette.colors.state.error }}
          >
            Error cargando tu lista de deseos
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="flex-row items-center gap-2 rounded-2xl px-6 py-3"
            style={{
              minHeight: 48,
              backgroundColor: palette.colors.ink.primary,
            }}
            accessibilityRole="button"
            accessibilityLabel="Reintentar cargar lista de deseos"
          >
            <RefreshCw size={18} color={palette.colors.ink.inverse} />
            <Text
              className="font-bold"
              style={{ color: palette.colors.ink.inverse }}
            >
              Reintentar
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <AuthGate message="Inicia sesión para ver tu lista de deseos.">
      <View
        className="flex-1"
        style={{ backgroundColor: palette.colors.surface.warm }}
      >
        <StatusBar style={statusBarStyle} />
        <Stack.Screen options={{ headerShown: false }} />

        <FlatList
          className="flex-1"
          style={{ backgroundColor: palette.colors.surface.warm }}
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
