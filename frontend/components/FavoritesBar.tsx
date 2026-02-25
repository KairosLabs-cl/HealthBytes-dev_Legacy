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
    <View style={{ marginTop: 16, marginBottom: 16 }}>
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
          {"⭐ Favoritos"}
        </Text>
        <Pressable>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#16A34A" }}>Ver mas</Text>
        </Pressable>
      </View>
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
    </View>
  );
}
