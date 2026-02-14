import { Text } from "@/components/ui/text"
import { Link } from "expo-router"
import { Pressable, View, Platform, GestureResponderEvent, Image } from "react-native"
import { memo } from "react";
import type { Product } from "@/types/product"
import { getFirstTag } from "@/types/product"
import { formatPrice } from "@/lib/formatPrice"
import { ShoppingCart, Star } from "lucide-react-native"
import { useCart } from "@/store/cartStore"
import FavoriteButton from "@/components/FavoriteButton"
import StockBadge from "@/components/StockBadge"
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated"

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

function ProductListItem({ product }: Props) {
  const addProduct = useCart((state) => state.addProduct);
  const isOutOfStock = product.stock === 0;
  const cartScale = useSharedValue(1);

  const cartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartScale.value }],
  }));

  const handleAddToCart = (e: GestureResponderEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    cartScale.value = withTiming(0.97, { duration: 80, easing: Easing.out(Easing.ease) }, () => {
      cartScale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
    });
    addProduct(product);
  };

  const firstTag = getFirstTag(product);
  const colors = firstTag ? (TAG_COLORS[firstTag.color || ""] || DEFAULT_TAG) : null;

  return (
    <Animated.View style={{ flex: 1 }} entering={FadeInDown.duration(400).springify()}>
      <Link href={`/product/${product.id}`} asChild>
        <Pressable style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              overflow: "hidden",
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
            <View style={{ position: "relative" }}>
              <Image
                source={{ uri: product.image }}
                style={{
                  width: "100%",
                  aspectRatio: 4 / 3,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  opacity: isOutOfStock ? 0.4 : 1,
                }}
                resizeMode="cover"
              />
              <StockBadge stock={product.stock} variant="overlay" />
              <View style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
                <FavoriteButton productId={Number(product.id)} size={18} />
              </View>
            </View>

            {/* Content */}
            <View style={{ paddingHorizontal: 10, paddingTop: 8, paddingBottom: 10 }}>
              {/* Rating */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Star size={12} color="#FBBF24" fill="#FBBF24" />
                <Text style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 3, fontWeight: "500" }}>
                  4.5
                </Text>
              </View>

              {/* Name */}
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: "#111827",
                  lineHeight: 17,
                  minHeight: 34,
                  marginBottom: 4,
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
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    borderRadius: 20,
                    marginBottom: 6,
                  }}
                >
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.dot, marginRight: 4 }} />
                  <Text style={{ fontSize: 10, fontWeight: "600", color: colors.text }}>
                    {firstTag.display_name}
                  </Text>
                </View>
              ) : (
                <View style={{ height: 20, marginBottom: 6 }} />
              )}

              {/* Price */}
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 6 }}>
                {formatPrice(product.price)}
              </Text>

              <StockBadge stock={product.stock} variant="inline" />

              {/* Add to cart button */}
              <Animated.View style={cartAnimatedStyle}>
                <Pressable
                  onPress={handleAddToCart}
                  disabled={isOutOfStock}
                  style={{
                    width: "100%",
                    borderRadius: 10,
                    paddingVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isOutOfStock ? "#E5E7EB" : "#000000",
                    minHeight: 36,
                    ...Platform.select<any>({
                      web: {
                        boxShadow: isOutOfStock ? "none" : "0px 2px 8px rgba(0, 0, 0, 0.1)",
                      },
                      default: isOutOfStock ? {} : {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.12,
                        shadowRadius: 4,
                        elevation: 3,
                      },
                    }),
                  }}
                >
                  <ShoppingCart size={13} color={isOutOfStock ? "#9CA3AF" : "white"} />
                  <Text style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: isOutOfStock ? "#9CA3AF" : "#FFFFFF",
                    marginLeft: 5,
                  }}>
                    Agregar al carrito
                  </Text>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </Pressable>
      </Link>
    </Animated.View>
  );
}

export default memo(ProductListItem);
