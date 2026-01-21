import { ActivityIndicator, FlatList, ScrollView, View } from "react-native";
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
import { useState } from "react";
import { useRecentlyViewed } from "@/store/recentlyViewedStore";

export default function HomeScreen() {
  // se Cambio el estado para que termino de búsqueda se guarde en el estado y se pueda usar en la pagina
  const [searchTerm, setSearchTerm] = useState("");

  const { items: recentlyViewedItems } = useRecentlyViewed();

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["products", searchTerm], // se agrego searchTerm para re-fetch al buscar
    queryFn: () => listProducts(searchTerm), // Pasa término de búsqueda a la API
    // mantiene datos anteriores mientrss carga para evitar que desaparezcan
    placeholderData: (previousData) => previousData,
  });

  const numColumns = useBreakpointValue({
    default: 2,
    sm: 3,
    xl: 4,
  }) as number;

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

return (
  <>
    <Stack.Screen options={{ headerShown: false }} />

    <ScrollView className="flex-1 bg-white">
      {/*  Header ahora recibe callback para manejar búsqueda */}
      <Header userName="Francisco" onSearchChange={setSearchTerm} />

      {/* ahora no oculta el contenido mientras carga */}
      {isFetching && data && (
        <View className="px-4 py-2">
          <ActivityIndicator size="small" />
        </View>
      )}

      {/*  Oculta secciones cuando hay búsqueda activa */}
      {!searchTerm && (
        <>
          <View className="px-3">
            <FavoritesBar products={data} />
          </View>

          <View className="px-3">
              <RecentlyViewedBar items={recentlyViewedItems} />
          </View>
        </>
      )}

      <QuickFilters />

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