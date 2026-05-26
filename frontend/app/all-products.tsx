import { FlashList } from "@shopify/flash-list";
import React, { memo, useCallback, useMemo, useState } from "react";
import { View, Pressable } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { useBreakpointValue } from "@/components/ui/utils/use-break-point-value";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/api/products";
import ProductCard from "@/components/ProductCard";
import DietaryFilterBar from "@/components/DietaryFilterBar";
import ProductCardSkeleton, { useShimmerStyle } from "@/components/ProductCardSkeleton";
import { RefreshCw, Package } from "lucide-react-native";
import { useProductFilters } from "@/store/productFiltersStore";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Product } from "@/types/product";

type SkeletonProductItem = { id: string; _isSkeleton: true };
type ProductListItem = Product | SkeletonProductItem;

const isSkeletonProductItem = (item: ProductListItem): item is SkeletonProductItem =>
  "_isSkeleton" in item;

// Stable memoized cell wrapper to prevent FlashList from re-creating the row
// wrapper on every render. Previously the inline renderItem created a new View
// on every call, breaking recycling.
const ProductCardCell = memo(function ProductCardCell({ product }: { product: Product }) {
  return (
    <View style={{ flex: 1, padding: 6 }}>
      <ProductCard product={product} width="full" />
    </View>
  );
});
ProductCardCell.displayName = "ProductCardCell";

const SkeletonCell = memo(function SkeletonCell({
  shimmerStyle,
}: {
  shimmerStyle: ReturnType<typeof useShimmerStyle>;
}) {
  return (
    <View style={{ flex: 1, padding: 6 }}>
      <ProductCardSkeleton shimmerStyle={shimmerStyle} />
    </View>
  );
});
SkeletonCell.displayName = "SkeletonCell";

const keyExtractor = (item: ProductListItem) => item.id.toString();

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
    md: 4,
    lg: 5,
  }) as number;

  const shimmerStyle = useShimmerStyle();

  const renderItem = useCallback(
    ({ item }: { item: ProductListItem }) => {
      if (isSkeletonProductItem(item)) {
        return <SkeletonCell shimmerStyle={shimmerStyle} />;
      }
      return <ProductCardCell product={item} />;
    },
    [shimmerStyle]
  );

  const skeletonData = useMemo<SkeletonProductItem[]>(
    () => Array.from({ length: 12 }).map((_, i) => ({ id: `skeleton-${i}`, _isSkeleton: true })),
    []
  );

  const listHeader = useMemo(
    () => (
      <>
        <DietaryFilterBar
          dietaryTags={dietaryTags}
          toggleDietaryTag={toggleDietaryTag}
        />
        <View className="mt-4 mb-3 flex-row items-center justify-between px-4">
          <Text className="text-lg font-black tracking-[-0.2px] text-[#09090b]">
            {dietaryTags.length > 0
              ? "Productos filtrados"
              : "Todo el catalogo"}
          </Text>
          {dietaryTags.length > 0 && (
            <Pressable
              onPress={clearFilters}
              style={{ minHeight: 44, justifyContent: "center" }}
              accessibilityRole="button"
              accessibilityLabel="Limpiar filtros"
            >
              <Text className="text-sm font-bold text-emerald-600">
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
    <View className="flex-1 bg-[#fafafa]">
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
            className="flex-row items-center gap-2 rounded-2xl bg-[#09090b] px-6 py-3"
            style={{ minHeight: 48 }}
            accessibilityRole="button"
            accessibilityLabel="Reintentar cargar productos"
          >
            <RefreshCw size={18} color="white" />
            <Text className="text-white font-bold">Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-1">
          <FlashList<ProductListItem>
            data={isLoading ? skeletonData : products}
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
                <View className="items-start rounded-[28px] border border-slate-200/70 bg-white p-6">
                  <View className="mb-5 h-14 w-14 items-center justify-center rounded-[22px] bg-slate-100">
                    <Package size={28} color="#09090b" />
                  </View>
                  <Text className="text-base leading-6 text-zinc-600">
                    {dietaryTags.length > 0
                      ? "No hay productos para estos filtros"
                      : "No hay productos disponibles por ahora."}
                  </Text>
                  {dietaryTags.length > 0 && (
                    <Pressable
                      onPress={clearFilters}
                      className="mt-4 rounded-2xl bg-[#09090b] px-6 py-3"
                      style={{ minHeight: 48 }}
                      accessibilityRole="button"
                      accessibilityLabel="Ver todos los productos"
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
