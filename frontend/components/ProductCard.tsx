/**
 * ProductCard — shared visual core for all product card surfaces.
 * Used by ProductListItem (grid) and HorizontalProductCard (horizontal scroll).
 * Change the design here and it propagates everywhere automatically.
 */
import FavoriteButton from "@/components/FavoriteButton";
import { RatingStars } from "@/components/RatingStars";
import StockBadge from "@/components/StockBadge";
import { Text } from "@/components/ui/text";
import { formatPrice } from "@/lib/formatPrice";
import { theme } from "@/lib/theme";
import { useCartAnimation } from "@/store/cartAnimationStore";
import { useCart } from "@/store/cartStore";
import type { Product } from "@/types/product";
import { normalizeDietaryTag } from "@/types/product";
import { getProductRating } from "@/api/products";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Dumbbell,
  Gauge,
  Heart,
  Info,
  MilkOff,
  Package,
  Store,
  Vegan,
  WheatOff,
} from "lucide-react-native";
import { memo, useRef, useState } from "react";
import {
  Alert,
  GestureResponderEvent,
  Image,
  Platform,
  Pressable,
  View,
} from "react-native";

import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { colors, shadows } = theme;

const DIETARY_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; color?: string }>
> = {
  "sin-gluten": WheatOff,
  vegano: Vegan,
  "para-veganos": Vegan,
  "sin-lactosa": MilkOff,
  "bajo-en-azucar": Gauge,
  "alto-en-proteina": Dumbbell,
  "para-diabeticos": Heart,
};

const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> =
  {
    green: { bg: colors.brand.greenLight, text: colors.success, border: "#86EFAC" },
    blue: { bg: "#EFF6FF", text: "#1D4ED8", border: "#93C5FD" },
    orange: { bg: "#FFF7ED", text: "#C2410C", border: "#FDBA74" },
    purple: { bg: "#FAF5FF", text: "#7E22CE", border: "#D8B4FE" },
    red: { bg: "#FEF2F2", text: colors.error, border: "#FCA5A5" },
    emerald: { bg: "#ECFDF5", text: colors.success, border: "#6EE7B7" },
  };
const DEFAULT_TAG = { bg: colors.legacy.gray[50], text: colors.legacy.gray[600], border: colors.border.default };

export type ProductCardProps = {
  product: Product;
  /** Width of the card. "full" = flex:1 (grid), number = fixed px (horizontal scroll) */
  width: "full" | number;
  /** Called when the add-to-cart button is pressed. Defaults to cart store action. */
  onAddToCart?: () => void;
};

function ProductCard({ product, width, onAddToCart }: ProductCardProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const addProduct = useCart((state) => state.addProduct);
  const triggerFly = useCartAnimation((s) => s.trigger);
  const isOutOfStock = product.stock === 0;
  const cartScale = useSharedValue(1);
  const addBtnRef = useRef<any>(null);
  const [imgError, setImgError] = useState(false);

  const { data: rating } = useQuery({
    queryKey: ['product-rating', product.id],
    queryFn: () => getProductRating(Number(product.id)),
    staleTime: 5 * 60 * 1000,
    enabled: !!product.id,
  });

  const cartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartScale.value }],
  }));

  const handleAddToCart = (e: GestureResponderEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (!isSignedIn) {
      Alert.alert(
        "Inicia sesion",
        "Necesitas iniciar sesion para agregar productos al carrito.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Iniciar sesion",
            onPress: () => router.push("/(auth)/login"),
          },
        ]
      );
      return;
    }
    cancelAnimation(cartScale);
    cartScale.value = withSequence(
      withTiming(0.95, { duration: 80, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) })
    );
    (onAddToCart ?? (() => addProduct(product)))();
    addBtnRef.current?.measureInWindow(
      (x: number, y: number, w: number, h: number) => {
        triggerFly(x + w / 2, y + h / 2);
      }
    );
  };

  const allTags = (product.dietary_tags ?? []).map(normalizeDietaryTag);
  const categoryLabel = product.category
    ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
    : null;

  const containerStyle =
    width === "full" ? { flex: 1 as const } : { width: width as number };

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
          backgroundColor: colors.surface.card,
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.border.subtle,
          ...Platform.select<any>({
            web: {
              boxShadow: shadows.lift,
            },
            ios: {
              shadowColor: colors.legacy.black,
              shadowOpacity: 0.1,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 3 },
            },
            android: { elevation: 3 },
            default: {},
          }),
        }}
      >
        {/* Image */}
        <View style={{ padding: 8 }}>
          <View
            style={{
              position: "relative",
              aspectRatio: 4 / 3,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {!imgError && product.image ? (
              <Image
                source={{ uri: product.image }}
                style={{
                  width: "100%",
                  height: "100%",
                  opacity: isOutOfStock ? 0.5 : 1,
                }}
                resizeMode="cover"
                onError={() => setImgError(true)}
                alt={`Imagen de ${product.name}`}
              />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: colors.legacy.gray[100],
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Package size={32} color={colors.border.default} strokeWidth={1.5} />
              </View>
            )}
            <StockBadge stock={product.stock} variant="overlay" />
            <View
              style={{ position: "absolute", top: 6, right: 6, zIndex: 10 }}
            >
              <FavoriteButton productId={Number(product.id)} size={16} />
            </View>
          </View>
        </View>

        {/* Content */}
        <View
          style={{ paddingHorizontal: 10, paddingTop: 4, paddingBottom: 12 }}
        >
          {/* Category */}
          {categoryLabel && (
            <Text
              style={{
                fontSize: 9,
                color: colors.ink.subtle,
                fontWeight: "600",
                letterSpacing: 0.8,
                marginBottom: 4,
                textTransform: "uppercase",
              }}
              numberOfLines={1}
            >
              {categoryLabel}
            </Text>
          )}

          {/* Name — single line with ellipsis */}
          <Text
            numberOfLines={1}
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: colors.ink.primary,
              marginBottom: 2,
            }}
          >
            {product.name}
          </Text>

          {/* Vendor name */}
          {product.vendor_name && (
            <View className="flex-row items-center mb-2">
              <Store size={12} color={colors.ink.muted} style={{ marginRight: 4 }} />
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 11,
                  fontWeight: "400",
                  color: colors.ink.muted,
                }}
              >
                {product.vendor_name}
              </Text>
            </View>
          )}

          {/* Product rating */}
          {rating && rating.review_count > 0 && (
            <View className="flex-row items-center mb-2">
              <RatingStars rating={rating.avg_rating} size={12} />
              <Text className="text-xs text-gray-500 ml-1">
                ({rating.review_count})
              </Text>
            </View>
          )}

          {/* Dietary tags — max 2 visible, +N for rest */}
          {allTags.length > 0 ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
                marginBottom: 8,
              }}
            >
              {allTags.slice(0, 2).map((tag) => {
                const c = TAG_COLORS[tag.color || ""] || DEFAULT_TAG;
                const TagIcon = DIETARY_ICONS[tag.name] ?? Info;
                return (
                  <View
                    key={tag.name}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: c.bg,
                      borderWidth: 0.8,
                      borderColor: c.border,
                      paddingHorizontal: 5,
                      paddingVertical: 2,
                      borderRadius: 10,
                      gap: 2,
                    }}
                  >
                    <TagIcon size={10} color={c.text} />
                    <Text
                      style={{ fontSize: 10, fontWeight: "600", color: c.text }}
                    >
                      {tag.display_name}
                    </Text>
                  </View>
                );
              })}
              {allTags.length > 2 && (
                <View
                  style={{
                    backgroundColor: colors.legacy.gray[100],
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 12,
                    borderWidth: 0.8,
                    borderColor: colors.legacy.gray[200],
                  }}
                >
                  <Text
                    style={{ fontSize: 9, fontWeight: "700", color: colors.ink.muted }}
                  >
                    +{allTags.length - 2}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={{ height: 22, marginBottom: 2 }} />
          )}

          {/* Price + Stock row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "800",
                color: colors.ink.primary,
                letterSpacing: -0.3,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700" }}>$</Text>
              {formatPrice(product.price).replace("$", "")}
            </Text>
            <StockBadge stock={product.stock} variant="inline" />
          </View>

          {/* Add to cart — compact button */}
          <Animated.View style={cartAnimatedStyle}>
            <Pressable
              ref={addBtnRef}
              onPress={handleAddToCart}
              disabled={isOutOfStock}
              accessibilityLabel={
                isOutOfStock
                  ? `${product.name} sin stock`
                  : `Agregar ${product.name} al carrito`
              }
              style={{
                width: "100%",
                paddingVertical: 7,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isOutOfStock ? colors.legacy.gray[200] : colors.ink.primary,
                minHeight: 36,
                borderRadius: 999,
                ...Platform.select<any>({
                  web: {
                    boxShadow: isOutOfStock
                      ? "none"
                      : "0px 2px 6px rgba(0,0,0,0.18)",
                  },
                  default: isOutOfStock
                    ? {}
                    : {
                        shadowColor: colors.legacy.black,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.18,
                        shadowRadius: 4,
                        elevation: 3,
                      },
                }),
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: isOutOfStock ? colors.ink.subtle : colors.ink.inverse,
                  letterSpacing: 0.2,
                }}
              >
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
