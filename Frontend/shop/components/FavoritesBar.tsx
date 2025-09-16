// components/FavoritesBar.tsx
import React, { useMemo } from "react";
import { View, FlatList } from "react-native";
import { Text } from "@/components/ui/text";
import ProductListItem from "@/components/ProductListItem";
import type { Product } from "@/types/product";

type Props = {
  products?: Product[]; // productos actuales del query
  limit?: number;       // opcional, por si quieres cambiar cuantos muestras
};

export default function FavoritesBar({ products, limit = 2 }: Props) {
  // Por ahora: "favoritos" = primeros N productos disponibles.
  const favs = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.slice(0, limit);
  }, [products, limit]);

  if (!favs.length) return null;

  return (
    <View className="mb-4">
      <Text className="text-xl font-bold mb-2">⭐ Favoritos</Text>

      <FlatList
        horizontal
        data={favs}
        keyExtractor={(item) => String(item.id)} // id puede ser number | string
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
        renderItem={({ item }) => (
          // Reutilizo tu tarjeta. La meto en un contenedor con ancho fijo para carrusel.
          <View className="w-48">
            <ProductListItem product={item} />
          </View>
        )}
      />
    </View>
  );
}
