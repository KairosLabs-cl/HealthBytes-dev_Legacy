import { Text } from "@/components/ui/text";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatPrice } from "@/lib/formatPrice";
import { useCart } from "@/store/cartStore";
import { CartItem as CartItemType, Product } from "@/types/cart";
import { Image as ExpoImage } from "expo-image";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import React, { memo, useCallback, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useShallow } from "zustand/react/shallow";

type CartItemProps = {
  item: CartItemType;
  onIncrement: (product: Product) => void;
  onDecrement: (productId: string | number) => void;
  onRemove: (productId: string | number) => void;
};

const CartItem = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemProps) => {
  const { palette } = useAppTheme();
  const { isAdding, isUpdating, isRemoving } = useCart(
    useShallow((state) => ({
      isAdding: state.addingProducts.has(item.product.id),
      isUpdating: state.updatingProducts.has(item.product.id),
      isRemoving: state.removingProducts.has(item.product.id),
    }))
  );

  const [quantityText, setQuantityText] = useState(item.quantity.toString());

  // Update local text when item quantity changes
  React.useEffect(() => {
    setQuantityText(item.quantity.toString());
  }, [item.quantity]);

  const updateQuantity = useCallback(
    async (newQuantity: number) => {
      if (newQuantity <= 0) {
        onRemove(item.product.id);
        return;
      }

      // Use the store's updateQuantity function
      const { updateQuantity: storeUpdateQuantity } = useCart.getState();
      await storeUpdateQuantity(item.product.id, newQuantity);
    },
    [item.product.id, onRemove]
  );
  return (
    <View className="flex-row gap-3 rounded-[24px] border border-border-subtle bg-surface-card p-4">
      {/* Product Image */}
      <View className="h-24 w-24 overflow-hidden rounded-2xl bg-surface-muted">
        <ExpoImage
          source={{ uri: item.product.image }}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
          alt={`Imagen de ${item.product.name}`}
          transition={200}
        />
      </View>

      {/* Product Info */}
      <View className="flex-1">
        <Text className="mb-1 text-sm font-black leading-snug text-ink">
          {item.product.name}
        </Text>
        <Text className="mb-4 text-lg font-black tracking-[-0.2px] text-ink">
          {formatPrice(item.product.price * item.quantity)}
        </Text>

        {/* Quantity Controls */}
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => onDecrement(item.product.id)}
            disabled={isUpdating || isRemoving}
            accessibilityRole="button"
            accessibilityLabel={`Disminuir cantidad de ${item.product.name}`}
            accessibilityHint="Resta una unidad de este producto del carrito"
            accessibilityState={{ disabled: isUpdating || isRemoving }}
            className={`h-11 w-11 items-center justify-center rounded-2xl ${
              isUpdating || isRemoving
                ? "bg-surface-muted opacity-60"
                : "bg-ink active:opacity-85"
            }`}
          >
            <Minus
              size={16}
              color={
                isUpdating || isRemoving
                  ? palette.colors.ink.subtle
                  : palette.colors.ink.inverse
              }
            />
          </Pressable>

          <TextInput
            value={quantityText}
            onChangeText={setQuantityText}
            onBlur={() => {
              const newQuantity = parseInt(quantityText);
              if (!isNaN(newQuantity) && newQuantity !== item.quantity) {
                updateQuantity(newQuantity);
              } else {
                setQuantityText(item.quantity.toString());
              }
            }}
            keyboardType="numeric"
            accessibilityLabel="Cantidad"
            className="min-h-11 min-w-11 rounded-2xl bg-surface-muted px-3 py-2 text-center text-sm font-bold text-ink"
            editable={!isUpdating && !isRemoving}
          />

          <Pressable
            onPress={() => onIncrement(item.product)}
            disabled={isAdding || isUpdating || isRemoving}
            accessibilityRole="button"
            accessibilityLabel={`Aumentar cantidad de ${item.product.name}`}
            accessibilityHint="Suma una unidad de este producto al carrito"
            accessibilityState={{
              disabled: isAdding || isUpdating || isRemoving,
            }}
            className={`h-11 w-11 items-center justify-center rounded-2xl ${
              isAdding || isUpdating || isRemoving
                ? "bg-surface-muted opacity-60"
                : "bg-ink active:opacity-85"
            }`}
          >
            <Plus
              size={16}
              color={
                isAdding || isUpdating || isRemoving
                  ? palette.colors.ink.subtle
                  : palette.colors.ink.inverse
              }
            />
          </Pressable>

          <View className="flex-1" />

          <Pressable
            onPress={() => onRemove(item.product.id)}
            disabled={isRemoving}
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ${item.product.name} del carrito`}
            accessibilityHint="Quita este producto del carrito por completo"
            accessibilityState={{ disabled: isRemoving }}
            className={`h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
              isRemoving ? "bg-surface-muted opacity-40" : "bg-surface-card active:opacity-75"
            }`}
            style={{
              borderColor: isRemoving
                ? palette.colors.border.subtle
                : palette.colors.state.error,
            }}
          >
            <Trash2
              size={16}
              color={
                isRemoving
                  ? palette.colors.ink.subtle
                  : palette.colors.state.error
              }
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const areEqual = (prevProps: CartItemProps, nextProps: CartItemProps) => {
  return (
    prevProps.item.product.id === nextProps.item.product.id &&
    prevProps.item.quantity === nextProps.item.quantity &&
    prevProps.onIncrement === nextProps.onIncrement &&
    prevProps.onDecrement === nextProps.onDecrement &&
    prevProps.onRemove === nextProps.onRemove
  );
};

export default memo(CartItem, areEqual);
