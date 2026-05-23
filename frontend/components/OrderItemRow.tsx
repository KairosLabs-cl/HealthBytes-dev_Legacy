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
      className={`flex-row items-center rounded-2xl py-3 active:bg-slate-50 ${
        !isLast ? "border-b border-border-subtle" : ""
      }`}
      style={{ minHeight: 64 }}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${product?.name ?? `producto ${item.product_id}`}`}
    >
      {/* Product Image or Fallback */}
      {product?.image ? (
        <View className="mr-3 h-12 w-12 overflow-hidden rounded-2xl bg-slate-100">
          <Image
            source={{ uri: product.image }}
            alt={`Imagen de ${product.name ?? "Producto"}`}
            size="none"
            className="h-12 w-12"
            resizeMode="cover"
          />
        </View>
      ) : (
        <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <Package size={20} color="#6B7280" />
        </View>
      )}

      {/* Product Info */}
      <View className="flex-1 mr-2">
        <Text className="font-bold text-[#09090b]" numberOfLines={2}>
          {product?.name ?? `Producto #${item.product_id}`}
        </Text>
        <Text className="text-sm text-ink-subtle">
          Cantidad: {item.quantity}
        </Text>
      </View>

      {/* Price + Chevron */}
      <View className="flex-row items-center">
        <Text className="mr-1 font-black text-[#09090b]">
          {formatPrice(item.price * item.quantity)}
        </Text>
        <ChevronRight size={16} color="#9CA3AF" />
      </View>
    </Pressable>
  );
}

export const OrderItemRow = React.memo(OrderItemRowInner);
