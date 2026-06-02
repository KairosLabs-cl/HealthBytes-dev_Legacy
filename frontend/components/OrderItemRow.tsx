import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Image } from "@/components/ui/image";
import { Package, ChevronRight } from "lucide-react-native";
import { formatPrice } from "@/lib/formatPrice";
import { OrderItem } from "@/types/order";
import { Product } from "@/types/product";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";

type OrderItemRowProps = {
  item: OrderItem;
  product: Product | undefined;
  isLast: boolean;
};

function OrderItemRowInner({ item, product, isLast }: OrderItemRowProps) {
  const router = useRouter();
  const { palette } = useAppTheme();

  return (
    <Pressable
      onPress={() => router.push(`/product/${item.product_id}`)}
      className={`flex-row items-center rounded-2xl py-3 active:opacity-85 ${
        !isLast ? "border-b" : ""
      }`}
      style={{
        minHeight: 64,
        backgroundColor: palette.colors.surface.card,
        borderBottomColor: palette.colors.border.subtle,
      }}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${product?.name ?? `producto ${item.product_id}`}`}
    >
      {/* Product Image or Fallback */}
      {product?.image ? (
        <View
          className="mr-3 h-12 w-12 overflow-hidden rounded-2xl"
          style={{ backgroundColor: palette.colors.surface.muted }}
        >
          <Image
            source={{ uri: product.image }}
            alt={`Imagen de ${product.name ?? "Producto"}`}
            size="none"
            className="h-12 w-12"
            resizeMode="cover"
          />
        </View>
      ) : (
        <View
          className="mr-3 h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: palette.colors.surface.muted }}
        >
          <Package size={20} color={palette.colors.icon.muted} />
        </View>
      )}

      {/* Product Info */}
      <View className="flex-1 mr-2">
        <Text
          className="font-bold"
          style={{ color: palette.colors.ink.primary }}
          numberOfLines={2}
        >
          {product?.name ?? `Producto #${item.product_id}`}
        </Text>
        <Text className="text-sm" style={{ color: palette.colors.ink.subtle }}>
          Cantidad: {item.quantity}
        </Text>
      </View>

      {/* Price + Chevron */}
      <View className="flex-row items-center">
        <Text
          className="mr-1 font-black"
          style={{ color: palette.colors.ink.primary }}
        >
          {formatPrice(item.price * item.quantity)}
        </Text>
        <ChevronRight size={16} color={palette.colors.icon.muted} />
      </View>
    </Pressable>
  );
}

export const OrderItemRow = React.memo(OrderItemRowInner);
