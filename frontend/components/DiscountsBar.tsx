import HorizontalProductCard from "@/components/HorizontalProductCard";
import { Text } from "@/components/ui/text";
import type { Product } from "@/types/product";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useMemo } from "react";
import { Pressable, View } from "react-native";

type Props = { products?: Product[]; limit?: number; onSeeAll?: () => void };

const cardKeyExtractor = (item: Product) => String(item.id);

export default function DiscountsBar({ products, limit = 8, onSeeAll }: Props) {
  const discounts = useMemo(() => {
    if (!products?.length) return [];
    return products.filter((p) => p.discount_percentage).slice(0, limit);
  }, [products, limit]);

  if (discounts.length === 0) {
    return null;
  }

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <HorizontalProductCard product={item} />,
    []
  );

  return (
    <View className="mt-4 mb-4 bg-gradient-to-b from-red-50 to-transparent rounded-2xl px-4 pt-4 pb-3 mx-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-[17px] font-bold text-ink">
          {"🛒 OFERTAS"}
        </Text>
        <Pressable
          onPress={onSeeAll}
          style={{ minHeight: 44, justifyContent: "center" }}
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
