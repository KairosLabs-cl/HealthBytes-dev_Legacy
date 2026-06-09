/**
 * ProductCard — shared visual core for all product card surfaces.
 * Used by ProductListItem (grid) and HorizontalProductCard (horizontal scroll).
 * Change the design here and it propagates everywhere automatically.
 */
import FavoriteButton from "@/components/FavoriteButton";
import { RatingStars } from "@/components/RatingStars";
import StockBadge from "@/components/StockBadge";
import { Text } from "@/components/ui/text";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatPrice } from "@/lib/formatPrice";
import { DIETARY_ICON_BY_SLUG } from "@/lib/dietaryOptions";
import { useCartAnimation } from "@/store/cartAnimationStore";
import { useCart } from "@/store/cartStore";
import type { Product } from "@/types/product";
import { normalizeDietaryTag } from "@/types/product";
import { useAuth } from "@clerk/clerk-expo";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import {
  Info,
  Package,
  Store,
} from "lucide-react-native";
import { memo, useRef, useState } from "react";
import {
  Alert,
  GestureResponderEvent,
  Platform,
  Pressable,
  View,
  type ViewStyle,
} from "react-native";

import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type CrossPlatformViewStyle = ViewStyle & { boxShadow?: string };

export type ProductCardProps = {
  product: Product;
  /** Width of the card. "full" = flex:1 (grid), number = fixed px (horizontal scroll) */
  width: "full" | number;
  /** Called when the add-to-cart button is pressed. Defaults to cart store action. */
  onAddToCart?: () => void;
  rating?: { avg_rating: number; review_count: number } | null;
};

function ProductCard({
  product,
  width,
  onAddToCart,
  rating,
}: ProductCardProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { palette, isDark } = useAppTheme();
  const { colors } = palette;
  const addProduct = useCart((state) => state.addProduct);
  const triggerFly = useCartAnimation((s) => s.trigger);
  const isOutOfStock = product.stock === 0;
  const cartScale = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const addBtnRef = useRef<View>(null);
  const [imgError, setImgError] = useState(false);

  const cartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartScale.value }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
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
  const tagColors: Record<string, { bg: string; text: string; border: string }> =
    {
      green: isDark
        ? { bg: "#064E3B", text: "#34D399", border: "#065F46" }
        : { bg: colors.brand.greenLight, text: colors.success, border: "#86EFAC" },
      blue: isDark
        ? { bg: "#1E3A8A", text: "#60A5FA", border: "#1E40AF" }
        : { bg: "#EFF6FF", text: "#1D4ED8", border: "#93C5FD" },
      orange: isDark
        ? { bg: "#7C2D12", text: "#FB923C", border: "#9A3412" }
        : { bg: "#FFF7ED", text: "#C2410C", border: "#FDBA74" },
      purple: isDark
        ? { bg: "#4C1D95", text: "#A78BFA", border: "#5B21B6" }
        : { bg: "#FAF5FF", text: "#7E22CE", border: "#D8B4FE" },
      red: isDark
        ? { bg: "#7F1D1D", text: "#F87171", border: "#991B1B" }
        : { bg: "#FEF2F2", text: colors.error, border: "#FCA5A5" },
      emerald: isDark
        ? { bg: "#064E3B", text: "#34D399", border: "#065F46" }
        : { bg: "#ECFDF5", text: colors.success, border: "#6EE7B7" },
      black: isDark
        ? { bg: "#27272A", text: "#E4E4E7", border: "#3F3F46" }
        : { bg: "#18181B", text: "#FFFFFF", border: "#3F3F46" },
      white: isDark
        ? { bg: "#E4E4E7", text: "#18181B", border: "#D4D4D8" }
        : { bg: "#FFFFFF", text: "#18181B", border: "#E4E4E7" },
    };
  const defaultTag = isDark
    ? { bg: colors.legacy.gray[800], text: colors.legacy.gray[300], border: colors.border.default }
    : { bg: colors.legacy.gray[50], text: colors.legacy.gray[600], border: colors.border.default };
  const categoryLabel = product.category
    ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
    : null;

  const containerStyle =
    width === "full" ? { flex: 1 as const } : { width: width as number };

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      onPressIn={() => {
        cardScale.value = withTiming(0.96, { duration: 100, easing: Easing.out(Easing.ease) });
      }}
      onPressOut={() => {
        cardScale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
      }}
      style={containerStyle}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalles de ${product.name}, ${formatPrice(product.price)}`}
      accessibilityHint="Toca para ver detalles del producto"
    >
      <Animated.View
        style={[{
          ...containerStyle,
          backgroundColor: colors.surface.card,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.border.subtle,
          ...Platform.select<CrossPlatformViewStyle>({
            web: {
              boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)",
            },
            ios: {
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 10 },
            },
            android: { elevation: 2 },
            default: {},
          }),
        }, cardAnimatedStyle]}
      >
        {/* Image */}
        <View style={{ padding: 8, position: "relative" }}>
          {/* Discount Badge */}
          {product.discount_percentage && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 20,
                backgroundColor: "#DC2626", // Red-600
                borderRadius: 25,
                width: 48,
                height: 48,
                alignItems: "center",
                justifyContent: "center",
                ...Platform.select<CrossPlatformViewStyle>({
                  web: {
                    boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
                  },
                  default: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 4,
                  },
                }),
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "900",
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                {`-${product.discount_percentage}%`}
              </Text>
            </View>
          )}
          <View
            style={{
              position: "relative",
              aspectRatio: 1,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: colors.surface.elevated,
            }}
          >
            {!imgError && product.image ? (
              <ExpoImage
                source={{ uri: product.image }}
                style={{
                  width: "100%",
                  height: "100%",
                  opacity: isOutOfStock ? 0.5 : 1,
                }}
                contentFit="cover"
                onError={() => setImgError(true)}
                alt={`Imagen de ${product.name}`}
                transition={200}
                placeholder={{ blurhash: "LGF5]+Yk^6#M@-5c,1J5@[or[Q6." }}
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
                <Package
                  size={32}
                  color={colors.border.default}
                  strokeWidth={1.5}
                />
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
          style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 16 }}
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
              fontSize: 14,
              fontWeight: "800",
              color: colors.ink.primary,
              letterSpacing: -0.3,
              marginBottom: 2,
            }}
          >
            {product.name}
          </Text>

          {/* Vendor name (hidden per request) */}
          {/*
          product.vendor_name && (
            <View className="flex-row items-center mb-2">
              <Store
                size={12}
                color={colors.ink.muted}
                style={{ marginRight: 4 }}
              />
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
          )
          */}

          {/* Product rating */}
          {rating && rating.review_count > 0 && (
            <View className="flex-row items-center mb-2">
              <RatingStars rating={rating.avg_rating} size={12} />
              <Text className="text-xs text-ink-subtle ml-1">
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
                const c = tagColors[tag.color || ""] || defaultTag;
                const TagIcon =
                  DIETARY_ICON_BY_SLUG[
                    tag.name as keyof typeof DIETARY_ICON_BY_SLUG
                  ] ?? Info;
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
                    style={{
                      fontSize: 9,
                      fontWeight: "700",
                      color: colors.ink.muted,
                    }}
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
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "900",
                  color: colors.ink.primary,
                  letterSpacing: -0.5,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "800" }}>$</Text>
                {formatPrice(product.price).replace("$", "")}
              </Text>
              {product.original_price ? (
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "500",
                    color: colors.ink.muted,
                    textDecorationLine: "line-through",
                    marginTop: 1,
                  }}
                >
                  {formatPrice(product.original_price)}
                </Text>
              ) : (
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "500",
                    color: "transparent",
                    marginTop: 1,
                  }}
                >
                  -
                </Text>
              )}
            </View>
            <StockBadge stock={product.stock} variant="inline" />
          </View>

          {/* Add to cart — compact button */}
          <Animated.View style={cartAnimatedStyle}>
            <Pressable
              ref={addBtnRef}
              onPress={handleAddToCart}
              disabled={isOutOfStock}
              accessibilityRole="button"
              accessibilityLabel={
                isOutOfStock
                  ? `${product.name} sin stock`
                  : `Agregar ${product.name} a mi lista`
              }
              accessibilityState={{ disabled: isOutOfStock }}
              hitSlop={4}
              style={{
                width: "100%",
                paddingVertical: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isOutOfStock
                  ? colors.legacy.gray[200]
                  : colors.ink.primary,
                minHeight: 40,
                borderRadius: 16,
                ...Platform.select<CrossPlatformViewStyle>({
                  web: {
                    boxShadow: isOutOfStock
                      ? "none"
                      : "0px 4px 10px rgba(0,0,0,0.1)",
                  },
                  default: isOutOfStock
                    ? {}
                    : {
                        shadowColor: colors.legacy.black,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                        elevation: 2,
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
                {isOutOfStock ? "Sin stock" : "Agregar a mi lista"}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default memo(ProductCard);
