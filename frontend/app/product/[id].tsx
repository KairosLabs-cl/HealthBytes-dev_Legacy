import { Stack, useLocalSearchParams } from 'expo-router';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '@/api/products';
import { ActivityIndicator, View, ScrollView, Pressable, Alert } from 'react-native';
import { useCart } from '@/store/cartStore';
import { useRecentlyViewed } from '@/store/recentlyViewedStore';
import { useEffect } from 'react';
import { ShoppingCart, Star } from 'lucide-react-native';
import { formatPrice } from '@/lib/formatPrice';
import FavoriteButton from '@/components/FavoriteButton';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const addProduct = useCart((state) => state.addProduct);
  const cartItems = useCart((state) => state.items);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchProductById(Number(id)),
  });

  useEffect(() => {
    if (product) {
      useRecentlyViewed.getState().add(product);
    }
  }, [product]);

  const addToCart = async () => {
    try {
      // 1. Verificar stock actualizado
      const updatedProduct = await fetchProductById(Number(id));

      // 2. Definir cantidad actual en carrito
      const currentInCart = cartItems.find(i => i.product.id === updatedProduct.id)?.quantity || 0;

      // 3. Validar
      if (currentInCart + 1 > updatedProduct.stock) {
        Alert.alert(
          "Stock insuficiente",
          `Solo quedan ${updatedProduct.stock} unidades disponibles.`
        );
        return;
      }

      // 4. Agregar si todo está bien
      // Usamos updatedProduct para asegurar que tenemos la data más reciente
      addProduct(updatedProduct);

    } catch (error) {
      console.error("Error checking stock:", error);
      Alert.alert("Error", "No se pudo verificar el stock. Intenta nuevamente.");
    }
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


          {/* Stock Info */}
          <View className="flex-row items-center mb-6">
            <View className={`w-2 h-2 rounded-full mr-2 ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className="text-sm font-medium text-gray-600">
              {product.stock > 0
                ? `${product.stock} unidades disponibles`
                : 'Agotado'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-6">
            <View className="w-12 h-12 rounded-full border border-gray-300 items-center justify-center">
              <FavoriteButton productId={Number(id)} size={22} />
            </View>

            <Pressable
              onPress={addToCart}
              disabled={product.stock === 0 || (cartItems.find(i => i.product.id === product.id)?.quantity || 0) >= product.stock}
              className={`flex-1 h-12 rounded-full items-center justify-center flex-row gap-2 active:opacity-80 ${product.stock > 0 && (cartItems.find(i => i.product.id === product.id)?.quantity || 0) < product.stock ? 'bg-black' : 'bg-gray-300'
                }`}
            >
              <ShoppingCart size={20} color={product.stock > 0 && (cartItems.find(i => i.product.id === product.id)?.quantity || 0) < product.stock ? "white" : "#9CA3AF"} />
              <Text className={`font-semibold text-base ${product.stock > 0 && (cartItems.find(i => i.product.id === product.id)?.quantity || 0) < product.stock ? "text-white" : "text-gray-500"}`}>
                {product.stock === 0
                  ? 'Agotado'
                  : (cartItems.find(i => i.product.id === product.id)?.quantity || 0) >= product.stock
                    ? 'Máximo alcanzado'
                    : 'Agregar al carrito'}
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