import { useCallback } from "react";
import { View, FlatList, Pressable } from "react-native";
import { Clock } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import type { Product } from "@/types/product";
import HorizontalProductCard from "@/components/HorizontalProductCard";

type Props = { items?: Product[] };

const cardKeyExtractor = (item: Product) => String(item.id);

export default function RecentlyViewedBar({ items = [] }: Props) {
  const renderItem = useCallback(
    ({ item }: { item: Product }) => <HorizontalProductCard product={item} />,
    []
  );

  if (!items.length) {
    return (
      <View className="mx-4 mb-4 bg-gray-50 rounded-2xl px-4 pt-4 pb-6 items-center">
        <Clock size={28} color="#9CA3AF" style={{ marginBottom: 8 }} />
        <Text className="text-sm text-gray-400 font-medium">Tus productos vistos apareceran aqui</Text>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <View className="px-4 flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-gray-900">
          {"👀 Vistos recientemente"}
        </Text>
        <Pressable>
          <Text className="text-sm font-semibold text-green-600">Ver mas</Text>
        </Pressable>
      </View>
      <FlatList
        horizontal
        data={items}
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
