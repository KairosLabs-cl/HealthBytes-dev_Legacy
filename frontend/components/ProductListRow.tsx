import React from 'react';
import { View, Pressable, Alert } from 'react-native';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react-native';
import { formatPrice } from '@/lib/formatPrice';
import { useRouter } from 'expo-router';
import { useCart } from '@/store/cartStore';
import { Product } from '@/types/product';
import FavoriteButton from './FavoriteButton';
import Animated, { FadeIn } from 'react-native-reanimated';

interface ProductListRowProps {
  product: Product;
}

const ProductListRow: React.FC<ProductListRowProps> = ({ product }) => {
  const router = useRouter();
  const addProduct = useCart((state) => state.addProduct);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={{
        flexDirection: 'row',
        padding: 12,
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      {/* Product Image */}
      <Pressable
        onPress={() => router.push(`/product/${product.id}`)}
        style={{ width: 100, height: 100, borderRadius: 12, backgroundColor: '#F9FAFB', overflow: 'hidden', marginRight: 16 }}
      >
        <Image
          source={{ uri: product.image }}
          style={{ width: '100%', height: '100%' }}
          alt={product.name}
          resizeMode="contain"
        />
        <View style={{ position: 'absolute', top: 4, right: 4 }}>
          <FavoriteButton productId={product.id} size={18} />
        </View>
      </Pressable>

      {/* Product Details */}
      <View style={{ flex: 1 }}>
        <Pressable onPress={() => router.push(`/product/${product.id}`)}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 }} numberOfLines={1}>
            {product.name}
          </Text>
        </Pressable>

        <Text style={{ fontSize: 18, fontWeight: '800', color: '#000', marginBottom: 8 }}>
          {formatPrice(product.price)}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{
            backgroundColor: product.stock > 0 ? '#ECFDF5' : '#FEF2F2',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6
          }}>
            <Text style={{
              fontSize: 10,
              fontWeight: '700',
              color: product.stock > 0 ? '#059669' : '#DC2626'
            }}>
              {product.stock > 0 ? 'STOCK DISPONIBLE' : 'SIN STOCK'}
            </Text>
          </View>

          <Button
            size="sm"
            className="rounded-full bg-black h-9 px-4"
            onPress={() => {
              addProduct(product);
              Alert.alert("Éxito", "Añadido al carrito");
            }}
            disabled={product.stock === 0}
          >
            <ShoppingCart size={16} color="white" style={{ marginRight: 6 }} />
            <ButtonText className="text-white text-xs font-bold">COMPRAR</ButtonText>
          </Button>
        </View>
      </View>
    </Animated.View>
  );
};

export default ProductListRow;
