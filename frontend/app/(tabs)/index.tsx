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
import { useAppTheme } from "@/hooks/useAppTheme";
import { useFavoritesStore } from "@/store/favoritesStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { DietaryTag, useProductFilters } from "@/store/productFiltersStore";
import { VALID_DIETARY_TAGS } from "@/lib/dietaryOptions";
import { useShallow } from "zustand/react/shallow";
import { Product } from "@/types/product";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogIn, RefreshCw, SearchX, Utensils } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// ─── Constants ───────────────────────────────────────────────────────────────

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
    subtitle: "Datos de azúcar declarados",
  },
  "alto-en-proteina": {
    headline: "Proteína para tu rendimiento",
    subtitle: "Opciones altas en proteína",
  },
  "para-diabeticos": {
    headline: "Datos glucémicos disponibles",
    subtitle: "Revisa la información declarada",
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
      <View style={{ paddingHorizontal: 16, marginTop: 12, marginBottom: 4 }}>
        <View
          style={{
            borderRadius: 28,
            backgroundColor: "#09090b",
            overflow: "hidden",
            minHeight: 170,
          }}
        >
          {/* Accent geometric shape — top-right corner decoration */}
          <View
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: "rgba(34,197,94,0.12)",
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "rgba(34,197,94,0.07)",
            }}
          />

          {/* Left: text stack */}
          <View
            style={{
              paddingHorizontal: 22,
              paddingTop: 20,
              paddingBottom: 20,
              flex: 1,
              maxWidth: "65%",
            }}
          >
            {/* Eyebrow label */}
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: "rgba(34,197,94,0.18)",
                borderRadius: 99,
                paddingHorizontal: 10,
                paddingVertical: 3,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "rgba(34,197,94,0.3)",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: "#4ade80",
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                }}
              >
                Especial para ti
              </Text>
            </View>

            {/* Headline — aggressive scale */}
            <Text
              style={{
                fontSize: 22,
                fontWeight: "900",
                color: "#fafafa",
                letterSpacing: -0.8,
                lineHeight: 26,
                marginBottom: 6,
              }}
              numberOfLines={2}
            >
              {content.headline}
            </Text>

            {/* Subtitle */}
            <Text
              style={{
                fontSize: 12,
                color: "rgba(250,250,250,0.5)",
                marginBottom: 16,
                fontWeight: "400",
              }}
            >
              {content.subtitle}
            </Text>

            {/* Ghost CTA */}
            <Pressable
              onPress={onViewAll}
              style={{
                alignSelf: "flex-start",
                borderRadius: 99,
                borderWidth: 1,
                borderColor: "rgba(250,250,250,0.2)",
                paddingHorizontal: 16,
                paddingVertical: 8,
                minHeight: 36,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: "#fafafa",
                  letterSpacing: 0.2,
                }}
              >
                Ver colección
              </Text>
            </Pressable>
          </View>

          {/* Right: floating product image */}
          <View
            style={{
              position: "absolute",
              right: 16,
              bottom: 16,
              top: 16,
              width: 110,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.07)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {heroProduct ? (
              <ExpoImage
                source={{ uri: heroProduct.image }}
                style={{ width: "90%", height: "90%" }}
                contentFit="contain"
                alt={`Imagen de ${heroProduct.name}`}
                transition={400}
              />
            ) : (
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                Snacks
              </Text>
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
  const { palette } = useAppTheme();

  if (isSignedIn) return null;

  return (
    <View className="mx-4 mt-3 flex-row items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surface-card">
        <Utensils size={20} color="#22c55e" strokeWidth={2.3} />
      </View>
      <Text className="flex-1 text-xs font-semibold leading-5 text-emerald-950">
        Inicia sesión para ver productos personalizados
      </Text>
      <Pressable
        onPress={() => router.push("/(auth)/login")}
        className="h-11 min-w-11 items-center justify-center rounded-2xl bg-ink px-3"
        accessibilityRole="button"
        accessibilityLabel="Entrar a HealthBytes"
      >
        <LogIn size={16} color={palette.colors.ink.inverse} strokeWidth={2.5} />
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

      <View className="mt-5 mb-3 flex-row items-center justify-between px-4">
        <Text className="text-[19px] font-black tracking-[-0.3px] text-ink">
          {dietaryTags.length > 0
            ? "Productos filtrados"
            : "Todos los productos"}
        </Text>
        {dietaryTags.length > 0 && (
          <Pressable
            onPress={onClearFilters}
            style={{ minHeight: 44, justifyContent: "center" }}
          >
            <Text className="text-sm font-bold text-emerald-600">
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
  const { dietaryTags, toggleDietaryTag, setDietaryTags, clearFilters } = useProductFilters(
    useShallow((state) => ({
      dietaryTags: state.dietaryTags,
      toggleDietaryTag: state.toggleDietaryTag,
      setDietaryTags: state.setDietaryTags,
      clearFilters: state.clearFilters,
    }))
  );
  const { user } = useUser();
  const router = useRouter();
  const { palette, statusBarStyle } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const hasHydrated = usePreferencesStore((state) => state.hasHydrated);

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
  }, [hasHydrated, setDietaryTags]);

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ["products", dietaryTags],
    queryFn: () =>
      listProducts({
        dietary: dietaryTags.length > 0 ? dietaryTags : undefined,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    enabled: hasHydrated,
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
    ({ item, index }: { item: Product; index: number }) => (
      <ProductListItem product={item} index={index} />
    ),
    []
  );

  if (isLoading && !data) {
    return (
      <>
        <HomeSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <View className="flex-1 items-center justify-center bg-surface-warm px-6">
          <Text className="mb-4 text-base font-semibold text-red-700">
            Error cargando productos
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="flex-row items-center gap-2 rounded-2xl bg-ink px-6 py-3"
            style={{ minHeight: 48 }}
            accessibilityRole="button"
          >
            <RefreshCw size={18} color={palette.colors.ink.inverse} />
            <Text className="text-ink-inverse font-bold">Reintentar</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-warm" edges={["top"]}>
      <StatusBar style={statusBarStyle} />

      {isFetching && !refreshing && data && (
        <View className="h-0.5 bg-brand-green" />
      )}

      <View className="flex-1">
        <FlashList<Product>
          className="flex-1 bg-surface-warm"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
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
          }
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View className="flex-1 px-6 py-12">
              {dietaryTags.length > 0 ? (
                <View className="items-start rounded-[24px] border border-border-subtle bg-surface-card p-5">
                  <View className="mb-5 h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted">
                    <SearchX size={23} color={palette.colors.icon.primary} strokeWidth={2.4} />
                  </View>
                  <Text className="mb-2 text-xl font-black tracking-[-0.3px] text-ink">
                    Sin resultados
                  </Text>
                  <Text className="mb-5 text-base leading-6 text-ink-muted">
                    No hay productos para estos filtros
                  </Text>
                  <Pressable
                    onPress={clearFilters}
                    className="rounded-2xl bg-ink px-5 py-3"
                    style={{ minHeight: 48 }}
                    accessibilityRole="button"
                  >
                    <Text className="text-ink-inverse font-semibold">
                      Ver todos los productos
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View className="items-start rounded-[24px] border border-border-subtle bg-surface-card p-5">
                  <View className="mb-5 h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted">
                    <Utensils size={23} color={palette.colors.icon.primary} strokeWidth={2.4} />
                  </View>
                  <Text className="mb-2 text-xl font-black tracking-[-0.3px] text-ink">
                    Catálogo en preparación
                  </Text>
                  <Text className="text-base leading-6 text-ink-muted">
                    Pronto aparecerán productos disponibles.
                  </Text>
                </View>
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
