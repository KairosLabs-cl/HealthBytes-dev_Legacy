import React from "react";
import { View, FlatList, Image } from "react-native";
import { Text } from "@/components/ui/text";
import SectionHeader from "@/components/SectionHeader";
import type { Product } from "@/types/product";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { formatPrice } from "@/lib/formatPrice";

type Props = { items?: Product[] };

function RecentlyViewedCard({ product }: { product: Product }) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <Pressable onPress={handlePress}>
      <View className="w-60 mr-10">
        <View className="rounded-3xl bg-white border border-neutral-200 p-3 shadow-sm">
          <Image
            source={{ uri: product.image }}
            className="w-full h-40 rounded-2xl"
            resizeMode="contain"
          />
        </View>

        <Text className="mt-2 text-[13px] text-white">
          {product.name}
        </Text>
        <Text className="mt-1 text-[18px] font-extrabold text-white">{formatPrice(product.price)}</Text>
      </View>
    </Pressable>
  );
}

export default function RecentlyViewedBar({ items = [] }: Props) {
  if (!items.length) return null;

  return (
    <View style={{ marginBottom: 16 }}>
      <View className="bg-[#1a1a1a] rounded-3xl mx-3 overflow-hidden">
        <View className="px-3 pt-3 pb-4">
          <SectionHeader icon="time-outline" title="Vistos recientemente" lightText />
          <FlatList
            horizontal
            data={items}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-1"
            renderItem={({ item }) => <RecentlyViewedCard product={item} />}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
          />
        </View>
      </View>
    </View>
  );
}
