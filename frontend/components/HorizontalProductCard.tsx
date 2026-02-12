import { memo } from "react";
import { View, Image, Pressable, Platform } from "react-native";
import { Text } from "@/components/ui/text";
import { ShoppingCart, Star } from "lucide-react-native";
import { useRouter } from "expo-router";
import type { Product } from "@/types/product";
import { getFirstTag } from "@/types/product";
import { formatPrice } from "@/lib/formatPrice";
import FavoriteButton from "@/components/FavoriteButton";
import { useCart } from "@/store/cartStore";

const TAG_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  green: { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E" },
  blue: { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
  orange: { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
  purple: { bg: "#FAF5FF", text: "#7E22CE", dot: "#A855F7" },
  red: { bg: "#FEF2F2", text: "#B91C1C", dot: "#EF4444" },
  emerald: { bg: "#ECFDF5", text: "#047857", dot: "#10B981" },
};
const DEFAULT_TAG = { bg: "#F9FAFB", text: "#4B5563", dot: "#9CA3AF" };

type Props = { product: Product };

function HorizontalProductCard({ product }: Props) {
  const router = useRouter();
  const addProduct = useCart((state) => state.addProduct);

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = () => {
    addProduct(product);
  };

  const firstTag = getFirstTag(product);
  const colors = firstTag ? (TAG_COLORS[firstTag.color || ""] || DEFAULT_TAG) : null;

  return (
    <Pressable onPress={handlePress} className="mr-3">
      <View
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          width: 200,
          borderWidth: 1,
          borderColor: "#F3F4F6",
          ...Platform.select<any>({
            web: { boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
            ios: {
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 3 },
            },
            android: { elevation: 3 },
            default: {},
          }),
        }}
      >
        {/* Image */}
        <View className="relative">
          <Image
            source={{ uri: product.image }}
            style={{ width: 200, height: 140, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
            resizeMode="cover"
          />
          <View style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
            <FavoriteButton productId={Number(product.id)} size={18} />
          </View>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12 }}>
          {/* Rating */}
          <View className="flex-row items-center" style={{ marginBottom: 4 }}>
            <Star size={12} color="#FBBF24" fill="#FBBF24" />
            <Text style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 3, fontWeight: "500" }}>
              4.5
            </Text>
          </View>

          {/* Name */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: "#111827",
              lineHeight: 18,
              minHeight: 36,
              marginBottom: 6,
            }}
            numberOfLines={2}
          >
            {product.name}
          </Text>

          {/* Tag */}
          {firstTag && colors ? (
            <View
              style={{
                alignSelf: "flex-start",
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.bg,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 20,
                marginBottom: 8,
              }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.dot, marginRight: 4 }} />
              <Text style={{ fontSize: 10, fontWeight: "600", color: colors.text }}>
                {firstTag.display_name}
              </Text>
            </View>
          ) : (
            <View style={{ height: 24, marginBottom: 8 }} />
          )}

          {/* Price */}
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 10 }}>
            {formatPrice(product.price)}
          </Text>

          {/* Button */}
          <Pressable
            onPress={handleAddToCart}
            style={{
              backgroundColor: "#1F2937",
              borderRadius: 12,
              paddingVertical: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              ...Platform.select<any>({
                web: { boxShadow: "0 2px 8px rgba(0,0,0,0.12)" },
                ios: {
                  shadowColor: "#000",
                  shadowOpacity: 0.12,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                },
                android: { elevation: 3 },
                default: {},
              }),
            }}
          >
            <ShoppingCart size={14} color="white" />
            <Text style={{ fontSize: 12, fontWeight: "700", color: "white", marginLeft: 6 }}>
              Agregar al carrito
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(HorizontalProductCard);
