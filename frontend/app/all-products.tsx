import { FlashList } from "@shopify/flash-list";
import { useCallback, useMemo, useState } from "react";
import { View, Pressable } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { useBreakpointValue } from "@/components/ui/utils/use-break-point-value";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/api/products";
import ProductCard from "@/components/ProductCard";
import DietaryFilterBar from "@/components/DietaryFilterBar";
import { RefreshCw, Package } from "lucide-react-native";
import { useProductFilters } from "@/store/productFiltersStore";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Product } from "@/types/product";

const keyExtractor = (item: Product) => item.id.toString();

export default function AllProductsScreen() {
  // ⚡ Bolt: Granular selectors to prevent re-renders when other filter state changes
  const dietaryTags = useProductFilters((state) => state.dietaryTags);
  const toggleDietaryTag = useProductFilters((state) => state.toggleDietaryTag);
  const clearFilters = useProductFilters((state) => state.clearFilters);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useQuery<Product[]>({
    queryKey: ["products", dietaryTags] as const,
    queryFn: () =>
      listProducts({
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
      <View
        style={{
          flex: 1,
          padding: 4,
        }}
      >
        <ProductCard product={item} width="full" />
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
            {dietaryTags.length > 0
              ? "Productos filtrados"
              : "Todo el catalogo"}
          </Text>
          {dietaryTags.length > 0 && (
            <Pressable
              onPress={clearFilters}
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <Text className="text-sm font-semibold text-green-600">
                Limpiar
              </Text>
            </Pressable>
          )}
        </View>
      </>
    ),
    [dietaryTags, toggleDietaryTag, clearFilters]
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenHeader
        title="Todos los productos"
        icon={Package}
        showBackButton={true}
      />

      {error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 mb-4">
            No se pudieron cargar los productos.
          </Text>
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
        <View key={numColumns} className="flex-1">
          <FlashList<Product>
            data={isLoading ? [] : products}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={numColumns}
            ListHeaderComponent={listHeader}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 128,
            }}
            showsVerticalScrollIndicator={false}
            estimatedItemSize={280}
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
                      <Text className="text-white font-semibold">
                        Ver todos
                      </Text>
                    </Pressable>
                  )}
                </View>
              )
            }
          />
        </View>
      )}
    </View>
  );
}
