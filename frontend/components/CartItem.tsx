import { Text } from "@/components/ui/text";
import { formatPrice } from "@/lib/formatPrice";
import { useCart } from "@/store/cartStore";
import { CartItem as CartItemType, Product } from "@/types/cart";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import React, { memo, useCallback, useState } from "react";
import { Image, Pressable, TextInput, View } from "react-native";

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
  const addingProducts = useCart((state) => state.addingProducts);
  const updatingProducts = useCart((state) => state.updatingProducts);
  const removingProducts = useCart((state) => state.removingProducts);

  const isAdding = addingProducts.has(item.product.id);
  const isUpdating = updatingProducts.has(item.product.id);
  const isRemoving = removingProducts.has(item.product.id);

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
    <View className="bg-white p-4 rounded-2xl flex-row gap-3 border border-gray-100">
      {/* Product Image */}
      <View className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
        <Image
          source={{ uri: item.product.image }}
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>

      {/* Product Info */}
      <View className="flex-1">
        <Text className="font-bold text-sm text-gray-900 mb-1 leading-snug">
          {item.product.name}
        </Text>
        <Text className="text-lg font-black text-gray-900 mb-4">
          {formatPrice(item.product.price * item.quantity)}
        </Text>

        {/* Quantity Controls */}
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => onDecrement(item.product.id)}
            disabled={isUpdating || isRemoving}
            className={`w-8 h-8 rounded-full items-center justify-center ${
              isUpdating || isRemoving
                ? "bg-gray-300 opacity-40"
                : "bg-black active:bg-gray-800"
            }`}
          >
            <Minus
              size={16}
              color={isUpdating || isRemoving ? "#9CA3AF" : "#FFFFFF"}
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
                // Reset to current quantity if invalid
                setQuantityText(item.quantity.toString());
              }
            }}
            keyboardType="numeric"
            className="px-3 py-1 bg-gray-100 rounded-lg min-w-[36px] text-center font-semibold text-gray-900 text-sm"
            editable={!isUpdating && !isRemoving}
          />

          <Pressable
            onPress={() => onIncrement(item.product)}
            disabled={isAdding || isUpdating || isRemoving}
            className={`w-8 h-8 rounded-full items-center justify-center ${
              isAdding || isUpdating || isRemoving
                ? "bg-gray-300 opacity-40"
                : "bg-black active:bg-gray-800"
            }`}
          >
            <Plus
              size={16}
              color={
                isAdding || isUpdating || isRemoving ? "#9CA3AF" : "#FFFFFF"
              }
            />
          </Pressable>

          <View className="flex-1" />

          <Pressable
            onPress={() => onRemove(item.product.id)}
            disabled={isRemoving}
            className={`w-8 h-8 rounded-full items-center justify-center transition-colors ${
              isRemoving
                ? "bg-gray-100 opacity-40"
                : "bg-red-50 active:bg-red-100"
            }`}
          >
            <Trash2 size={16} color={isRemoving ? "#D1D5DB" : "#EF4444"} />
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
