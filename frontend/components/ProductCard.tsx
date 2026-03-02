/**
 * ProductCard — shared visual core for all product card surfaces.
 * Used by ProductListItem (grid) and HorizontalProductCard (horizontal scroll).
 * Change the design here and it propagates everywhere automatically.
 */
import { memo, useRef } from "react";
import { View, Image, Pressable, Platform, GestureResponderEvent } from "react-native";
import { Text } from "@/components/ui/text";
import { Info, WheatOff, Vegan, MilkOff, Gauge, Dumbbell, Heart } from "lucide-react-native";
import { useRouter } from "expo-router";
import type { Product } from "@/types/product";
import { normalizeDietaryTag } from "@/types/product";
import { formatPrice } from "@/lib/formatPrice";
import FavoriteButton from "@/components/FavoriteButton";
import StockBadge from "@/components/StockBadge";
import { useCart } from "@/store/cartStore";
import { useCartAnimation } from "@/store/cartAnimationStore";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";

const DIETARY_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  'sin-gluten':       WheatOff,
  'vegano':           Vegan,
  'sin-lactosa':      MilkOff,
  'bajo-en-azucar':   Gauge,
  'alto-en-proteina': Dumbbell,
  'para-diabeticos':  Heart,
};

const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  green:   { bg: "#F0FDF4", text: "#15803D", border: "#86EFAC" },
  blue:    { bg: "#EFF6FF", text: "#1D4ED8", border: "#93C5FD" },
  orange:  { bg: "#FFF7ED", text: "#C2410C", border: "#FDBA74" },
  purple:  { bg: "#FAF5FF", text: "#7E22CE", border: "#D8B4FE" },
  red:     { bg: "#FEF2F2", text: "#B91C1C", border: "#FCA5A5" },
  emerald: { bg: "#ECFDF5", text: "#047857", border: "#6EE7B7" },
};
const DEFAULT_TAG = { bg: "#F9FAFB", text: "#4B5563", border: "#D1D5DB" };

export type ProductCardProps = {
  product: Product;
  /** Width of the card. "full" = flex:1 (grid), number = fixed px (horizontal scroll) */
  width: "full" | number;
  /** Called when the add-to-cart button is pressed. Defaults to cart store action. */
  onAddToCart?: () => void;
};

function ProductCard({ product, width, onAddToCart }: ProductCardProps) {
  const router = useRouter();
  const addProduct = useCart((state) => state.addProduct);
  const triggerFly = useCartAnimation((s) => s.trigger);
  const isOutOfStock = product.stock === 0;
  const cartScale = useSharedValue(1);
  const addBtnRef = useRef<any>(null);

  const cartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartScale.value }],
  }));

  const handleAddToCart = (e: GestureResponderEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    cancelAnimation(cartScale);
    cartScale.value = withSequence(
      withTiming(0.95, { duration: 80, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) })
    );
    (onAddToCart ?? (() => addProduct(product)))();
    addBtnRef.current?.measureInWindow((x: number, y: number, w: number, h: number) => {
      triggerFly(x + w / 2, y + h / 2);
    });
  };

  const allTags = (product.dietary_tags ?? []).map(normalizeDietaryTag);
  const categoryLabel = product.category
    ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
    : null;

  const containerStyle = width === "full"
    ? { flex: 1 as const }
    : { width: width as number };

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      style={containerStyle}
      accessibilityLabel={`${product.name}, ${formatPrice(product.price)}`}
      accessibilityHint="Toca para ver detalles del producto"
    >
      <View
        style={{
          ...containerStyle,
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#F3F4F6",
          ...Platform.select<any>({
            web: { boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
            ios: {
              shadowColor: "#000",
              shadowOpacity: 0.07,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
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
              aspectRatio: 1,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
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
        <View style={{ paddingHorizontal: 11, paddingTop: 10, paddingBottom: 12 }}>
          {/* Category */}
          {categoryLabel && (
            <Text style={{ fontSize: 10, color: "#6B7280", fontWeight: "500", marginBottom: 4 }} numberOfLines={1}>
              {categoryLabel}
            </Text>
          )}

          {/* Name */}
          <Text
            numberOfLines={2}
            style={{ fontSize: 13, fontWeight: "700", color: "#111827", lineHeight: 18, minHeight: 36, marginBottom: 6 }}
          >
            {product.name}
          </Text>

          {/* Dietary tags */}
          {allTags.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 3, marginBottom: 7 }}>
              {allTags.map((tag) => {
                const c = TAG_COLORS[tag.color || ""] || DEFAULT_TAG;
                const TagIcon = DIETARY_ICONS[tag.name] ?? Info;
                return (
                  <View
                    key={tag.name}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: c.bg,
                      borderWidth: 1,
                      borderColor: c.border,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 20,
                      gap: 3,
                    }}
                  >
                    <TagIcon size={11} color={c.text} />
                    <Text style={{ fontSize: 11, fontWeight: "600", color: c.text }}>{tag.display_name}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={{ height: 18, marginBottom: 7 }} />
          )}

          {/* Price */}
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#111827", marginBottom: 6 }}>
            {formatPrice(product.price)}
          </Text>

          <StockBadge stock={product.stock} variant="inline" />

          {/* Add to cart */}
          <Animated.View style={cartAnimatedStyle}>
            <Pressable
              ref={addBtnRef}
              onPress={handleAddToCart}
              disabled={isOutOfStock}
              accessibilityLabel={isOutOfStock ? `${product.name} sin stock` : `Agregar ${product.name} al carrito`}
              style={{
                width: "100%",
                borderRadius: 999,
                paddingVertical: 9,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isOutOfStock ? "#E5E7EB" : "#000000",
                minHeight: 44,
                ...Platform.select<any>({
                  web: { boxShadow: isOutOfStock ? "none" : "0px 2px 8px rgba(0,0,0,0.1)" },
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
              <Text style={{ fontSize: 11, fontWeight: "700", color: isOutOfStock ? "#9CA3AF" : "#FFFFFF" }}>
                {isOutOfStock ? "Sin stock" : "Agregar al carrito"}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(ProductCard);
