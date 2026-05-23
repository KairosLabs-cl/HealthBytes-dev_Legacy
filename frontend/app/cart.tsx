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
import React, { useCallback } from "react";
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
      <View className="mt-2 rounded-[24px] border border-slate-200/70 bg-white p-5">
        <Text className="mb-4 text-lg font-black tracking-[-0.2px] text-[#09090b]">
          Resumen de compra
        </Text>

        <View className="flex-row justify-between mb-3">
          <Text className="text-sm text-ink-muted font-medium">
            Subtotal ({itemCount} {itemCount === 1 ? "producto" : "productos"})
          </Text>
          <Text className="font-bold text-[#09090b]">
            {formatPrice(subtotal)}
          </Text>
        </View>

        <View className="flex-row justify-between mb-4">
          <Text className="text-sm text-ink-muted font-medium">Envío</Text>
          <Text className="font-bold text-emerald-600">Gratis</Text>
        </View>

        <View className="my-4 h-px bg-slate-200/80" />

        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-xl font-black text-[#09090b]">
            Total
          </Text>
          <Text className="text-2xl font-black tracking-[-0.3px] text-[#09090b]">
            {formatPrice(subtotal)}
          </Text>
        </View>

        {/* Checkout Button */}
        <Pressable
          onPress={onCheckout}
          className="h-14 w-full items-center justify-center rounded-2xl bg-[#09090b] active:opacity-75"
          accessibilityRole="button"
          accessibilityLabel={`Proceder al pago, total ${formatPrice(subtotal)}`}
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
          <View className="flex-1 justify-center bg-[#fafafa] px-6">
            <View className="items-start rounded-[28px] border border-slate-200/70 bg-white p-6">
            <View className="mb-6 h-16 w-16 items-center justify-center rounded-[24px] bg-slate-100">
              <ShoppingBag size={32} color="#09090b" strokeWidth={1.8} />
            </View>
            <Text className="mb-2 text-2xl font-black tracking-[-0.4px] text-[#09090b]">
              Tu carrito está vacío
            </Text>
            <Text className="mb-8 text-base leading-6 text-zinc-600">
              Agrega productos para comenzar tu compra
            </Text>
            <Pressable
              onPress={() => router.push("/")}
              className="rounded-2xl bg-[#09090b] px-6 py-3 active:opacity-75"
              style={{ minHeight: 48 }}
              accessibilityRole="button"
              accessibilityLabel="Explorar productos"
            >
              <Text className="text-white font-semibold text-center">
                Explorar productos
              </Text>
            </Pressable>
            </View>
          </View>
        </>
      ) : (
        <>
          <Stack.Screen options={{ headerShown: false }} />
          <ScreenHeader title="Carrito de compras" icon={ShoppingBag} />
          <View className="flex-1 bg-[#fafafa]">
            <FlatList
              data={items}
              contentContainerClassName="gap-3 p-4 pb-8"
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item) => item.product.id.toString()}
              initialNumToRender={8}
              windowSize={5}
              maxToRenderPerBatch={5}
              ListFooterComponent={
                <View className="mt-2 pb-16">
                  <CartFooter
                    itemCount={itemCount}
                    subtotal={subtotal}
                    onCheckout={onCheckout}
                  />
                  <RecentlyViewedBar />
                </View>
              }
            />
          </View>
        </>
      )}
    </AuthGate>
  );
}
