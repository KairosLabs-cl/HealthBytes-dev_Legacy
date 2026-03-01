import { ActivityIndicator, FlatList, View, Image, Pressable } from "react-native";
import HomeSkeleton from "@/components/HomeSkeleton";
import { useQuery } from "@tanstack/react-query";
import { Text } from "@/components/ui/text";
import { useBreakpointValue } from "@/components/ui/utils/use-break-point-value";
import { listProducts } from "@/api/products";
import ProductListItem from "@/components/ProductListItem";
import FavoritesBar from "@/components/FavoritesBar";
import RecentlyViewedBar from "@/components/RecentlyViewedBar";
import DietaryFilterBar from "@/components/DietaryFilterBar";
import { Header } from "@/components/Header";
import { Stack, useRouter } from "expo-router";
import { RefreshCw } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRecentlyViewed } from "@/store/recentlyViewedStore";
import { useProductFilters, DietaryTag } from "@/store/productFiltersStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Product } from "@/types/product";
// ─── Constants ───────────────────────────────────────────────────────────────

const VALID_DIETARY_TAGS = new Set<string>([
  'sin-gluten', 'vegano', 'sin-lactosa', 'bajo-en-azucar', 'alto-en-proteina', 'para-diabeticos',
]);

// Dynamic hero content per active filter
const HERO_CONTENT: Record<string, { headline: string; subtitle: string }> = {
  'sin-gluten':     { headline: 'Snacks sin TACC',               subtitle: 'Certificados y deliciosos' },
  'vegano':         { headline: 'Lo mejor en productos veganos',  subtitle: 'Sin ingredientes de origen animal' },
  'sin-lactosa':    { headline: 'Sin lactosa, con todo el sabor', subtitle: 'Opciones libres de lactosa' },
  'bajo-en-azucar': { headline: 'Bajo en azucar, alto en sabor',  subtitle: 'Ideal para controlar la glucosa' },
};
const HERO_DEFAULT = { headline: 'Lo mejor en nutricion saludable', subtitle: 'Descuentos especiales hoy' };

const keyExtractor = (item: Product) => item.id.toString();

// ─── HeroBanner ───────────────────────────────────────────────────────────────

interface HeroBannerProps {
  heroProduct: Product | undefined;
  dietaryTags: DietaryTag[];
  onViewAll: () => void;
}

const HeroBanner = React.memo(({ heroProduct, dietaryTags, onViewAll }: HeroBannerProps) => {
  const firstTag = dietaryTags[0];
  const content = (firstTag && HERO_CONTENT[firstTag]) || HERO_DEFAULT;

  return (
    <View className="px-4 mt-4">
      <View className="rounded-3xl bg-black flex-row items-center px-5 py-5 overflow-hidden">
        <View className="flex-1 pr-3">
          <Text className="text-[11px] uppercase text-gray-300 tracking-[1px]">
            Especial para ti
          </Text>
          <Text className="text-2xl font-extrabold text-white mt-1">
            {content.headline}
          </Text>
          <Text className="text-sm text-gray-200 mt-2">{content.subtitle}</Text>
          <Pressable
            onPress={onViewAll}
            className="mt-3 self-start bg-white rounded-full px-5 py-3"
            style={{ minHeight: 44 }}
          >
            <Text className="font-semibold text-black">Ver coleccion</Text>
          </Pressable>
        </View>
        <View className="w-28 h-28 rounded-2xl bg-white/10 border border-white/10 items-center justify-center">
          {heroProduct ? (
            <Image
              source={{ uri: heroProduct.image }}
              className="w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <Text className="text-white text-sm">Snacks</Text>
          )}
        </View>
      </View>
    </View>
  );
});
HeroBanner.displayName = "HeroBanner";

// ─── HomeListHeader ───────────────────────────────────────────────────────────

interface HomeListHeaderProps {
  userName: string;
  dietaryTags: DietaryTag[];
  toggleDietaryTag: (tag: DietaryTag) => void;
  heroProduct: Product | undefined;
  recentlyViewedItems: Product[];
  favoriteProducts: Product[];
  onViewAll: () => void;
  onClearFilters: () => void;
  onSeeAllRecent: () => void;
  onSeeAllFavorites: () => void;
}

const HomeListHeader = React.memo(({
  userName,
  dietaryTags,
  toggleDietaryTag,
  heroProduct,
  recentlyViewedItems,
  favoriteProducts,
  onViewAll,
  onClearFilters,
  onSeeAllRecent,
  onSeeAllFavorites,
}: HomeListHeaderProps) => (
  <>
    <Header userName={userName} />
    <DietaryFilterBar dietaryTags={dietaryTags} toggleDietaryTag={toggleDietaryTag} />
    <HeroBanner heroProduct={heroProduct} dietaryTags={dietaryTags} onViewAll={onViewAll} />

    {recentlyViewedItems.length > 0 && (
      <RecentlyViewedBar items={recentlyViewedItems} onSeeAll={onSeeAllRecent} />
    )}
    {favoriteProducts.length > 0 && (
      <FavoritesBar products={favoriteProducts} onSeeAll={onSeeAllFavorites} />
    )}

    <View className="px-4 flex-row items-center justify-between mt-4 mb-2">
      <Text className="text-lg font-bold text-gray-900">
        {dietaryTags.length > 0 ? "Productos filtrados" : "Todos los productos"}
      </Text>
      {dietaryTags.length > 0 && (
        <Pressable onPress={onClearFilters} style={{ minHeight: 44, justifyContent: 'center' }}>
          <Text className="text-sm font-semibold text-green-600">Limpiar</Text>
        </Pressable>
      )}
    </View>
  </>
));
HomeListHeader.displayName = "HomeListHeader";

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { items: recentlyViewedItems } = useRecentlyViewed();
  const { dietaryTags, toggleDietaryTag, setDietaryTags, clearFilters } = useProductFilters();
  const { user } = useUser();
  const { dietaryPreferences } = usePreferencesStore();
  const { favoriteIds } = useFavoritesStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Pre-apply saved dietary preferences on first mount only
  useEffect(() => {
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
    queryFn: () => listProducts({
      dietary: dietaryTags.length > 0 ? dietaryTags : undefined
    }),
    placeholderData: (previousData) => previousData,
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

  const heroProduct = useMemo(() => data?.[0], [data]);

  const favoriteProducts = useMemo(() => {
    if (!data) return [];
    return data.filter((p: Product) => favoriteIds.has(Number(p.id)));
  }, [data, favoriteIds]);

  const userName = user?.firstName || user?.fullName || "Usuario";

  const onViewAll = useCallback(() => router.push('/all-products'), [router]);
  const onSeeAllRecent = useCallback(() => router.push('/recently-viewed'), [router]);
  const onSeeAllFavorites = useCallback(() => router.push('/wishlist'), [router]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <View style={{ width: numColumns === 2 ? '50%' : numColumns === 3 ? '33.33%' : '25%' }}>
        <ProductListItem product={item} />
      </View>
    ),
    [numColumns]
  );

  const listHeader = useMemo(() => (
    <HomeListHeader
      userName={userName}
      dietaryTags={dietaryTags}
      toggleDietaryTag={toggleDietaryTag}
      heroProduct={heroProduct}
      recentlyViewedItems={recentlyViewedItems}
      favoriteProducts={favoriteProducts}
      onViewAll={onViewAll}
      onClearFilters={clearFilters}
      onSeeAllRecent={onSeeAllRecent}
      onSeeAllFavorites={onSeeAllFavorites}
    />
  ), [userName, dietaryTags, toggleDietaryTag, heroProduct, recentlyViewedItems, favoriteProducts, onViewAll, clearFilters, onSeeAllRecent, onSeeAllFavorites]);

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
        <View className="flex-1 items-center justify-center bg-white px-6">
          <Text className="text-red-500 text-base mb-4">Error cargando productos</Text>
          <Pressable
            onPress={() => refetch()}
            className="flex-row items-center gap-2 bg-black px-6 py-3 rounded-full"
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
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      {isFetching && !refreshing && data && (
        <View className="absolute top-16 left-0 right-0 items-center z-10">
          <View className="bg-white/90 rounded-full px-4 py-2 shadow-md">
            <ActivityIndicator size="small" />
          </View>
        </View>
      )}

      <FlatList
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-8">
            {dietaryTags.length > 0 ? (
              <>
                <Text className="text-center text-gray-500 mb-4">
                  No hay productos para estos filtros
                </Text>
                <Pressable
                  onPress={clearFilters}
                  className="bg-black rounded-full px-6 py-3"
                  style={{ minHeight: 44 }}
                >
                  <Text className="text-white font-semibold">Ver todos los productos</Text>
                </Pressable>
              </>
            ) : (
              <Text className="text-center text-gray-500">
                No hay productos disponibles
              </Text>
            )}
          </View>
        }
        key={numColumns}
        keyExtractor={keyExtractor}
        data={data}
        numColumns={numColumns}
        contentContainerClassName="gap-2 max-w-[960px] mx-auto w-full px-4 pb-32"
        columnWrapperClassName="gap-2"
        renderItem={renderItem}
        initialNumToRender={6}
        windowSize={7}
        maxToRenderPerBatch={6}
      />
    </SafeAreaView>
  );
}
