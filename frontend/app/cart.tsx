import { AuthGate } from "@/components/AuthGate";
import CartItem from "@/components/CartItem";
import RecentlyViewedBar from "@/components/RecentlyViewedBar";
import { Text } from "@/components/ui/text";
import { formatPrice } from "@/lib/formatPrice";
import { useCart, selectCartItemCount, selectCartSubtotal } from "@/store/cartStore";
import { CartItem as CartItemType } from "@/types/cart";
import { Stack, useRouter } from "expo-router";
import { ShoppingBag } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import { FlatList, Pressable, View } from "react-native";

interface CartFooterProps {
  itemCount: number;
  subtotal: number;
  onCheckout: () => void;
}

const CartFooter = React.memo<CartFooterProps>(
  ({ itemCount, subtotal, onCheckout }) => {
    return (
      <View className="mt-2 bg-white p-5 rounded-2xl border border-gray-100">
        <Text className="font-extrabold text-lg mb-4 text-gray-900 uppercase tracking-wider">
          Resumen de compra
        </Text>

        <View className="flex-row justify-between mb-3">
          <Text className="text-sm text-gray-600 font-medium">
            Subtotal ({itemCount} {itemCount === 1 ? "producto" : "productos"})
          </Text>
          <Text className="font-semibold text-gray-900">
            {formatPrice(subtotal)}
          </Text>
        </View>

        <View className="flex-row justify-between mb-4">
          <Text className="text-sm text-gray-600 font-medium">Envío</Text>
          <Text className="font-semibold text-green-600">Gratis</Text>
        </View>

        <View className="h-0.5 bg-gray-100 my-4" />

        <View className="flex-row justify-between items-center mb-5">
          <Text className="font-black text-2xl text-gray-900 uppercase tracking-wider">
            Total
          </Text>
          <Text className="font-black text-3xl text-gray-900">
            {formatPrice(subtotal)}
          </Text>
        </View>

        {/* Checkout Button */}
        <Pressable
          onPress={onCheckout}
          className="w-full h-14 bg-black rounded-full items-center justify-center active:opacity-75"
        >
          <Text className="text-white font-bold text-base">
            Proceder al pago
          </Text>
        </Pressable>
      </View>
    );
  }
);

CartFooter.displayName = "CartFooter";

export default function CartScreen() {
  const items = useCart((state) => state.items);
  const itemCount = useCart(selectCartItemCount);
  const subtotal = useCart(selectCartSubtotal);
  const addProduct = useCart((state) => state.addProduct);
  const decrementProduct = useCart((state) => state.decrementProduct);
  const removeProduct = useCart((state) => state.removeProduct);
  const router = useRouter();

  const onCheckout = useCallback(() => {
    router.push("/checkout-v2");
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: CartItemType }) => (
      <CartItem
        item={item}
        onIncrement={addProduct}
        onDecrement={decrementProduct}
        onRemove={removeProduct}
      />
    ),
    [addProduct, decrementProduct, removeProduct]
  );

  return (
    <AuthGate message="Necesitas una cuenta para ver tu carrito.">
      {items.length === 0 ? (
        <>
          <Stack.Screen options={{ headerShown: false }} />
          <View className="flex-1 items-center justify-center bg-white px-6">
            <View className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 items-center justify-center mb-6">
              <ShoppingBag size={40} color="#9CA3AF" strokeWidth={1.5} />
            </View>
            <Text className="text-2xl font-black text-gray-900 mb-2 text-center">
              Tu carrito está vacío
            </Text>
            <Text className="text-center text-gray-500 mb-8 leading-relaxed">
              Agrega productos para comenzar tu compra
            </Text>
            <Pressable
              onPress={() => router.push("/")}
              className="px-8 py-3 bg-black rounded-full active:opacity-75"
              style={{ minHeight: 44 }}
            >
              <Text className="text-white font-semibold text-center">
                Explorar productos
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Stack.Screen options={{ headerShown: false }} />
          <View className="flex-1 bg-white">
            <FlatList
              data={items}
              contentContainerClassName="gap-3 p-4 pb-8"
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item) => item.product.id.toString()}
              initialNumToRender={8}
              windowSize={5}
              maxToRenderPerBatch={5}
              ListFooterComponent={() => (
                <View className="mt-2 pb-16">
                  <CartFooter
                    itemCount={itemCount}
                    subtotal={subtotal}
                    onCheckout={onCheckout}
                  />
                  <RecentlyViewedBar />
                </View>
              )}
            />
          </View>
        </>
      )}
    </AuthGate>
  );
}
