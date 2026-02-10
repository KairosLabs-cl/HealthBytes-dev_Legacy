import React, { useCallback, useMemo } from "react";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { useCart } from "@/store/cartStore";
import { View, FlatList, Pressable, Platform } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ShoppingBag } from "lucide-react-native";
import { formatPrice } from "@/lib/formatPrice";
import { CartItem as CartItemType } from "@/types/cart";
import CartItem from "@/components/CartItem";

interface CartFooterProps {
  itemCount: number;
  subtotal: number;
  onCheckout: () => void;
}

const CartFooter = React.memo<CartFooterProps>(({ itemCount, subtotal, onCheckout }) => {
  return (
    <View className="mt-2 bg-white p-5 rounded-2xl">
      <Text className="font-bold text-lg mb-4 text-gray-900">Resumen de compra</Text>

      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600">Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})</Text>
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
  );
});

CartFooter.displayName = 'CartFooter';

export default function CartScreen() {
  const items = useCart((state) => state.items);
  const addProduct = useCart((state) => state.addProduct);
  const decrementProduct = useCart((state) => state.decrementProduct);
  const removeProduct = useCart((state) => state.removeProduct);
  const router = useRouter();

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const onCheckout = useCallback(() => {
    router.push("/checkout");
  }, [router]);

  const renderItem = useCallback(({ item }: { item: CartItemType }) => (
    <CartItem
      item={item}
      onIncrement={addProduct}
      onDecrement={decrementProduct}
      onRemove={removeProduct}
    />
  ), [addProduct, decrementProduct, removeProduct]);

  const footerParam = useMemo(() => (
    <CartFooter
      itemCount={items.length}
      subtotal={subtotal}
      onCheckout={onCheckout}
    />
  ), [items.length, subtotal, onCheckout]);

  if (items.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: "Carrito de Compras" }} />
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
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Carrito de Compras" }} />
      <View className="flex-1 bg-gray-50">
      <FlatList
        data={items}
        contentContainerClassName="gap-3 p-4 pb-32"
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item) => item.product.id.toString()}
        ListFooterComponent={footerParam}
      />
      </View>
    </>
  );
}
