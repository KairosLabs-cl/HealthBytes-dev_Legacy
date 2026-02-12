import { Stack, useLocalSearchParams } from 'expo-router';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '@/api/products';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { useCart } from '@/store/cartStore';
import { useRecentlyViewed } from '@/store/recentlyViewedStore';
import { useEffect, useMemo } from 'react';
import { ShoppingCart, RefreshCw } from 'lucide-react-native';
import { formatPrice } from '@/lib/formatPrice';
import { DietaryBadgeList } from '@/components/DietaryBadge';
import FavoriteButton from '@/components/FavoriteButton';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useShimmerStyle } from '@/components/ProductCardSkeleton';

function ProductDetailSkeleton() {
  const shimmer = useShimmerStyle();

  return (
    <View className="flex-1 bg-white">
      {/* Image placeholder */}
      <Animated.View className="bg-gray-50 items-center justify-center py-8" style={shimmer}>
        <View className="w-full h-80" />
      </Animated.View>

      <View className="px-5 py-6">
        {/* Badges */}
        <View className="flex-row gap-2 mb-3">
          <Animated.View className="h-6 w-20 bg-gray-200 rounded-full" style={shimmer} />
          <Animated.View className="h-6 w-24 bg-gray-200 rounded-full" style={shimmer} />
        </View>

        {/* Title */}
        <Animated.View className="h-7 bg-gray-200 rounded w-3/4 mb-3" style={shimmer} />

        {/* Price */}
        <Animated.View className="h-9 bg-gray-200 rounded w-1/3 mb-6" style={shimmer} />

        {/* Stock */}
        <Animated.View className="h-4 bg-gray-200 rounded w-1/2 mb-6" style={shimmer} />

        {/* CTA */}
        <View className="flex-row gap-3 mb-6">
          <Animated.View className="w-12 h-12 rounded-full bg-gray-200" style={shimmer} />
          <Animated.View className="flex-1 h-12 rounded-full bg-gray-200" style={shimmer} />
        </View>

        {/* Description */}
        <Animated.View className="h-4 bg-gray-200 rounded w-full mb-2" style={shimmer} />
        <Animated.View className="h-4 bg-gray-200 rounded w-5/6 mb-2" style={shimmer} />
        <Animated.View className="h-4 bg-gray-200 rounded w-2/3" style={shimmer} />
      </View>
    </View>
  );
}

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const addProduct = useCart((state) => state.addProduct);
  const cartItems = useCart((state) => state.items);
  const ctaScale = useSharedValue(1);

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchProductById(Number(id)),
  });

  useEffect(() => {
    if (product) {
      useRecentlyViewed.getState().add(product);
    }
  }, [product]);

  const currentInCart = useMemo(
    () => cartItems.find(i => i.product.id === product?.id)?.quantity || 0,
    [cartItems, product?.id]
  );

  const canAddToCart = product ? product.stock > 0 && currentInCart < product.stock : false;

  const addToCart = async () => {
    ctaScale.value = withTiming(0.97, { duration: 80, easing: Easing.out(Easing.ease) }, () => {
      ctaScale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
    });

    try {
      const updatedProduct = await fetchProductById(Number(id));
      const cartQty = cartItems.find(i => i.product.id === updatedProduct.id)?.quantity || 0;

      if (cartQty + 1 > updatedProduct.stock) {
        Alert.alert(
          "Stock insuficiente",
          `Solo quedan ${updatedProduct.stock} unidades disponibles.`
        );
        return;
      }

      addProduct(updatedProduct);
    } catch (err) {
      Alert.alert("Error", "No se pudo verificar el stock. Intenta nuevamente.");
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: '', headerShown: true }} />
        <ProductDetailSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: '', headerShown: true }} />
        <View className="flex-1 items-center justify-center bg-white px-6">
          <Text className="text-red-500 text-lg mb-4">Producto no encontrado</Text>
          <Pressable
            onPress={() => refetch()}
            className="flex-row items-center gap-2 bg-black px-6 py-3 rounded-full"
            style={{ minHeight: 44 }}
          >
            <RefreshCw size={18} color="white" />
            <Text className="text-white font-bold">Reintentar</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: product.name, headerShown: true }} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero Image */}
        <Animated.View entering={FadeIn.duration(400)} className="bg-gray-50 items-center justify-center py-8">
          <Image
            source={{ uri: product.image }}
            className="w-full h-80"
            alt={`${product.name} image`}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Product Info */}
        <View className="px-5 py-6">
          {/* Badges - Dynamic from API */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <DietaryBadgeList tags={product.dietary_tags} />
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)}>
            <Text className="text-2xl font-bold text-gray-900 mb-4">
              {product.name}
            </Text>
          </Animated.View>

          {/* Price */}
          <Animated.View entering={FadeInUp.delay(300).duration(400)}>
            <Text className="text-3xl font-extrabold text-gray-900 mb-6">
              {formatPrice(product.price)}
            </Text>
          </Animated.View>

          {/* Stock Info */}
          <Animated.View entering={FadeInUp.delay(350).duration(400)} className="flex-row items-center mb-6">
            <View className={`w-2 h-2 rounded-full mr-2 ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className="text-sm font-medium text-gray-600">
              {product.stock > 0
                ? `${product.stock} unidades disponibles`
                : 'Agotado'}
            </Text>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)} className="flex-row gap-3 mb-6">
            <View className="w-12 h-12 rounded-full border border-gray-300 items-center justify-center">
              <FavoriteButton productId={Number(id)} size={22} />
            </View>

            <Animated.View style={ctaAnimatedStyle} className="flex-1">
              <Pressable
                onPress={addToCart}
                disabled={!canAddToCart}
                className={`flex-1 h-12 rounded-full items-center justify-center flex-row gap-2 active:opacity-80 ${canAddToCart ? 'bg-black' : 'bg-gray-300'}`}
                style={{ minHeight: 48 }}
              >
                <ShoppingCart size={20} color={canAddToCart ? "white" : "#9CA3AF"} />
                <Text className={`font-semibold text-base ${canAddToCart ? "text-white" : "text-gray-500"}`}>
                  {product.stock === 0
                    ? 'Agotado'
                    : currentInCart >= product.stock
                      ? 'Maximo alcanzado'
                      : 'Agregar al carrito'}
                </Text>
              </Pressable>
            </Animated.View>
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInUp.delay(450).duration(400)} className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-2">
              Descripcion
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              {product.description || 'Producto de alta calidad especialmente seleccionado para personas con restricciones alimentarias. Ingredientes cuidadosamente verificados para garantizar su seguridad.'}
            </Text>
          </Animated.View>

          {/* Nutritional Info */}
          {product.nutritional_info && (() => {
            try {
              const nutrition = JSON.parse(product.nutritional_info);
              return (
                <Animated.View entering={FadeInUp.delay(500).duration(400)} className="mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <Text className="text-base font-semibold text-gray-900 mb-3">
                    Informacion nutricional
                  </Text>
                  <View className="gap-2">
                    <View className="flex-row justify-between py-1 border-b border-gray-100">
                      <Text className="text-sm text-gray-600">Calorias</Text>
                      <Text className="text-sm font-medium text-gray-900">{nutrition.calories} kcal</Text>
                    </View>
                    <View className="flex-row justify-between py-1 border-b border-gray-100">
                      <Text className="text-sm text-gray-600">Proteinas</Text>
                      <Text className="text-sm font-medium text-gray-900">{nutrition.protein}g</Text>
                    </View>
                    <View className="flex-row justify-between py-1 border-b border-gray-100">
                      <Text className="text-sm text-gray-600">Carbohidratos</Text>
                      <Text className="text-sm font-medium text-gray-900">{nutrition.carbs}g</Text>
                    </View>
                    <View className="flex-row justify-between py-1">
                      <Text className="text-sm text-gray-600">Grasas</Text>
                      <Text className="text-sm font-medium text-gray-900">{nutrition.fat}g</Text>
                    </View>
                  </View>
                </Animated.View>
              );
            } catch (e) {
              return null;
            }
          })()}
        </View>
      </ScrollView>
    </View>
  );
}