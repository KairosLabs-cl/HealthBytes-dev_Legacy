import { FlatList, ScrollView, View, Image, Pressable } from "react-native";
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
import { useMemo, useState, useCallback } from "react";
import { useRecentlyViewed } from "@/store/recentlyViewedStore";
import { ProductListSkeleton } from "@/components/layout/SkeletonLoader";
import { SafeAreaWrapper } from "@/components/layout/SafeAreaWrapper";

export default function HomeScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const { items: recentlyViewedItems } = useRecentlyViewed();

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", searchTerm],
    queryFn: () => listProducts(searchTerm),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
  });

  const numColumns = useBreakpointValue({
    default: 2,
    sm: 3,
    xl: 4,
  }) as number;

  const heroProduct = useMemo(() => data?.[0], [data]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Loading state with skeleton
  if (isLoading && !data) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaWrapper className="flex-1 bg-gray-50">
          <Header userName="Francisco" onSearchChange={handleSearchChange} />
          <ProductListSkeleton count={6} numColumns={numColumns} />
        </SafeAreaWrapper>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaWrapper className="flex-1 items-center justify-center bg-white px-6">
          <Text className="text-lg font-bold text-gray-900 mb-2">
            Error al cargar productos
          </Text>
          <Text className="text-center text-gray-600 mb-4">
            No pudimos cargar los productos. Por favor, intenta nuevamente.
          </Text>
          <Pressable 
            className="bg-black px-6 py-3 rounded-lg active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Reintentar carga de productos"
          >
            <Text className="text-white font-semibold">Reintentar</Text>
          </Pressable>
        </SafeAreaWrapper>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
        {/* Header + búsqueda */}
        <Header userName="Francisco" onSearchChange={handleSearchChange} />

        {/* Chips de dietas */}
        <View className="px-4 pb-1 bg-white">
          <View className="flex-row flex-wrap gap-2 mt-2">
            {["Celiacos", "Veganos", "Sin lactosa", "Bajo en azucar"].map((label) => (
              <Pressable
                key={label}
                className="px-3 py-2 rounded-full bg-gray-100 border border-gray-200 active:bg-gray-200"
                accessibilityRole="button"
                accessibilityLabel={`Filtrar por ${label}`}
              >
                <Text className="text-xs font-medium text-gray-700">{label}</Text>
              </Pressable>
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
                className="mt-3 self-start bg-white rounded-full px-4 py-2 active:opacity-80"
                accessibilityRole="button"
                accessibilityLabel="Ver colección de snacks sin gluten"
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

        {/* Secciones previas cuando no hay búsqueda */}
        {!searchTerm && (
          <>
            <View className="px-3 mt-4">
              <FavoritesBar products={data} />
            </View>

            <View className="px-3">
              <RecentlyViewedBar items={recentlyViewedItems} />
            </View>
          </>
        )}

        <View className="mt-1">
          <SectionHeader icon="leaf-outline" title="Para ti" />
          <QuickFilters />
        </View>

        {data && data.length > 0 ? (
          <FlatList
            key={numColumns}
            data={data}
            numColumns={numColumns}
            scrollEnabled={false}
            contentContainerClassName="gap-2 max-w-[960px] mx-auto w-full px-3 pb-8"
            columnWrapperClassName="gap-2"
            renderItem={({ item }) => <ProductListItem product={item} />}
          />
        ) : (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-center text-gray-500">
              {searchTerm ? "No se encontraron productos" : "No hay productos disponibles"}
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}