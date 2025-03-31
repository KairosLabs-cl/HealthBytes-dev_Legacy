import React from 'react';
import { StyleSheet, View, Pressable, Image, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ProductProps } from './ProductCard';

type CartItemProps = {
  product: ProductProps;
  quantity: number;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
};

export const CartItem = ({ product, quantity, onUpdateQuantity, onRemove }: CartItemProps) => {
  const accentColor = useThemeColor({}, 'accent');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = useThemeColor({}, 'error');
  
  return (
    <ThemedView style={[styles.container, { borderColor }]} lightColor={surfaceColor} darkColor={surfaceColor}>
      <Image source={product.imageUrl} style={styles.productImage} />
      
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName} numberOfLines={2}>
          {product.name}
        </ThemedText>
        
        <View style={styles.priceContainer}>
          {product.discount ? (
            <>
              <ThemedText style={styles.discountedPrice} lightColor={accentColor} darkColor={accentColor}>
                ${(product.price * (1 - product.discount / 100)).toFixed(2)}
              </ThemedText>
              <ThemedText style={styles.originalPrice}>
                ${product.price.toFixed(2)}
              </ThemedText>
            </>
          ) : (
            <ThemedText style={styles.price}>
              ${product.price.toFixed(2)}
            </ThemedText>
          )}
        </View>
        
        <View style={styles.quantityContainer}>
          <Pressable 
            style={styles.quantityButton} 
            onPress={() => onUpdateQuantity(Math.max(1, quantity - 1))}
          >
            <ThemedText style={styles.quantityButtonText}>-</ThemedText>
          </Pressable>
          
          <TextInput
            style={styles.quantityInput}
            value={quantity.toString()}
            onChangeText={(text) => {
              const newQuantity = parseInt(text.replace(/[^0-9]/g, '')) || 1;
              onUpdateQuantity(newQuantity);
            }}
            keyboardType="numeric"
          />
          
          <Pressable 
            style={styles.quantityButton}
            onPress={() => onUpdateQuantity(quantity + 1)}
          >
            <ThemedText style={styles.quantityButtonText}>+</ThemedText>
          </Pressable>
        </View>
      </View>
      
      <Pressable 
        style={styles.removeButton}
        onPress={onRemove}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <ThemedText style={{color: errorColor, fontSize: 24, fontWeight: 'bold'}}>×</ThemedText>
      </Pressable>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  priceContainer: {
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
    fontSize: 14,
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityInput: {
    width: 40,
    height: 30,
    textAlign: 'center',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  removeButton: {
    padding: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});