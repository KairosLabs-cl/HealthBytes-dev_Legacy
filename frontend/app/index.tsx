import { ActivityIndicator, FlatList, View, Image, Pressable } from "react-native";
import HomeSkeleton from "@/components/HomeSkeleton";
import { useQuery } from "@tanstack/react-query";
import { Text } from "@/components/ui/text";
import { useBreakpointValue } from "@/components/ui/utils/use-break-point-value";
import { listProducts } from "@/api/products";
import ProductListItem from "@/components/ProductListItem";
import FavoritesBar from "@/components/FavoritesBar";
import RecentlyViewedBar from "@/components/RecentlyViewedBar";
import { Header } from "@/components/Header";
import { Stack } from "expo-router";
import { RefreshCw } from "lucide-react-native";

import { useCallback, useEffect, useMemo } from "react";
import { useRecentlyViewed } from "@/store/recentlyViewedStore";
import { useProductFilters, DietaryTag } from "@/store/productFiltersStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Product } from "@/types/product";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

function AnimatedFilterChip({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withTiming(0.97, { duration: 80, easing: Easing.out(Easing.ease) }, () => {
      scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
    });
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        className={`px-4 py-3 rounded-full border ${isActive ? 'bg-green-500 border-green-600' : 'bg-gray-100 border-gray-200'}`}
        style={{ minHeight: 44 }}
      >
        <Text className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const DIET_FILTERS = [
  { label: "Celiacos", tag: "sin-gluten" },
  { label: "Veganos", tag: "vegano" },
  { label: "Sin lactosa", tag: "sin-lactosa" },
  { label: "Bajo en azucar", tag: "bajo-en-azucar" },
] as const;

const keyExtractor = (item: Product) => item.id.toString();

const VALID_DIETARY_TAGS = new Set<string>([
  'sin-gluten', 'vegano', 'sin-lactosa', 'bajo-en-azucar', 'alto-en-proteina', 'para-diabeticos',
]);

export default function HomeScreen() {
  const { items: recentlyViewedItems } = useRecentlyViewed();
  const { dietaryTags, toggleDietaryTag, setDietaryTags, clearFilters } = useProductFilters();
  const { user } = useUser();
  const { dietaryPreferences } = usePreferencesStore();

  // Pre-apply saved dietary preferences as initial filters on first mount
  useEffect(() => {
    if (dietaryPreferences.length > 0) {
      const validTags = dietaryPreferences.filter((t) =>
        VALID_DIETARY_TAGS.has(t)
      ) as DietaryTag[];
      if (validTags.length > 0) setDietaryTags(validTags);
    }
  }, [dietaryPreferences]);

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ["products", dietaryTags],
    queryFn: () => listProducts({
      dietary: dietaryTags.length > 0 ? dietaryTags : undefined
    }),
    placeholderData: (previousData) => previousData,
  });

  const numColumns = useBreakpointValue({
    default: 2,
    sm: 3,
    xl: 4,
  }) as number;

  const heroProduct = useMemo(() => data?.[0], [data]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <ProductListItem product={item} />,
    []
  );

  const renderHeader = useMemo(() => (
    <>
      {/* Header + busqueda */}
      <Header userName={user?.firstName || user?.fullName || "Usuario"} />

      {/* Chips de dietas */}
      <View className="px-4 pb-1 bg-white">
        <View className="flex-row flex-wrap gap-2 mt-2">
          {DIET_FILTERS.map(({ label, tag }) => (
            <AnimatedFilterChip
              key={label}
              label={label}
              isActive={dietaryTags.includes(tag)}
              onPress={() => toggleDietaryTag(tag)}
            />
          ))}
        </View>
      </View>

      {/* Banner principal */}
      <View className="px-4 mt-2">
        <View className="rounded-3xl bg-black flex-row items-center px-5 py-5 overflow-hidden">
          <View className="flex-1 pr-3">
            <Text className="text-[11px] uppercase text-gray-300 tracking-[1px]">
              Especial para ti
            </Text>
            <Text className="text-2xl font-extrabold text-white mt-1">
              Descubre snacks sin gluten
            </Text>
            <Text className="text-sm text-gray-200 mt-2">Hasta 30% de descuento hoy</Text>
            <Pressable
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

      {/* Secciones horizontales */}
      <RecentlyViewedBar items={recentlyViewedItems} />
      <FavoritesBar products={data} />

      {/* Products section header */}
      <View className="px-4 flex-row items-center justify-between mt-2 mb-1">
        <Text className="text-lg font-bold text-gray-900">
          {dietaryTags.length > 0
            ? `🛒 Productos filtrados`
            : `🛒 Todos los productos`}
        </Text>
        <Pressable>
          <Text className="text-sm font-semibold text-green-600">Ver mas</Text>
        </Pressable>
      </View>
    </>
  ), [user, dietaryTags, toggleDietaryTag, heroProduct, data, recentlyViewedItems]);

  // Solo muestra loading completo en primera carga
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

      {/* Refetching indicator */}
      {isFetching && data && (
        <View className="absolute top-16 left-0 right-0 items-center z-10">
          <View className="bg-white/90 rounded-full px-4 py-2 shadow-md">
            <ActivityIndicator size="small" />
          </View>
        </View>
      )}

      <FlatList
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
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
        contentContainerClassName="gap-3 w-full px-4 pb-32"
        columnWrapperClassName="gap-3"
        renderItem={renderItem}
        initialNumToRender={6}
        windowSize={7}
        maxToRenderPerBatch={6}
      />
    </SafeAreaView>
  );
}
