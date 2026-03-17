import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Image } from "@/components/ui/image";
import { Package, ChevronRight } from "lucide-react-native";
import { formatPrice } from "@/lib/formatPrice";
import { OrderItem } from "@/types/order";
import { Product } from "@/types/product";
import { useRouter } from "expo-router";

type OrderItemRowProps = {
  item: OrderItem;
  product: Product | undefined;
  isLast: boolean;
};

function OrderItemRowInner({ item, product, isLast }: OrderItemRowProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/product/${item.product_id}`)}
      className={`flex-row items-center py-3 active:bg-gray-50 rounded-lg ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
      style={{ minHeight: 64 }}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${product?.name ?? `producto ${item.product_id}`}`}
    >
      {/* Product Image or Fallback */}
      {product?.image ? (
        <View className="w-12 h-12 rounded-lg overflow-hidden mr-3 bg-gray-100">
          <Image
            source={{ uri: product.image }}
            alt={product.name ?? "Producto"}
            size="none"
            className="w-12 h-12"
            resizeMode="cover"
          />
        </View>
      ) : (
        <View className="w-12 h-12 bg-gray-100 rounded-lg items-center justify-center mr-3">
          <Package size={20} color="#6B7280" />
        </View>
      )}

      {/* Product Info */}
      <View className="flex-1 mr-2">
        <Text className="text-gray-900 font-medium" numberOfLines={2}>
          {product?.name ?? `Producto #${item.product_id}`}
        </Text>
        <Text className="text-sm text-gray-500">
          Cantidad: {item.quantity}
        </Text>
      </View>

      {/* Price + Chevron */}
      <View className="flex-row items-center">
        <Text className="font-semibold text-gray-900 mr-1">
          {formatPrice(item.price * item.quantity)}
        </Text>
        <ChevronRight size={16} color="#9CA3AF" />
      </View>
    </Pressable>
  );
}

export const OrderItemRow = React.memo(OrderItemRowInner);
