import React from "react";
import { View, FlatList, Image, useWindowDimensions } from "react-native";
import { Text } from "@/components/ui/text";
import SectionHeader from "@/components/SectionHeader";
import type { Product } from "@/types/product";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";

type Props = { items?: Product[] };

function MiniItem({ product, itemWidth }: { product: Product; itemWidth: number }) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <Pressable onPress={handlePress} style={{ width: itemWidth, alignItems: 'center', marginRight: 8 }}>
      <View style={{
        width: itemWidth - 4,
        height: itemWidth - 4,
        borderRadius: 12,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e5e5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 1,
        elevation: 1,
        marginBottom: 4,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <Image
          source={{ uri: product.image }}
          style={{ width: itemWidth - 16, height: itemWidth - 16 }}
          resizeMode="contain"
        />
      </View>
      <Text style={{
        fontWeight: '500',
        fontSize: 11,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 2,
        maxWidth: itemWidth - 4
      }}>
        {product.name}
      </Text>
    </Pressable>
  );
}

export default function RecentlyViewedBar({ items = [] }: Props) {
  const { width: screenWidth } = useWindowDimensions();

  if (!items.length) return null;

  // Calcular dimensiones dinámicas - más compacto
  const paddingHorizontal = 20; // Menos padding
  const availableWidth = screenWidth - paddingHorizontal;
  const minItemWidth = 70; // Más pequeño para caber más
  const maxItemWidth = 85; // Máximo más pequeño
  const spacing = 8; // Menos espacio entre items

  // Calcular cuántos items caben
  const maxItems = Math.floor((availableWidth + spacing) / (minItemWidth + spacing));

  // Limitar entre 3-6 items dependiendo del espacio
  const itemsToShow = Math.min(items.length, Math.max(3, Math.min(maxItems, 6)));

  // Calcular ancho óptimo para los items
  const totalSpacing = (itemsToShow - 1) * spacing;
  const itemWidth = Math.min(maxItemWidth, Math.max(minItemWidth, (availableWidth - totalSpacing) / itemsToShow));

  // Tomar solo los items que vamos a mostrar
  const displayedItems = items.slice(0, itemsToShow);

  return (
    <View style={{ marginBottom: 12 }}>
      <SectionHeader icon="time-outline" title="Vistos recientemente" />
      <FlatList
        horizontal
        data={displayedItems}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingVertical: 2
        }}
        renderItem={({ item }) => <MiniItem product={item} itemWidth={itemWidth} />}
        // Optimizar rendimiento
        initialNumToRender={itemsToShow}
        maxToRenderPerBatch={itemsToShow}
        windowSize={3}
      />
    </View>
  );
}
