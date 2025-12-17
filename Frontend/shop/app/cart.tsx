import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { useCart } from "@/store/cartStore";
import { View, FlatList, Image } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Redirect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CartScreen() {
  const items = useCart((state) => state.items);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (items.length === 0) {
    return <Redirect href={"/"} />;
  }

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  /* Navegar a la pantalla de Checkout para proceder al pago */
  const onCheckout = () => {
    router.push("/checkout");
  };

  return (
    <View className="flex-1 bg-white p-4">
      <FlatList
        data={items}
        contentContainerClassName="gap-4 pb-32"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <HStack className="items-center" space="md">
              <View className="w-16 h-16 bg-gray-100 rounded-lg justify-center items-center">
                {/* Imagen por defecto si el producto no tiene una */}
                <Text className="text-2xl">📦</Text>
              </View>

              <VStack className="flex-1">
                <Text className="font-semibold text-lg text-black" numberOfLines={1}>
                  {item.product.name}
                </Text>
                <HStack className="justify-between items-center mt-2">
                  <Text className="text-blue-600 font-bold">
                    ${item.product.price.toFixed(2)}
                  </Text>
                  <View className="bg-gray-100 rounded-full px-3 py-1">
                    <Text className="text-xs font-medium text-black">x{item.quantity}</Text>
                  </View>
                </HStack>
              </VStack>
            </HStack>
          </View>
        )}
        ListFooterComponent={() => (
          <View className="mt-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <Text className="font-bold text-lg mb-4 text-black">Resumen de Orden</Text>

            <HStack className="justify-between mb-2">
              <Text className="text-gray-500">Subtotal</Text>
              <Text className="font-medium text-black">${subtotal.toFixed(2)}</Text>
            </HStack>
            <HStack className="justify-between mb-4">
              <Text className="text-gray-500">Envío</Text>
              <Text className="font-medium text-green-600">Gratis</Text>
            </HStack>

            <View className="h-[1px] bg-gray-200 my-2" />

            <HStack className="justify-between mt-2">
              <Text className="font-bold text-xl text-black">Total</Text>
              <Text className="font-bold text-xl text-blue-600">${subtotal.toFixed(2)}</Text>
            </HStack>
          </View>
        )}
      />

      <View style={{ position: 'absolute', bottom: insets.bottom + 16, left: 16, right: 16 }}>
        <Button size="lg" onPress={onCheckout} className="w-full bg-black rounded-full h-14 shadow-lg active:opacity-90">
          <ButtonText className="text-white font-bold text-lg">
            Ir a Pagar (${subtotal.toFixed(2)})
          </ButtonText>
        </Button>
      </View>
    </View>
  );
}
