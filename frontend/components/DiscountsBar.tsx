import HorizontalProductCard from "@/components/HorizontalProductCard";
import { Text } from "@/components/ui/text";
import type { Product } from "@/types/product";
import { listDiscountedProducts } from "@/api/products";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { Pressable, View } from "react-native";

type Props = { limit?: number; onSeeAll?: () => void };

const cardKeyExtractor = (item: Product) => String(item.id);

export default function DiscountsBar({ limit = 8, onSeeAll }: Props) {
  const { data: discounts } = useQuery({
    queryKey: ["products", "discounts"],
    queryFn: () => listDiscountedProducts(0, limit),
    staleTime: 5 * 60 * 1000,
  });

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <HorizontalProductCard product={item} />,
    []
  );

  if (!discounts?.length) {
    return null;
  }

  return (
    <View className="mt-4 mb-4 bg-gradient-to-b from-red-50 to-transparent rounded-2xl px-4 pt-4 pb-3 mx-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-[17px] font-bold text-ink">{"🛒 OFERTAS"}</Text>
        <Pressable
          onPress={onSeeAll}
          style={{ minHeight: 44, justifyContent: "center" }}
          accessibilityRole="button"
          accessibilityLabel="Ver todos los productos en oferta"
        >
          <Text className="text-sm font-semibold text-gray-500">Ver mas</Text>
        </Pressable>
      </View>

      <FlashList<Product>
        horizontal
        data={discounts}
        keyExtractor={cardKeyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        renderItem={renderItem}
        estimatedItemSize={222}
      />
    </View>
  );
}
