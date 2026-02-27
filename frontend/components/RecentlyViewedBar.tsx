import { useCallback } from "react";
import { View, FlatList, Pressable } from "react-native";
import { Clock } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import type { Product } from "@/types/product";
import HorizontalProductCard from "@/components/HorizontalProductCard";

type Props = { items?: Product[]; onSeeAll?: () => void };

const cardKeyExtractor = (item: Product) => String(item.id);

export default function RecentlyViewedBar({ items = [], onSeeAll }: Props) {
  const renderItem = useCallback(
    ({ item }: { item: Product }) => <HorizontalProductCard product={item} />,
    []
  );

  if (!items.length) {
    return (
      <View
        style={{
          marginHorizontal: 16,
          marginBottom: 16,
          backgroundColor: "#F9FAFB",
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 24,
          alignItems: "center",
        }}
      >
        <Clock size={28} color="#9CA3AF" style={{ marginBottom: 8 }} />
        <Text style={{ fontSize: 13, color: "#9CA3AF", fontWeight: "500" }}>
          Tus productos vistos apareceran aqui
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <View
        style={{
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 17, fontWeight: "700", color: "#111827" }}>
          {"👀 Vistos recientemente"}
        </Text>
        <Pressable onPress={onSeeAll}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#16A34A" }}>Ver mas</Text>
        </Pressable>
      </View>
      <FlatList
        horizontal
        data={items.slice(0, 10)}
        keyExtractor={cardKeyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={renderItem}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </View>
  );
}
