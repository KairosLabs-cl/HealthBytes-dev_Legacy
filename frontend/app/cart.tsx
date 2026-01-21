import { Text } from "@/components/ui/text";
import { useCart } from "@/store/cartStore";
import { View, FlatList, Image, Pressable } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react-native";
import { formatPrice } from "@/lib/formatPrice";

export default function CartScreen() {
  const items = useCart((state) => state.items);
  const addProduct = useCart((state) => state.addProduct);
  const decrementProduct = useCart((state) => state.decrementProduct);
  const removeProduct = useCart((state) => state.removeProduct);
  const resetCart = useCart((state) => state.resetCart);
  const router = useRouter();

  if (items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
          <ShoppingBag size={40} color="#9CA3AF" />
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2">
          Tu carrito está vacío
        </Text>
        <Text className="text-center text-gray-500 mb-6">
          Agrega productos para comenzar tu compra
        </Text>
        <Pressable
          onPress={() => router.push("/")}
          className="px-6 py-3 bg-black rounded-full active:opacity-80"
        >
          <Text className="text-white font-semibold">Explorar productos</Text>
        </Pressable>
      </View>
    );
  }

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  const onCheckout = () => {
    router.push("/checkout");
  };

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={items}
        contentContainerClassName="gap-3 p-4 pb-32"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-2xl flex-row gap-3">
            {/* Product Image */}
            <View className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden">
              <Image
                source={{ uri: item.product.image }}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>

            {/* Product Info */}
            <View className="flex-1">
              <Text className="font-semibold text-base text-gray-900 mb-1">
                {item.product.name}
              </Text>
              <Text className="text-lg font-bold text-gray-900 mb-3">
                {formatPrice(item.product.price * item.quantity)}
              </Text>

              {/* Quantity Controls */}
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => decrementProduct(item.product.id)}
                  className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
                >
                  <Minus size={16} color="#374151" />
                </Pressable>

                <View className="px-4 py-1 bg-gray-50 rounded-lg min-w-[40px] items-center">
                  <Text className="font-semibold text-gray-900">{item.quantity}</Text>
                </View>

                <Pressable
                  onPress={() => addProduct(item.product)}
                  className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
                >
                  <Plus size={16} color="#374151" />
                </Pressable>

                <View className="flex-1" />

                <Pressable
                  onPress={() => removeProduct(item.product.id)}
                  className="w-8 h-8 rounded-full bg-red-50 items-center justify-center active:bg-red-100"
                >
                  <Trash2 size={16} color="#DC2626" />
                </Pressable>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <View className="mt-2 bg-white p-5 rounded-2xl">
            <Text className="font-bold text-lg mb-4 text-gray-900">Resumen de compra</Text>

            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Subtotal ({items.length} {items.length === 1 ? 'producto' : 'productos'})</Text>
              <Text className="font-semibold text-gray-900">{formatPrice(subtotal)}</Text>
            </View>

            <View className="flex-row justify-between mb-4">
              <Text className="text-gray-600">Envío</Text>
              <Text className="font-semibold text-green-600">Gratis</Text>
            </View>

            <View className="h-[1px] bg-gray-200 my-3" />

            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-bold text-xl text-gray-900">Total</Text>
              <Text className="font-bold text-2xl text-gray-900">{formatPrice(subtotal)}</Text>
            </View>

            {/* Checkout Button */}
            <Pressable
              onPress={onCheckout}
              className="w-full h-14 bg-black rounded-full items-center justify-center active:opacity-80"
            >
              <Text className="text-white font-bold text-lg">
                Proceder al pago
              </Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}
