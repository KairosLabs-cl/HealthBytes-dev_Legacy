import HorizontalProductCard from "@/components/HorizontalProductCard";
import { Text } from "@/components/ui/text";
import { useRecentlyViewed } from "@/store/recentlyViewedStore";
import type { Product } from "@/types/product";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Eye } from "lucide-react-native";
import { useCallback } from "react";
import { Pressable, View } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";

const cardKeyExtractor = (item: Product) => String(item.id);

export default function RecentlyViewedBar() {
  // ⚡ Bolt: Granular selector to prevent unnecessary re-renders when other state changes
  const items = useRecentlyViewed((state) => state.items);
  const router = useRouter();
  const { palette } = useAppTheme();

  const onSeeAll = useCallback(() => router.push("/recently-viewed"), [router]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <HorizontalProductCard product={item} />,
    []
  );

  if (!items.length) {
    return null;
  }

  return (
    <View className="mx-4 mb-4 mt-4 rounded-[24px] border border-border-subtle bg-surface-card px-4 pb-3 pt-4">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center rounded-2xl bg-surface-muted">
            <Eye size={18} color={palette.colors.icon.primary} strokeWidth={2.4} />
          </View>
          <Text className="text-[17px] font-black tracking-[-0.2px] text-ink">
            Vistos recientemente
          </Text>
        </View>
        <Pressable
          onPress={onSeeAll}
          className="h-11 justify-center rounded-2xl px-3"
          accessibilityRole="button"
          accessibilityLabel="Ver productos vistos recientemente"
        >
          <Text className="text-sm font-bold text-ink-muted">Ver mas</Text>
        </Pressable>
      </View>
      <FlashList<Product>
        horizontal
        data={items.slice(0, 10)}
        keyExtractor={cardKeyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        renderItem={renderItem}
        estimatedItemSize={222}
      />
    </View>
  );
}
