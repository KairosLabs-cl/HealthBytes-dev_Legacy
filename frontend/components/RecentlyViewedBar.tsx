import HorizontalProductCard from "@/components/HorizontalProductCard";
import { Text } from "@/components/ui/text";
import { useRecentlyViewed } from "@/store/recentlyViewedStore";
import type { Product } from "@/types/product";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { FlatList, Pressable, View } from "react-native";

const cardKeyExtractor = (item: Product) => String(item.id);

export default function RecentlyViewedBar() {
  const { items } = useRecentlyViewed();
  const router = useRouter();

  const onSeeAll = useCallback(() => router.push("/recently-viewed"), [router]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <HorizontalProductCard product={item} />,
    []
  );

  if (!items.length) {
    return null;
  }

  return (
    <View className="mt-4 mb-4 bg-gradient-to-b from-blue-50 to-transparent rounded-2xl px-4 pt-4 pb-3 mx-4 border border-blue-100">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-[17px] font-bold text-gray-900">
          {"👀 Vistos recientemente"}
        </Text>
        <Pressable
          onPress={onSeeAll}
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <Text className="text-sm font-semibold text-blue-600">Ver mas</Text>
        </Pressable>
      </View>
      <FlatList
        horizontal
        data={items.slice(0, 10)}
        keyExtractor={cardKeyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        renderItem={renderItem}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </View>
  );
}
