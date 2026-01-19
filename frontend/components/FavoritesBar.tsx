import React, { useMemo } from "react";
import { View, FlatList, Image } from "react-native";
import { Text } from "@/components/ui/text";
import SectionHeader from "@/components/SectionHeader";
import type { Product } from "@/types/product";

type Props = { products?: Product[]; limit?: number };

function FavoriteCard({ product }: { product: Product }) {
  const price =
    typeof product.price === "number" ? product.price.toFixed(2) : product.price;

  return (
    <View className="w-60 mr-10">
      <View className="rounded-3xl bg-white border border-neutral-200 p-3 shadow-sm">
        <Image
          source={{ uri: product.image }}
          className="w-full h-40 rounded-2xl"
          resizeMode="contain"
        />
      </View>

      <Text numberOfLines={2} className="mt-2 text-[13px] text-neutral-700">
        {product.name}
      </Text>
      <Text className="mt-1 text-[18px] font-extrabold">{price}</Text>
    </View>
  );
}

export default function FavoritesBar({ products, limit = 8 }: Props) {
  const favs = useMemo(() => (products?.length ? products.slice(0, limit) : []), [products, limit]);
  if (!favs.length) return null;

  return (
    <View className="mt-2 mb-4">
      <SectionHeader icon="star" title="Favoritos" />
      <FlatList
        horizontal
        data={favs}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-3"
        renderItem={({ item }) => <FavoriteCard product={item} />}
      />
    </View>
  );
}
