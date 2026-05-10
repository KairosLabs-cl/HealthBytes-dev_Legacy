import HorizontalProductCard from "@/components/HorizontalProductCard";
import { Text } from "@/components/ui/text";
import { useFavoritesStore } from "@/store/favoritesStore";
import type { Product } from "@/types/product";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useMemo } from "react";
import { Pressable, View } from "react-native";

type Props = { products?: Product[]; limit?: number; onSeeAll?: () => void };

const cardKeyExtractor = (item: Product) => String(item.id);

export default function FavoritesBar({ products, limit = 8, onSeeAll }: Props) {
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);

  const favs = useMemo(() => {
    if (!products?.length) return [];
    return products
      .filter((p) => favoriteIds.has(Number(p.id)))
      .slice(0, limit);
  }, [products, limit, favoriteIds]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <HorizontalProductCard product={item} />,
    []
  );

  if (favs.length === 0) {
    return null;
  }

  return (
    <View className="mt-4 mb-4 bg-gradient-to-b from-amber-50 to-transparent rounded-2xl px-4 pt-4 pb-3 mx-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-[17px] font-bold text-ink">{"⭐ Favoritos"}</Text>
        <Pressable
          onPress={onSeeAll}
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <Text className="text-sm font-semibold text-amber-600">Ver mas</Text>
        </Pressable>
      </View>

      <FlashList<Product>
        horizontal
        data={favs}
        keyExtractor={cardKeyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        renderItem={renderItem}
        estimatedItemSize={222}
      />
    </View>
  );
}
