import React from "react";
import { View, Pressable, Alert } from "react-native";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";
import { ShoppingCart, X, ChevronRight } from "lucide-react-native";
import { formatPrice } from "@/lib/formatPrice";
import { useRouter } from "expo-router";
import { useCart } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useAuth } from "@clerk/clerk-expo";
import { Product } from "@/types/product";

interface WishlistTableRowProps {
  product: Product;
}

const WishlistTableRow: React.FC<WishlistTableRowProps> = ({ product }) => {
  const router = useRouter();
  const addProduct = useCart((state) => state.addProduct);
  const { getToken } = useAuth();
  const { toggleFavorite } = useFavoritesStore();

  const handleRemove = async () => {
    const token = await getToken();
    if (!token) {
      Alert.alert("Inicia sesión", "Necesitas iniciar sesión para modificar tus favoritos.");
      return;
    }
    await toggleFavorite(Number(product.id), token);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
        backgroundColor: "white",
        alignItems: "center",
      }}
    >
      {/* Remove Button */}
      <Pressable
        onPress={handleRemove}
        style={{
          width: 32,
          height: 32,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={18} color="#9CA3AF" />
      </Pressable>

      {/* Image */}
      <Pressable
        onPress={() => router.push(`/product/${product.id}`)}
        style={{
          width: 80,
          height: 80,
          borderRadius: 8,
          backgroundColor: "#F9FAFB",
          overflow: "hidden",
          marginRight: 20,
        }}
      >
        <Image
          source={{ uri: product.image }}
          style={{ width: "100%", height: "100%" }}
          alt={product.name}
          resizeMode="contain"
        />
      </Pressable>

      {/* Name and Basic Info */}
      <View style={{ flex: 3, paddingRight: 10 }}>
        <Pressable onPress={() => router.push(`/product/${product.id}`)}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 4,
            }}
            numberOfLines={2}
          >
            {product.name}
          </Text>
        </Pressable>
      </View>

      {/* Price */}
      <View style={{ flex: 1.5 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>
          {formatPrice(product.price)}
        </Text>
      </View>

      {/* Stock Status */}
      <View style={{ flex: 1.5 }}>
        <View
          style={{
            backgroundColor: product.stock > 0 ? "#ECFDF5" : "#FEF2F2",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            alignSelf: "flex-start",
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "600",
              color: product.stock > 0 ? "#059669" : "#DC2626",
            }}
          >
            {product.stock > 0 ? "Disponible" : "Agotado"}
          </Text>
        </View>
      </View>

      {/* Add to Cart Button */}
      <View style={{ minWidth: 100 }}>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full border-black h-10"
          onPress={() => {
            addProduct(product);
            Alert.alert("Éxito", "Producto añadido al carrito");
          }}
          disabled={product.stock === 0}
        >
          <Icon as={ShoppingCart} size="sm" color="black" className="mr-2" />
          <ButtonText className="text-black text-xs font-bold">
            Añadir
          </ButtonText>
        </Button>
      </View>

      {/* Right Arrow (mobile hint) */}
      <Pressable
        onPress={() => router.push(`/product/${product.id}`)}
        style={{ paddingLeft: 10 }}
      >
        <ChevronRight size={20} color="#D1D5DB" />
      </Pressable>
    </View>
  );
};

export default WishlistTableRow;
