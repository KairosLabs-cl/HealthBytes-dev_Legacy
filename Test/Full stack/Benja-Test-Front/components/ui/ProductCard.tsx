import React from 'react';
import { StyleSheet, Image, Pressable, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from './IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ProductProps = {
  id: string;
  name: string;
  price: number;
  imageUrl: any;
  rating?: number;
  discount?: number;
  onPress?: () => void;
  onAddToCart?: () => void;
  onFavorite?: () => void;
};

export function ProductCard({
  name,
  price,
  imageUrl,
  rating = 0,
  discount = 0,
  onPress,
  onAddToCart,
  onFavorite,
}: ProductProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const formattedPrice = `$${price.toFixed(2)}`;
  const discountedPrice = discount > 0 ? `$${(price * (1 - discount / 100)).toFixed(2)}` : null;
  
  return (
    <Pressable onPress={onPress}>
      <ThemedView style={styles.container} lightColor={surfaceColor} darkColor={surfaceColor}>
        <View style={styles.imageContainer}>
          <Image source={imageUrl} style={styles.image} />
          {discount > 0 && (
            <View style={[styles.discountBadge, { backgroundColor: accentColor }]}>
              <ThemedText style={styles.discountText} lightColor="#FFFFFF" darkColor="#FFFFFF">
                -{discount}%
              </ThemedText>
            </View>
          )}
          <Pressable style={styles.favoriteButton} onPress={onFavorite}>
            <IconSymbol name="heart.fill" size={18} color={textSecondaryColor} />
          </Pressable>
        </View>
        
        <View style={styles.infoContainer}>
          <ThemedText style={styles.productName} numberOfLines={2}>{name}</ThemedText>
          
          <View style={styles.priceRow}>
            {discountedPrice ? (
              <>
                <ThemedText style={styles.discountedPrice} lightColor={accentColor} darkColor={accentColor}>
                  {discountedPrice}
                </ThemedText>
                <ThemedText style={styles.originalPrice} lightColor={textSecondaryColor} darkColor={textSecondaryColor}>
                  {formattedPrice}
                </ThemedText>
              </>
            ) : (
              <ThemedText style={styles.price}>{formattedPrice}</ThemedText>
            )}
          </View>
          
          {rating > 0 && (
            <View style={styles.ratingContainer}>
              <IconSymbol name="star.fill" size={14} color="#FFD700" />
              <ThemedText style={styles.ratingText}>{rating.toFixed(1)}</ThemedText>
            </View>
          )}
          
          <Pressable 
            style={[styles.addToCartButton, { backgroundColor: primaryColor }]}
            onPress={onAddToCart}
          >
            <IconSymbol name="cart.fill" size={16} color="#FFFFFF" />
            <ThemedText style={styles.addToCartText} lightColor="#FFFFFF" darkColor="#FFFFFF">
              Add
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    width: 160,
    marginRight: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    height: 40,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: 6,
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});