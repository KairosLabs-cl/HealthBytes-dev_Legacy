import HorizontalProductCard from "@/components/HorizontalProductCard";
import { Text } from "@/components/ui/text";
import { useFavoritesStore } from "@/store/favoritesStore";
import type { Product } from "@/types/product";
import { FlashList } from "@shopify/flash-list";
import { Heart } from "lucide-react-native";
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
    <View className="mx-4 mb-4 mt-4 rounded-[24px] border border-slate-200/70 bg-white px-4 pb-3 pt-4">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center rounded-2xl bg-rose-50">
            <Heart size={18} color="#e11d48" strokeWidth={2.4} />
          </View>
          <Text className="text-[17px] font-black tracking-[-0.2px] text-[#09090b]">
            Favoritos
          </Text>
        </View>
        <Pressable
          onPress={onSeeAll}
          className="h-11 justify-center rounded-2xl px-3"
          accessibilityRole="button"
          accessibilityLabel="Ver favoritos"
        >
          <Text className="text-sm font-bold text-zinc-600">Ver mas</Text>
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
