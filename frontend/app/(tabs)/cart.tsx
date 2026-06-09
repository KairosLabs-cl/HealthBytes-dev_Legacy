import { AuthGate } from "@/components/AuthGate";
import CartItem from "@/components/CartItem";
import RecentlyViewedBar from "@/components/RecentlyViewedBar";
import { Text } from "@/components/ui/text";
import { FEATURES } from "@/lib/config";
import { formatPrice } from "@/lib/formatPrice";
import {
  useCart,
  selectCartItemCount,
  selectCartSubtotal,
} from "@/store/cartStore";
import { CartItem as CartItemType } from "@/types/cart";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useRouter } from "expo-router";
import { ListEmptyState } from "@/components/ui/ListEmptyState";
import { ShoppingBag } from "lucide-react-native";
import React, { useCallback } from "react";
import { Pressable, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useShallow } from "zustand/react/shallow";

interface CartFooterProps {
  itemCount: number;
  firstProductId: string | number | null;
  subtotal: number;
  onCheckout: () => void;
  onFindStores: (productId: string | number | null) => void;
}

const CartFooter = React.memo<CartFooterProps>(
  ({ itemCount, firstProductId, subtotal, onCheckout, onFindStores }) => {
    return (
      <View className="mt-2 rounded-[24px] border border-border-subtle bg-surface-card p-5">
        <Text className="mb-4 text-lg font-black tracking-[-0.2px] text-ink">
          Resumen de compra
        </Text>

        <View className="flex-row justify-between mb-3">
          <Text className="text-sm text-ink-muted font-medium">
            Subtotal ({itemCount} {itemCount === 1 ? "producto" : "productos"})
          </Text>
          <Text className="font-bold text-ink">
            {formatPrice(subtotal)}
          </Text>
        </View>

        <View className="mb-4 h-px bg-border-subtle" />

        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-xl font-black text-ink">
            Total
          </Text>
          <Text className="text-2xl font-black tracking-[-0.3px] text-ink">
            {formatPrice(subtotal)}
          </Text>
        </View>

        {FEATURES.MARKETPLACE_ENABLED ? (
          <Pressable
            onPress={onCheckout}
            className="h-14 w-full items-center justify-center rounded-2xl bg-ink active:opacity-75"
            accessibilityRole="button"
            accessibilityLabel={`Proceder al pago, total ${formatPrice(subtotal)}`}
          >
            <Text className="text-ink-inverse font-bold text-base">
              Proceder al pago
            </Text>
          </Pressable>
        ) : (
          <View className="rounded-2xl border border-border-default bg-surface-warm p-4">
            <Text className="text-base font-black text-ink">
              Encuentra dónde comprar
            </Text>
            <Text className="mt-1 text-sm leading-5 text-ink-muted">
              Compra directa pausada. Busca tiendas físicas donde conseguir tus
              productos.
            </Text>
            <Pressable
              onPress={() => onFindStores(firstProductId)}
              className="mt-4 h-12 w-full items-center justify-center rounded-2xl bg-ink active:opacity-75"
              accessibilityRole="button"
              accessibilityLabel="Encontrar tiendas donde conseguir estos productos"
            >
              <Text className="text-ink-inverse font-bold text-base">
                Encontrar tiendas
              </Text>
            </Pressable>
          </View>
        )}
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

  const onFindStores = useCallback(
    (productId: string | number | null) => {
      if (productId !== null) {
        router.push(`/product/${productId}/stores`);
        return;
      }

      router.push("/all-products");
    },
    [router]
  );

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
    <AuthGate message="Necesitas una cuenta para ver tu lista.">
      {items.length === 0 ? (
        <>
          <ScreenHeader title="Mi lista de compras" icon={ShoppingBag} />
          <ListEmptyState
            icon={ShoppingBag}
            title="Tu lista está vacía"
            description="Agrega productos para comenzar tu compra"
            actionLabel="Explorar productos"
            onActionPress={() => router.push("/")}
            style={{ paddingHorizontal: 24 }}
          />
        </>
      ) : (
        <>
          <ScreenHeader title="Mi lista de compras" icon={ShoppingBag} />
          <View className="flex-1 bg-surface-warm">
            <FlashList
              data={items}
              contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              keyExtractor={(item) => item.product.id.toString()}
              estimatedItemSize={116}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              ListFooterComponent={
                <View className="mt-2 pb-16">
                  <CartFooter
                    itemCount={itemCount}
                    firstProductId={items[0]?.product.id ?? null}
                    subtotal={subtotal}
                    onCheckout={onCheckout}
                    onFindStores={onFindStores}
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
