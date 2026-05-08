import { AuthGate } from "@/components/AuthGate";
import CartItem from "@/components/CartItem";
import RecentlyViewedBar from "@/components/RecentlyViewedBar";
import { Text } from "@/components/ui/text";
import { formatPrice } from "@/lib/formatPrice";
import {
  useCart,
  selectCartItemCount,
  selectCartSubtotal,
} from "@/store/cartStore";
import { CartItem as CartItemType } from "@/types/cart";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Stack, useRouter } from "expo-router";
import { ShoppingBag } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import { FlatList, Pressable, View } from "react-native";
import { useShallow } from "zustand/react/shallow";

interface CartFooterProps {
  itemCount: number;
  subtotal: number;
  onCheckout: () => void;
}

const CartFooter = React.memo<CartFooterProps>(
  ({ itemCount, subtotal, onCheckout }) => {
    return (
      <View className="mt-2 bg-surface-card p-5 rounded-2xl border border-border-subtle">
        <Text className="font-extrabold text-lg mb-4 text-ink uppercase tracking-wider">
          Resumen de compra
        </Text>

        <View className="flex-row justify-between mb-3">
          <Text className="text-sm text-ink-muted font-medium">
            Subtotal ({itemCount} {itemCount === 1 ? "producto" : "productos"})
          </Text>
          <Text className="font-semibold text-ink">
            {formatPrice(subtotal)}
          </Text>
        </View>

        <View className="flex-row justify-between mb-4">
          <Text className="text-sm text-ink-muted font-medium">Envío</Text>
          <Text className="font-semibold text-brand-green">Gratis</Text>
        </View>

        <View className="h-0.5 bg-border-subtle my-4" />

        <View className="flex-row justify-between items-center mb-5">
          <Text className="font-black text-2xl text-ink uppercase tracking-wider">
            Total
          </Text>
          <Text className="font-black text-3xl text-ink">
            {formatPrice(subtotal)}
          </Text>
        </View>

        {/* Checkout Button */}
        <Pressable
          onPress={onCheckout}
          className="w-full h-14 bg-ink rounded-full items-center justify-center active:opacity-75"
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
  const {
    items,
    itemCount,
    subtotal,
    addProduct,
    decrementProduct,
    removeProduct,
  } = useCart(
    useShallow((state) => ({
      items: state.items,
      itemCount: selectCartItemCount(state),
      subtotal: selectCartSubtotal(state),
      addProduct: state.addProduct,
      decrementProduct: state.decrementProduct,
      removeProduct: state.removeProduct,
    }))
  );
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
          <ScreenHeader title="Carrito de compras" icon={ShoppingBag} />
          <View className="flex-1 items-center justify-center bg-surface-warm px-6">
            <View className="w-20 h-20 rounded-full bg-surface-muted items-center justify-center mb-6">
              <ShoppingBag size={40} color="#9CA3AF" strokeWidth={1.5} />
            </View>
            <Text className="text-2xl font-black text-ink mb-2 text-center">
              Tu carrito está vacío
            </Text>
            <Text className="text-center text-ink-subtle mb-8 leading-relaxed">
              Agrega productos para comenzar tu compra
            </Text>
            <Pressable
              onPress={() => router.push("/")}
              className="px-8 py-3 bg-ink rounded-full active:opacity-75"
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
          <ScreenHeader title="Carrito de compras" icon={ShoppingBag} />
          <View className="flex-1 bg-surface-warm">
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
