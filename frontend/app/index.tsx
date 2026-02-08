import { ActivityIndicator, FlatList, ScrollView, View, Image, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Text } from "@/components/ui/text";
import { useBreakpointValue } from "@/components/ui/utils/use-break-point-value";
import { listProducts } from "@/api/products";
import ProductListItem from "@/components/ProductListItem";
import FavoritesBar from "@/components/FavoritesBar";
import RecentlyViewedBar from "@/components/RecentlyViewedBar";
import { Header } from "@/components/Header";
import { Stack } from "expo-router";
import QuickFilters from "@/components/QuickFilters";
import SectionHeader from "@/components/SectionHeader";
import { useMemo, useState, useEffect } from "react";
import { useRecentlyViewed } from "@/store/recentlyViewedStore";
import { useProductFilters } from "@/store/productFiltersStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Product } from "@/types/product";
import { Apple } from "lucide-react-native";

const keyExtractor = (item: Product) => item.id.toString();

export default function HomeScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const { items: recentlyViewedItems } = useRecentlyViewed();
  const { dietaryTags, toggleDietaryTag } = useProductFilters();
  const { user } = useUser();
  const { getToken } = useAuth();
  const loadFavorites = useFavoritesStore((state) => state.loadFavorites);

  // Load favorites when user is authenticated
  useEffect(() => {
    if (user) {
      getToken().then((token) => {
        if (token) {
          loadFavorites(token);
        }
      });
    }
  }, [user]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["products", searchTerm, dietaryTags], // Re-fetch al cambiar búsqueda o filtros
    queryFn: () => listProducts({
      search: searchTerm || undefined,
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

  // Solo muestra loading completo en primera carga no durante búsqueda
  if (isLoading && !data) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator />
          <Text className="mt-4 text-gray-500">Cargando productos...</Text>
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center bg-white">
          <Text className="text-red-500">Error cargando productos</Text>
        </View>
      </>
    );
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const renderHeader = () => (
    <>
      {/* Header + búsqueda */}
      <Header userName={user?.firstName || user?.fullName || "Usuario"} onSearchChange={handleSearchChange} />

      {/* Chips de dietas */}
      <View className="px-4 pb-1 bg-white">
        <View className="flex-row flex-wrap gap-2 mt-2">
          {[
            { label: "Celiacos", tag: "sin-gluten" as const },
            { label: "Veganos", tag: "vegano" as const },
            { label: "Sin lactosa", tag: "sin-lactosa" as const },
            { label: "Bajo en azucar", tag: "bajo-en-azucar" as const }
          ].map(({ label, tag }) => {
            const isActive = dietaryTags.includes(tag);
            return (
              <Pressable
                key={label}
                onPress={() => toggleDietaryTag(tag)}
                className={`px-3 py-2 rounded-full border ${isActive ? 'bg-green-500 border-green-600' : 'bg-gray-100 border-gray-200'
                  }`}
              >
                <Text className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
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
            <Pressable className="mt-3 self-start bg-white rounded-full px-4 py-2">
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

      {/* Estado de carga mientras se re-fetch - MOVIDO AL TOP */}
      {isFetching && data && (
        <View className="absolute top-2 left-0 right-0 items-center z-10">
          <View className="bg-white/90 rounded-full px-4 py-2 shadow-md">
            <ActivityIndicator size="small" />
          </View>
        </View>
      )}

      {/* Secciones previas cuando no hay búsqueda */}
      {!searchTerm && (
        <>
          <FavoritesBar products={data} />
          <RecentlyViewedBar items={recentlyViewedItems} />
        </>
      )}

      <View className="mt-1">
        <SectionHeader icon={Apple} title="Para ti" />
        <QuickFilters />
      </View>
    </>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-center text-gray-500">
        {searchTerm ? "No se encontraron productos" : "No hay productos disponibles"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        key={numColumns}
        keyExtractor={keyExtractor}
        data={data}
        numColumns={numColumns}
        contentContainerClassName="gap-2 max-w-[960px] mx-auto w-full px-3 pb-32"
        columnWrapperClassName="gap-2"
        renderItem={({ item }) => <ProductListItem product={item} />}
      />
    </SafeAreaView>
  );
}