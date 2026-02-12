import { useCallback, useMemo } from "react";
import { View, FlatList, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import type { Product } from "@/types/product";
import HorizontalProductCard from "@/components/HorizontalProductCard";

type Props = { products?: Product[]; limit?: number };

const cardKeyExtractor = (item: Product) => String(item.id);

export default function FavoritesBar({ products, limit = 8 }: Props) {
  const favs = useMemo(() => (products?.length ? products.slice(0, limit) : []), [products, limit]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <HorizontalProductCard product={item} />,
    []
  );

  if (!favs.length) return null;

  return (
    <View className="mt-4 mb-4">
      <View className="px-4 flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-gray-900">
          {"⭐ Favoritos"}
        </Text>
        <Pressable>
          <Text className="text-sm font-semibold text-green-600">Ver mas</Text>
        </Pressable>
      </View>
      <FlatList
        horizontal
        data={favs}
        keyExtractor={cardKeyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4"
        renderItem={renderItem}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </View>
  );
}
