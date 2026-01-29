import React, { memo } from "react";
import { View, Image, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { Trash2, Plus, Minus } from "lucide-react-native";
import { formatPrice } from "@/lib/formatPrice";
import { CartItem as CartItemType, Product } from "@/types/cart";

type CartItemProps = {
  item: CartItemType;
  onIncrement: (product: Product) => void;
  onDecrement: (productId: string | number) => void;
  onRemove: (productId: string | number) => void;
};

const CartItem = ({ item, onIncrement, onDecrement, onRemove }: CartItemProps) => {
  return (
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
            onPress={() => onDecrement(item.product.id)}
            className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
          >
            <Minus size={16} color="#374151" />
          </Pressable>

          <View className="px-4 py-1 bg-gray-50 rounded-lg min-w-[40px] items-center">
            <Text className="font-semibold text-gray-900">{item.quantity}</Text>
          </View>

          <Pressable
            onPress={() => onIncrement(item.product)}
            className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
          >
            <Plus size={16} color="#374151" />
          </Pressable>

          <View className="flex-1" />

          <Pressable
            onPress={() => onRemove(item.product.id)}
            className="w-8 h-8 rounded-full bg-red-50 items-center justify-center active:bg-red-100"
          >
            <Trash2 size={16} color="#DC2626" />
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
