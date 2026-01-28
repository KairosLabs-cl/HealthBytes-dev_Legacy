import { Stack, useLocalSearchParams } from 'expo-router';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '@/api/products';
import { ActivityIndicator, View, ScrollView, Pressable } from 'react-native';
import { useCart } from '@/store/cartStore';
import { useRecentlyViewed } from '@/store/recentlyViewedStore';
import { useEffect } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react-native';
import { formatPrice } from '@/lib/formatPrice';


export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const addProduct = useCart((state) => state.addProduct);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchProductById(Number(id)),
  });
  // Después de la declaración de product:
  useEffect(() => {
    if (product) {
      useRecentlyViewed.getState().add(product);
    }
  }, [product]);

  const addToCart = () => {
    addProduct(product);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-gray-500">Cargando producto...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500 text-lg">Producto no encontrado</Text>
      </View>
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
        <View className="bg-gray-50 items-center justify-center py-8">
          <Image
            source={{ uri: product.image }}
            className="w-full h-80"
            alt={`${product.name} image`}
            resizeMode="contain"
          />
        </View>

        {/* Product Info */}
        <View className="px-5 py-6">
          {/* Badges */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            <View className="px-3 py-1 rounded-full bg-green-100">
              <Text className="text-xs font-medium text-green-700">Sin gluten</Text>
            </View>
            <View className="px-3 py-1 rounded-full bg-blue-100">
              <Text className="text-xs font-medium text-blue-700">Vegano</Text>
            </View>
            <View className="px-3 py-1 rounded-full bg-orange-100">
              <Text className="text-xs font-medium text-orange-700">Sin lactosa</Text>
            </View>
          </View>

          {/* Title and Rating */}
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {product.name}
          </Text>

          <View className="flex-row items-center gap-2 mb-4">
            <View className="flex-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  fill="#FDB022"
                  color="#FDB022"
                />
              ))}
            </View>
            <Text className="text-sm text-gray-600">4.8 (120 reseñas)</Text>
          </View>

          {/* Price */}
          <Text className="text-3xl font-extrabold text-gray-900 mb-6">
            {formatPrice(product.price)}
          </Text>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-6">
            <Pressable
              className="w-12 h-12 rounded-full border border-gray-300 items-center justify-center active:bg-gray-100"
            >
              <Heart size={22} color="#374151" />
            </Pressable>

            <Pressable
              onPress={addToCart}
              className="flex-1 h-12 rounded-full bg-black items-center justify-center flex-row gap-2 active:opacity-80"
            >
              <ShoppingCart size={20} color="white" />
              <Text className="text-white font-semibold text-base">
                Agregar al carrito
              </Text>
            </Pressable>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-2">
              Descripción
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              {product.description || 'Producto de alta calidad especialmente seleccionado para personas con restricciones alimentarias. Ingredientes cuidadosamente verificados para garantizar su seguridad.'}
            </Text>
          </View>

          {/* Nutritional Info */}
          <View className="mb-6 p-4 rounded-2xl bg-gray-50">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Información nutricional
            </Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Calorías</Text>
                <Text className="text-sm font-medium text-gray-900">120 kcal</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Proteínas</Text>
                <Text className="text-sm font-medium text-gray-900">5g</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Carbohidratos</Text>
                <Text className="text-sm font-medium text-gray-900">20g</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Grasas</Text>
                <Text className="text-sm font-medium text-gray-900">3g</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}