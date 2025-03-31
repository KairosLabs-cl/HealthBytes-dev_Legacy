import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { ProductCard, ProductProps } from './ProductCard';
import { ThemedText } from '@/components/ThemedText';

type ProductCarouselProps = {
  title: string;
  products: ProductProps[];
  onProductPress?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onFavorite?: (productId: string) => void;
};

export function ProductCarousel({
  title,
  products,
  onProductPress,
  onAddToCart,
  onFavorite,
}: ProductCarouselProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title} type="subtitle">{title}</ThemedText>
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            {...item}
            onPress={() => onProductPress?.(item.id)}
            onAddToCart={() => onAddToCart?.(item.id)}
            onFavorite={() => onFavorite?.(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
});