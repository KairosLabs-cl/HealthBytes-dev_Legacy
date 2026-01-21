import React from "react";
import { View, FlatList, Image } from "react-native";
import { Text } from "@/components/ui/text";
import SectionHeader from "@/components/SectionHeader";
import type { Product } from "@/types/product";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";

type Props = { items?: Product[] };

function MiniItem({ product }: { product: Product }) {
  const router = useRouter();
  const price =
    typeof product.price === "number" ? product.price.toFixed(2) : product.price;

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <Pressable onPress={handlePress} className="w-24 items-center mr-3">
      <View className="w-24 h-24 rounded-2xl bg-white border border-neutral-200 shadow-sm mb-2 items-center justify-center overflow-hidden">
        <Image source={{ uri: product.image }} className="w-20 h-20" resizeMode="contain" />
      </View>
      <Text numberOfLines={2} className="text-[11px] text-neutral-700 text-center">
        {product.name}
      </Text>
      <Text className="text-[11px] font-semibold text-center mt-1">{price}</Text>
    </Pressable>
  );
}

export default function RecentlyViewedBar({ items = [] }: Props) {
  if (!items.length) return null;

  return (
    <View className="mb-2">
      <SectionHeader icon="time-outline" title="Vistos recientemente" />
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-3"
        renderItem={({ item }) => <MiniItem product={item} />}
      />
    </View>
  );
}
