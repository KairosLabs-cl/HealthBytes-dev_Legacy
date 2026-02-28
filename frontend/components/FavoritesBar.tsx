import { useCallback, useMemo } from "react";
import { View, FlatList, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import type { Product } from "@/types/product";
import HorizontalProductCard from "@/components/HorizontalProductCard";

type Props = { products?: Product[]; limit?: number; onSeeAll?: () => void };

const cardKeyExtractor = (item: Product) => String(item.id);

export default function FavoritesBar({ products, limit = 8, onSeeAll }: Props) {
  const favs = useMemo(() => (products?.length ? products.slice(0, limit) : []), [products, limit]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <HorizontalProductCard product={item} />,
    []
  );

  return (
    <View className="mt-4 mb-4">
      <View className="px-4 flex-row items-center justify-between mb-3">
        <Text className="text-[17px] font-bold text-gray-900">
          {"⭐ Favoritos"}
        </Text>
        <Pressable onPress={onSeeAll} style={{ minHeight: 44, justifyContent: "center" }}>
          <Text className="text-sm font-semibold text-green-600">Ver mas</Text>
        </Pressable>
      </View>

      {favs.length > 0 ? (
        <FlatList
          horizontal
          data={favs}
          keyExtractor={cardKeyExtractor}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={renderItem}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
        />
      ) : (
        <View className="px-4 py-2.5">
          <Text className="text-gray-500 text-sm italic">
            Aún no tienes productos favoritos.
          </Text>
        </View>
      )}
    </View>
  );
}
