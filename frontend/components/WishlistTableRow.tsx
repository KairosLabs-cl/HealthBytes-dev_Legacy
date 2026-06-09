import React from "react";
import { View, Pressable } from "react-native";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { ShoppingCart, X } from "lucide-react-native";
import { formatPrice } from "@/lib/formatPrice";
import { useRouter } from "expo-router";
import { useCart } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useAuth } from "@clerk/clerk-expo";
import { Product } from "@/types/product";
import { useAppTheme } from "@/hooks/useAppTheme";

interface WishlistTableRowProps {
  product: Product;
}

const WishlistTableRow: React.FC<WishlistTableRowProps> = ({ product }) => {
  const router = useRouter();
  const addProduct = useCart((state) => state.addProduct);
  const { getToken } = useAuth();
  const { palette } = useAppTheme();
  // Granular selector to prevent re-renders when unrelated store state changes
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isOutOfStock = (product.stock ?? 1) === 0;

  const handleRemove = async () => {
    const token = await getToken();
    if (!token) return;
    await toggleFavorite(Number(product.id), getToken);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addProduct(product);
  };

  return (
    <View
      style={{
        backgroundColor: palette.colors.surface.card,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: palette.colors.border.subtle,
        marginHorizontal: 16,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
      }}
    >
      {/* Product image — tappable to detail */}
      <Pressable
        onPress={() => router.push(`/product/${product.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`Ver detalles de ${product.name}`}
        accessibilityHint="Abre el detalle del producto"
        style={{
          width: 80,
          height: 80,
          borderRadius: 18,
          backgroundColor: palette.colors.surface.muted,
          overflow: "hidden",
          flexShrink: 0,
          opacity: isOutOfStock ? 0.5 : 1,
        }}
      >
        <Image
          source={{ uri: product.image }}
          style={{ width: "100%", height: "100%" }}
          alt={`Imagen de ${product.name}`}
          resizeMode="contain"
        />
      </Pressable>

      {/* Info + actions */}
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Pressable
          onPress={() => router.push(`/product/${product.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalles de ${product.name}`}
          accessibilityHint="Abre el detalle del producto"
        >
          <Text
            numberOfLines={2}
            style={{
              fontSize: 13,
              fontWeight: "900",
              color: palette.colors.ink.primary,
              marginBottom: 4,
              lineHeight: 18,
            }}
          >
            {product.name}
          </Text>
        </Pressable>

        <Text
          style={{
            fontSize: 16,
            fontWeight: "900",
            color: palette.colors.ink.primary,
            marginBottom: 8,
          }}
        >
          {formatPrice(product.price)}
        </Text>

        {/* Stock badge */}
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: isOutOfStock
              ? `${palette.colors.state.error}1F`
              : `${palette.colors.state.success}1F`,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 12,
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "600",
              color: isOutOfStock
                ? palette.colors.state.error
                : palette.colors.state.success,
            }}
          >
            {isOutOfStock ? "Agotado" : "Disponible"}
          </Text>
        </View>

        {/* Add to cart */}
        <Pressable
          onPress={handleAddToCart}
          disabled={isOutOfStock}
          accessibilityRole="button"
          accessibilityLabel={
            isOutOfStock
              ? `${product.name} agotado`
              : `Agregar ${product.name} a mi lista`
          }
          accessibilityState={{ disabled: isOutOfStock }}
          hitSlop={4}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isOutOfStock
              ? palette.colors.surface.muted
              : palette.colors.ink.primary,
            borderRadius: 16,
            paddingVertical: 8,
            minHeight: 44,
          }}
        >
          <ShoppingCart
            size={12}
            color={
              isOutOfStock
                ? palette.colors.icon.muted
                : palette.colors.ink.inverse
            }
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: isOutOfStock
                ? palette.colors.ink.subtle
                : palette.colors.ink.inverse,
              marginLeft: 5,
            }}
          >
            Agregar a mi lista
          </Text>
        </Pressable>
      </View>

      {/* Remove — 44pt touch target */}
      <Pressable
        onPress={handleRemove}
        accessibilityRole="button"
        accessibilityLabel={`Quitar ${product.name} de la lista de deseos`}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        style={{
          width: 44,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "flex-start",
        }}
      >
        <X size={18} color={palette.colors.icon.muted} />
      </Pressable>
    </View>
  );
};

export default React.memo(WishlistTableRow);
