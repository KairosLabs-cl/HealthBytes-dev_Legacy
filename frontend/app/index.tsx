import { getFeaturedProduct, listProducts } from "@/api/products";
import DietaryFilterBar from "@/components/DietaryFilterBar";
import FavoritesBar from "@/components/FavoritesBar";
import { Header } from "@/components/Header";
import HomeSkeleton from "@/components/HomeSkeleton";
import ProductListItem from "@/components/ProductListItem";
import RecentlyViewedBar from "@/components/RecentlyViewedBar";
import DiscountsBar from "@/components/DiscountsBar";
import RecommendationsBar from "@/components/RecommendationsBar";
import { Text } from "@/components/ui/text";
import { useBreakpointValue } from "@/components/ui/utils/use-break-point-value";
import { useFavoritesStore } from "@/store/favoritesStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { DietaryTag, useProductFilters } from "@/store/productFiltersStore";
import { Product } from "@/types/product";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { RefreshCw } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// ─── Constants ───────────────────────────────────────────────────────────────

const VALID_DIETARY_TAGS = new Set<string>([
  "sin-gluten",
  "vegano",
  "sin-lactosa",
  "bajo-en-azucar",
  "alto-en-proteina",
  "para-diabeticos",
]);

// Dynamic hero content per active filter
const HERO_CONTENT: Record<string, { headline: string; subtitle: string }> = {
  "sin-gluten": {
    headline: "Snacks sin TACC",
    subtitle: "Certificados y deliciosos",
  },
  vegano: {
    headline: "Lo mejor en productos veganos",
    subtitle: "Sin ingredientes de origen animal",
  },
  "sin-lactosa": {
    headline: "Sin lactosa, con todo el sabor",
    subtitle: "Opciones libres de lactosa",
  },
  "bajo-en-azucar": {
    headline: "Bajo en azucar, alto en sabor",
    subtitle: "Ideal para controlar la glucosa",
  },
  "alto-en-proteina": {
    headline: "Proteína para tu rendimiento",
    subtitle: "Opciones altas en proteína",
  },
  "para-diabeticos": {
    headline: "Control glucémico inteligente",
    subtitle: "Productos de bajo índice glucémico",
  },
};
const HERO_DEFAULT = {
  headline: "Lo mejor en nutricion saludable",
  subtitle: "Descuentos especiales hoy",
};

const keyExtractor = (item: Product) => item.id.toString();

// ─── HeroBanner ───────────────────────────────────────────────────────────────

interface HeroBannerProps {
  heroProduct: Product | undefined;
  dietaryTags: DietaryTag[];
  onViewAll: () => void;
}

const HeroBanner = React.memo(
  ({ heroProduct, dietaryTags, onViewAll }: HeroBannerProps) => {
    const firstTag = dietaryTags[0];
    const content = (firstTag && HERO_CONTENT[firstTag]) || HERO_DEFAULT;

    return (
      <View className="px-4 mt-4">
        <View className="rounded-3xl bg-ink flex-row items-center px-5 py-5 overflow-hidden">
          <View className="flex-1 pr-3">
            <Text className="text-[11px] uppercase text-gray-300 tracking-[1px]">
              Especial para ti
            </Text>
            <Text className="text-2xl font-extrabold text-white mt-1">
              {content.headline}
            </Text>
            <Text className="text-sm text-gray-200 mt-2">
              {content.subtitle}
            </Text>
            <Pressable
              onPress={onViewAll}
              className="mt-3 self-start bg-surface-card rounded-full px-5 py-3"
              style={{ minHeight: 44 }}
            >
              <Text className="font-semibold text-ink">Ver coleccion</Text>
            </Pressable>
          </View>
          <View className="w-28 h-28 rounded-2xl bg-white/10 border border-white/10 items-center justify-center">
            {heroProduct ? (
              <ExpoImage
                source={{ uri: heroProduct.image }}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
                alt={`Imagen de ${heroProduct.name}`}
                transition={300}
              />
            ) : (
              <Text className="text-white text-sm">Snacks</Text>
            )}
          </View>
        </View>
      </View>
    );
  }
);
HeroBanner.displayName = "HeroBanner";

// ─── GuestBanner ─────────────────────────────────────────────────────────────

const GuestBanner = React.memo(() => {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  if (isSignedIn) return null;

  return (
    <View className="mx-4 mt-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex-row items-center gap-3">
      <Text className="text-2xl">{"\u{1F957}"}</Text>
      <Text className="text-xs font-medium text-green-900 flex-1">
        Inicia sesión para ver productos personalizados
      </Text>
      <Pressable
        onPress={() => router.push("/(auth)/login")}
        style={{ minHeight: 44, justifyContent: "center" }}
      >
        <Text className="text-xs font-bold text-green-700">
          {"Entrar \u2192"}
        </Text>
      </Pressable>
    </View>
  );
});
GuestBanner.displayName = "GuestBanner";

// ─── HomeFavorites ────────────────────────────────────────────────────────────

const HomeFavorites = React.memo(
  ({
    products,
    onSeeAll,
  }: {
    products: Product[] | undefined;
    onSeeAll: () => void;
  }) => {
    const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
    const favoriteProducts = useMemo(() => {
      if (!products) return [];
      return products.filter((p: Product) => favoriteIds.has(Number(p.id)));
    }, [products, favoriteIds]);

    if (favoriteProducts.length === 0) return null;

    return <FavoritesBar products={favoriteProducts} onSeeAll={onSeeAll} />;
  }
);
HomeFavorites.displayName = "HomeFavorites";

// ─── HomeListHeader ───────────────────────────────────────────────────────────

interface HomeListHeaderProps {
  userName: string;
  dietaryTags: DietaryTag[];
  toggleDietaryTag: (tag: DietaryTag) => void;
  heroProduct: Product | undefined;
  products: Product[] | undefined;
  onViewAll: () => void;
  onClearFilters: () => void;
  onSeeAllFavorites: () => void;
}

const HomeListHeader = React.memo(
  ({
    userName,
    dietaryTags,
    toggleDietaryTag,
    heroProduct,
    products,
    onViewAll,
    onClearFilters,
    onSeeAllFavorites,
  }: HomeListHeaderProps) => (
    <>
      <Header
        userName={userName}
        isLoggedIn={!!userName && userName !== "Usuario"}
      />
      <GuestBanner />
      <DietaryFilterBar
        dietaryTags={dietaryTags}
        toggleDietaryTag={toggleDietaryTag}
      />
      <HeroBanner
        heroProduct={heroProduct}
        dietaryTags={dietaryTags}
        onViewAll={onViewAll}
      />

      <RecentlyViewedBar />
      <DiscountsBar onSeeAll={onViewAll} />
      <RecommendationsBar />
      <HomeFavorites products={products} onSeeAll={onSeeAllFavorites} />

      <View className="px-4 flex-row items-center justify-between mt-4 mb-2">
        <Text className="text-lg font-bold text-gray-900">
          {dietaryTags.length > 0
            ? "Productos filtrados"
            : "Todos los productos"}
        </Text>
        {dietaryTags.length > 0 && (
          <Pressable
            onPress={onClearFilters}
            style={{ minHeight: 44, justifyContent: "center" }}
          >
            <Text className="text-sm font-semibold text-green-600">
              Limpiar
            </Text>
          </Pressable>
        )}
      </View>
    </>
  )
);
HomeListHeader.displayName = "HomeListHeader";

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  // ⚡ Bolt: Use granular selectors for Zustand stores to prevent unnecessary full-screen re-renders
  // when unrelated state changes. This is critical for performance, especially with FlatLists.
  const dietaryTags = useProductFilters((state) => state.dietaryTags);
  const toggleDietaryTag = useProductFilters((state) => state.toggleDietaryTag);
  const setDietaryTags = useProductFilters((state) => state.setDietaryTags);
  const clearFilters = useProductFilters((state) => state.clearFilters);
  const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Pre-apply saved dietary preferences on first mount only
  useEffect(() => {
    // ⚡ Bolt: Use getState() instead of the hook to avoid subscribing to dietaryPreferences.
    // Since we only use it on mount, subscribing causes unnecessary full-screen re-renders
    // if preferences change in the background.
    const dietaryPreferences =
      usePreferencesStore.getState().dietaryPreferences;
    if (dietaryPreferences.length > 0) {
      const validTags = dietaryPreferences.filter((t) =>
        VALID_DIETARY_TAGS.has(t)
      ) as DietaryTag[];
      if (validTags.length > 0) setDietaryTags(validTags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ["products", dietaryTags],
    queryFn: () =>
      listProducts({
        dietary: dietaryTags.length > 0 ? dietaryTags : undefined,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });

  const { data: heroProduct } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: getFeaturedProduct,
    staleTime: 10 * 60 * 1000,
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const numColumns = useBreakpointValue({
    default: 2,
    sm: 3,
    xl: 4,
  }) as number;

  const userName = user?.firstName || user?.fullName || "Usuario";

  const onViewAll = useCallback(() => router.push("/all-products"), [router]);
  const onSeeAllFavorites = useCallback(
    () => router.push("/wishlist"),
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <ProductListItem product={item} />,
    []
  );

  const renderListHeader = useCallback(
    () => (
      <HomeListHeader
        userName={userName}
        dietaryTags={dietaryTags}
        toggleDietaryTag={toggleDietaryTag}
        heroProduct={heroProduct}
        products={data}
        onViewAll={onViewAll}
        onClearFilters={clearFilters}
        onSeeAllFavorites={onSeeAllFavorites}
      />
    ),
    [
      userName,
      dietaryTags,
      toggleDietaryTag,
      heroProduct,
      data,
      onViewAll,
      clearFilters,
      onSeeAllFavorites,
    ]
  );

  if (isLoading && !data) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <HomeSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center bg-surface-warm px-6">
          <Text className="text-red-500 text-base mb-4">
            Error cargando productos
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="flex-row items-center gap-2 bg-ink px-6 py-3 rounded-full"
            style={{ minHeight: 44 }}
          >
            <RefreshCw size={18} color="white" />
            <Text className="text-white font-bold">Reintentar</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-warm" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      {isFetching && !refreshing && data && (
        <View className="h-0.5 bg-brand-green" />
      )}

      <View key={numColumns} className="flex-1">
        <FlashList<Product>
          className="flex-1 bg-surface-warm"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderListHeader}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center p-8">
              {dietaryTags.length > 0 ? (
                <>
                  <Text className="text-center text-ink-muted mb-4 text-base">
                    No hay productos para estos filtros
                  </Text>
                  <Pressable
                    onPress={clearFilters}
                    className="bg-ink rounded-full px-6 py-3"
                    style={{ minHeight: 44 }}
                  >
                    <Text className="text-white font-semibold">
                      Ver todos los productos
                    </Text>
                  </Pressable>
                </>
              ) : (
                <Text className="text-center text-ink-subtle text-base">
                  No hay productos disponibles
                </Text>
              )}
            </View>
          }
          keyExtractor={keyExtractor}
          data={data}
          numColumns={numColumns}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 128 }}
          renderItem={renderItem}
          estimatedItemSize={280}
        />
      </View>
    </SafeAreaView>
  );
}
