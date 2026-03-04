import { useCallback, useMemo, useState } from "react";
import { View, FlatList, Pressable } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { useBreakpointValue } from "@/components/ui/utils/use-break-point-value";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/api/products";
import ProductListItem from "@/components/ProductListItem";
import DietaryFilterBar from "@/components/DietaryFilterBar";
import { Header } from "@/components/Header";
import { RefreshCw, Package } from "lucide-react-native";
import { useProductFilters, DietaryTag } from "@/store/productFiltersStore";
import { useUser } from "@clerk/clerk-expo";
import { Product } from "@/types/product";

const keyExtractor = (item: Product) => item.id.toString();

export default function AllProductsScreen() {
  const { dietaryTags, toggleDietaryTag, clearFilters } = useProductFilters();
  const { user } = useUser();
  const userName = user?.firstName || user?.fullName || "Usuario";
  const [refreshing, setRefreshing] = useState(false);

  const { data: products, isLoading, error, refetch } = useQuery<Product[]>({
    queryKey: ["products", dietaryTags] as const,
    queryFn: () => listProducts({
      dietary: dietaryTags.length > 0 ? dietaryTags : undefined,
    }),
    placeholderData: (prev) => prev,
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

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <View style={{ width: numColumns === 2 ? "50%" : numColumns === 3 ? "33.33%" : "25%" }}>
        <ProductListItem product={item} />
      </View>
    ),
    [numColumns]
  );

  const listHeader = useMemo(
    () => (
      <>
        <DietaryFilterBar
          dietaryTags={dietaryTags}
          toggleDietaryTag={toggleDietaryTag}
        />
        <View className="px-4 flex-row items-center justify-between mt-4 mb-2">
          <Text className="text-lg font-bold text-gray-900">
            {dietaryTags.length > 0 ? "Productos filtrados" : "Todo el catalogo"}
          </Text>
          {dietaryTags.length > 0 && (
            <Pressable
              onPress={clearFilters}
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <Text className="text-sm font-semibold text-green-600">Limpiar</Text>
            </Pressable>
          )}
        </View>
      </>
    ),
    [dietaryTags, toggleDietaryTag, clearFilters]
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      <Header userName={userName} showBackButton={true} />

      {error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 mb-4">No se pudieron cargar los productos.</Text>
          <Pressable
            onPress={() => refetch()}
            className="flex-row items-center gap-2 bg-black px-6 py-3 rounded-full"
            style={{ minHeight: 44 }}
          >
            <RefreshCw size={18} color="white" />
            <Text className="text-white font-bold">Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={isLoading ? [] : products}
          renderItem={renderItem}
          key={numColumns}
          keyExtractor={keyExtractor}
          numColumns={numColumns}
          ListHeaderComponent={listHeader}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          contentContainerClassName="gap-2 max-w-[960px] mx-auto w-full px-4 pb-32"
          columnWrapperClassName="gap-2"
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          windowSize={7}
          maxToRenderPerBatch={12}
          ListEmptyComponent={
            isLoading ? null : (
              <View className="items-center justify-center py-20">
                <Package size={48} color="#D1D5DB" />
                <Text className="text-gray-400 mt-4 text-center">
                  {dietaryTags.length > 0
                    ? "No hay productos para estos filtros"
                    : "No hay productos disponibles por ahora."}
                </Text>
                {dietaryTags.length > 0 && (
                  <Pressable
                    onPress={clearFilters}
                    className="mt-4 bg-black rounded-full px-6 py-3"
                    style={{ minHeight: 44 }}
                  >
                    <Text className="text-white font-semibold">Ver todos</Text>
                  </Pressable>
                )}
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
