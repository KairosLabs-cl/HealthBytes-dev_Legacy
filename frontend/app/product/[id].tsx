import {
  fetchProductById,
  getProductRating,
  getProductReviews,
  listProducts,
  type Review,
} from "@/api/products";
import { Product } from "@/types/product";
import { DietaryBadgeList } from "@/components/DietaryBadge";
import FavoriteButton from "@/components/FavoriteButton";
import ProductCard from "@/components/ProductCard";
import { useShimmerStyle } from "@/components/ProductCardSkeleton";
import { RatingStars } from "@/components/RatingStars";
import { ReviewCard } from "@/components/ReviewCard";
import ReviewModal from "@/components/ReviewModal";
import StockBadge from "@/components/StockBadge";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatPrice } from "@/lib/formatPrice";
import { useCart, selectCartItemCount } from "@/store/cartStore";
import { useRecentlyViewed } from "@/store/recentlyViewedStore";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@clerk/clerk-expo";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronRight,
  LogIn,
  Minus,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  Store,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Pressable, ScrollView, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function ProductDetailSkeleton() {
  const shimmer = useShimmerStyle();

  return (
    <View className="flex-1 bg-surface-card">
      {/* Image placeholder */}
      <Animated.View style={shimmer}>
        <View className="bg-surface-elevated items-center justify-center py-4">
          <View className="w-full h-64" />
        </View>
      </Animated.View>

      <View className="px-5 py-5">
        {/* Badges */}
        <View className="flex-row gap-2 mb-3">
          <Animated.View style={shimmer}>
            <View className="h-6 w-20 bg-surface-muted rounded-full" />
          </Animated.View>
          <Animated.View style={shimmer}>
            <View className="h-6 w-24 bg-surface-muted rounded-full" />
          </Animated.View>
        </View>

        {/* Title + Price row */}
        <View className="flex-row items-start justify-between mb-3">
          <Animated.View style={shimmer}>
            <View className="h-7 bg-surface-muted rounded w-48 mr-4" />
          </Animated.View>
          <Animated.View style={shimmer}>
            <View className="h-7 bg-surface-muted rounded w-20" />
          </Animated.View>
        </View>

        {/* Stock */}
        <Animated.View style={shimmer}>
          <View className="h-4 bg-surface-muted rounded w-1/2 mb-5" />
        </Animated.View>

        {/* Description */}
        <Animated.View style={shimmer}>
          <View className="h-4 bg-surface-muted rounded w-full mb-2" />
        </Animated.View>
        <Animated.View style={shimmer}>
          <View className="h-4 bg-surface-muted rounded w-5/6 mb-2" />
        </Animated.View>
        <Animated.View style={shimmer}>
          <View className="h-4 bg-surface-muted rounded w-2/3" />
        </Animated.View>
      </View>
    </View>
  );
}

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { palette, statusBarStyle } = useAppTheme();
  const { colors } = palette;
  const insets = useSafeAreaInsets();
  const addProduct = useCart((state) => state.addProduct);
  const decrementProduct = useCart((state) => state.decrementProduct);
  // Use deterministic route parameter `id` instead of asynchronous `product?.id`
  // to avoid evaluating to undefined during loading state and ensure a stable selector.
  const currentInCart = useCart(
    (state) =>
      state.items.find((i) => i.product.id === Number(id))?.quantity || 0
  );
  const cartItemCount = useCart(selectCartItemCount);
  const ctaScale = useSharedValue(1);

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  // Fly-to-cart animation
  const ctaBtnRef = useRef<View>(null);
  const cartBounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flyX = useSharedValue(0);
  const flyY = useSharedValue(0);
  const flyScale = useSharedValue(0);
  const flyOpacity = useSharedValue(0);
  const flyRotate = useSharedValue(0);

  // Cart button (top-right) bounce on impact
  const cartBtnScale = useSharedValue(1);

  const flyingStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: flyX.value,
    top: flyY.value,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ink.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    opacity: flyOpacity.value,
    transform: [{ scale: flyScale.value }, { rotate: `${flyRotate.value}deg` }],
    zIndex: 9999,
  }));

  const cartBtnAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartBtnScale.value }],
  }));

  const triggerFlyAnimation = (startX: number, startY: number) => {
    // Cancel in-flight animations so rapid presses start clean
    cancelAnimation(flyX);
    cancelAnimation(flyY);
    cancelAnimation(flyScale);
    cancelAnimation(flyOpacity);
    cancelAnimation(flyRotate);
    cancelAnimation(cartBtnScale);
    if (cartBounceTimer.current) {
      clearTimeout(cartBounceTimer.current);
      cartBounceTimer.current = null;
    }

    // Target: cart button top-right (right: 20, top: insets.top + 8, size 48px)
    const targetX = SCREEN_WIDTH - 20 - 24; // right margin + half button
    const targetY = insets.top + 8 + 24; // top margin + half button

    flyX.value = startX - 22;
    flyY.value = startY - 22;
    flyScale.value = 0;
    flyOpacity.value = 0;
    flyRotate.value = 0;

    // ─── Phase 1 (0–500ms): pop in + jiggle ──────────────────────────────
    flyScale.value = withSequence(
      withTiming(1.35, { duration: 180, easing: Easing.out(Easing.back(2.5)) }),
      withTiming(1.05, { duration: 120 }),
      withTiming(1.18, { duration: 100, easing: Easing.inOut(Easing.ease) }),
      withTiming(1.0, { duration: 100, easing: Easing.inOut(Easing.ease) }),
      // ─── Phase 2 (500–1000ms): shrink on arrival ─────────────────────
      withTiming(0.5, { duration: 350, easing: Easing.in(Easing.cubic) }),
      withTiming(0, { duration: 150 })
    ); // 180+120+100+100+350+150 = 1000ms

    flyOpacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withDelay(770, withTiming(0, { duration: 150 }))
    );

    // Jiggle then full spin
    flyRotate.value = withSequence(
      withTiming(-22, { duration: 130 }),
      withTiming(22, { duration: 130 }),
      withTiming(-12, { duration: 90 }),
      withTiming(12, { duration: 90 }),
      withTiming(0, { duration: 60 }),
      withTiming(360, { duration: 500, easing: Easing.linear })
    ); // 1000ms

    // Y: float up slightly during jiggle, then fly straight to cart button
    flyY.value = withSequence(
      withTiming(startY - 52, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      }),
      withTiming(targetY - 22, {
        duration: 500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      })
    );

    // X: hold while jiggling, then glide to target
    flyX.value = withDelay(
      500,
      withTiming(targetX - 22, {
        duration: 500,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      })
    );

    // Cart button bounces when bubble arrives (~950ms)
    cartBounceTimer.current = setTimeout(() => {
      cartBounceTimer.current = null;
      cancelAnimation(cartBtnScale);
      cartBtnScale.value = withSequence(
        withTiming(1.25, {
          duration: 200,
          easing: Easing.out(Easing.back(1.5)),
        }),
        withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
      );
    }, 950);
  };

  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products", id],
    queryFn: () => fetchProductById(Number(id)),
  });

  const { data: vendorProducts } = useQuery({
    queryKey: ["products", "vendor", product?.vendor_name],
    queryFn: () => listProducts({ search: product?.vendor_name, limit: 6 }),
    enabled: !!product?.vendor_name,
    staleTime: 5 * 60 * 1000,
  });

  const { data: rating, refetch: refetchRating } = useQuery({
    queryKey: ["product-rating", id],
    queryFn: () => getProductRating(Number(id)),
    enabled: !!id,
  });

  const [showAllReviews, setShowAllReviews] = useState(false);
  const reviewLimit =
    showAllReviews && rating?.review_count ? rating.review_count : 5;

  const { data: reviews, refetch: refetchReviews } = useQuery({
    queryKey: ["product-reviews", id, reviewLimit],
    queryFn: () => getProductReviews(Number(id), 0, reviewLimit),
    enabled: !!id,
  });

  // Duplicate product-rating query removed to prevent redundant cache observers and double re-renders

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [cartFeedback, setCartFeedback] = useState<string | null>(null);

  // Filter out the current product from the vendor products list
  const otherVendorProducts = useMemo(() => {
    return vendorProducts?.filter((p) => p.id.toString() !== id) || [];
  }, [vendorProducts, id]);

  // Memoize nutritional info parsing — previously re-parsed on every render
  const nutritionData = useMemo(() => {
    if (!product?.nutritional_info) return null;
    try {
      return JSON.parse(product.nutritional_info);
    } catch {
      return null;
    }
  }, [product?.nutritional_info]);

  const canAddMore = product
    ? (product.stock ?? 0) > 0 && currentInCart < (product.stock ?? 0)
    : false;

  const addRecentlyViewed = useRecentlyViewed((state) => state.add);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
    }
  }, [product, addRecentlyViewed]);

  const handleAddToCart = () => {
    if (!isSignedIn) {
      setCartFeedback("Inicia sesión para agregar productos al carrito.");
      return;
    }

    cancelAnimation(ctaScale);
    ctaScale.value = withSequence(
      withTiming(0.95, { duration: 80, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 200, easing: Easing.out(Easing.back(2)) })
    );

    if (!product || !canAddMore) return;

    try {
      addProduct(product);
      setCartFeedback(null);
      ctaBtnRef.current?.measureInWindow(
        (x: number, y: number, w: number, h: number) => {
          triggerFlyAnimation(x + w / 2, y + h / 2);
        }
      );
    } catch {
      setCartFeedback("No se pudo agregar al carrito. Intenta nuevamente.");
    }
  };

  const handleDecrement = () => {
    if (!product || currentInCart === 0) return;
    decrementProduct(product.id);
  };

  const ctaLabel = () => {
    const stock = product?.stock ?? 0;
    if (!product || stock === 0) return "Agotado";
    if (currentInCart >= stock) return "Máximo alcanzado";
    if (currentInCart > 0) return "Agregar uno más";
    return "Agregar al carrito";
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ProductDetailSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-surface-warm" edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 text-lg mb-4">
            Producto no encontrado
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="flex-row items-center gap-2 rounded-2xl bg-ink px-6 py-3"
            style={{ minHeight: 48 }}
            accessibilityRole="button"
            accessibilityLabel="Reintentar cargar producto"
          >
            <RefreshCw size={18} color={colors.ink.inverse} />
            <Text className="text-ink-inverse font-bold">Reintentar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ProductDetailSkeleton />
      </>
    );
  }

  const productStock = product.stock ?? 0;

  return (
    <View className="flex-1 bg-surface-warm">
      <StatusBar style={statusBarStyle} />
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Producto" icon={Package} showBackButton={true} />

      {/* Floating Cart Button — nav bar style, fly-to-cart target */}
      <Animated.View
        style={[
          cartBtnAnimatedStyle,
          {
            position: "absolute",
            right: 20,
            top: insets.top + 8,
            zIndex: 50,
            elevation: 5,
          },
        ]}
      >
        <Pressable
          onPress={() => router.push("/cart")}
          className="h-12 w-12 items-center justify-center rounded-2xl bg-ink"
          accessibilityRole="button"
          accessibilityLabel={
            cartItemCount > 0
              ? `Ver carrito, ${cartItemCount} producto${cartItemCount !== 1 ? "s" : ""}`
              : "Ver carrito"
          }
          style={{
            boxShadow: "0 18px 32px -18px rgba(9,9,11,0.55)",
          }}
        >
          <View>
            <ShoppingCart size={24} color={colors.ink.inverse} />
            {cartItemCount > 0 && (
              <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[18px] h-[18px] px-1 items-center justify-center">
                <Text className="text-white text-[10px] font-bold">
                  {cartItemCount}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      >
        {/* Hero Image */}
        <Animated.View entering={FadeIn.duration(400)}>
          <View className="px-4 py-4">
            <View className="items-center justify-center overflow-hidden rounded-[28px] border border-border-subtle bg-surface-card py-6">
              <Image
                source={{ uri: product.image }}
                className="h-72 w-full"
                resizeMode="contain"
                alt={`Imagen de ${product.name}`}
              />
              <View className="absolute bottom-0 h-12 w-full bg-surface-elevated/80" />
            </View>
          </View>
        </Animated.View>

        {/* Product Info */}
        <View className="px-5 py-5">
          {/* SECTION 1: Trust Badges + Name + Price */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <DietaryBadgeList tags={product.dietary_tags} />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(160).duration(400)}
            className="mt-3 mb-4"
          >
            <Text
              className="mb-2 text-3xl font-black leading-tight text-ink"
              style={{ letterSpacing: -0.5 }}
            >
              {product.name}
            </Text>
            {product.vendor_name && (
              <Pressable
                onPress={() =>
                  router.push(
                    `/search?q=${encodeURIComponent(product.vendor_name!)}`
                  )
                }
                className="flex-row items-center py-1 active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel={`Ver productos de ${product.vendor_name}`}
              >
                <Store size={14} color="#166534" style={{ marginRight: 6 }} />
              <Text className="text-sm font-semibold text-emerald-700">
                  Vendedor:{" "}
                  <Text className="underline">{product.vendor_name}</Text>
                </Text>
              </Pressable>
            )}
          </Animated.View>

          {/* Price + Stock — clear visual hierarchy */}
          <Animated.View
            entering={FadeInUp.delay(220).duration(400)}
            className="mb-6"
          >
            <View className="flex-row items-baseline gap-3">
              <Text
                className="text-[18px] font-black text-ink"
                style={{ letterSpacing: -0.2 }}
              >
                {formatPrice(product.price)}
              </Text>
              {productStock === 0 ? (
                <View className="flex-row items-center rounded-2xl bg-red-50 px-3 py-1.5">
                  <View className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
                  <Text className="text-xs font-semibold text-red-700">
                    Agotado
                  </Text>
                </View>
              ) : productStock <= 5 ? (
                <StockBadge stock={productStock} variant="inline" />
              ) : (
                <View className="flex-row items-center rounded-2xl bg-emerald-50 px-3 py-1.5">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                  <Text className="text-xs font-semibold text-emerald-700">
                    En stock
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Separator */}
          <View className="mb-6 h-px bg-border-subtle" />

          {/* Description */}
          <View className="mb-6">
            <Text className="mb-2 text-xs font-black uppercase tracking-[1px] text-zinc-500">
              Descripción
            </Text>
            <Text className="max-w-[520px] text-base leading-6 text-ink-muted">
              {product.description ||
                "Consulta ingredientes, etiquetado e información disponible antes de decidir si este producto se ajusta a tus restricciones alimentarias."}
            </Text>
          </View>

          {/* Separator */}
          <View className="mb-6 h-px bg-border-subtle" />

          {/* Nutritional Info */}
          {nutritionData && (
            <View className="mb-6">
              <Text className="mb-3 text-xs font-black uppercase tracking-[1px] text-zinc-500">
                Información nutricional
              </Text>
              <View className="rounded-[24px] border border-border-subtle bg-surface-card p-4">
                <View className="gap-3">
                  <View className="flex-row justify-between py-2">
                    <Text className="text-sm text-ink-muted font-medium">Calorías</Text>
                    <Text className="text-sm font-bold text-ink">{nutritionData.calories} kcal</Text>
                  </View>
                  <View className="h-px bg-border-subtle" />
                  <View className="flex-row justify-between py-2">
                    <Text className="text-sm text-ink-muted font-medium">Proteínas</Text>
                    <Text className="text-sm font-bold text-ink">{nutritionData.protein}g</Text>
                  </View>
                  <View className="h-px bg-border-subtle" />
                  <View className="flex-row justify-between py-2">
                    <Text className="text-sm text-ink-muted font-medium">Carbohidratos</Text>
                    <Text className="text-sm font-bold text-ink">{nutritionData.carbs}g</Text>
                  </View>
                  <View className="h-px bg-border-subtle" />
                  <View className="flex-row justify-between py-2">
                    <Text className="text-sm text-ink-muted font-medium">Grasas</Text>
                    <Text className="text-sm font-bold text-ink">{nutritionData.fat}g</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Vendor Carousel */}
          {product.vendor_name && otherVendorProducts.length > 0 && (
            <View className="mt-8 mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-black tracking-[-0.2px] text-ink">
                  Más de {product.vendor_name}
                </Text>
                <Pressable
                  onPress={() =>
                    router.push(
                      `/search?q=${encodeURIComponent(product.vendor_name!)}`
                    )
                  }
                  className="h-11 flex-row items-center rounded-2xl bg-surface-card px-3 active:bg-surface-muted"
                  accessibilityRole="button"
                  accessibilityLabel={`Ver tienda de ${product.vendor_name}`}
                >
                  <Text className="text-sm font-bold text-ink-muted mr-1">
                    Ver tienda
                  </Text>
                  <ChevronRight size={14} color={colors.icon.muted} />
                </Pressable>
              </View>
              <View className="-mx-5">
                <FlashList<Product>
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                  data={otherVendorProducts.slice(0, 5)}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <ProductCard product={item} width={160} />
                  )}
                  estimatedItemSize={172}
                />
              </View>
            </View>
          )}

          {/* Product Reviews */}
          <View className="mt-6 mb-8 px-1">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-black tracking-[-0.2px] text-ink">
                Reseñas
              </Text>
              {rating && rating.review_count > 0 && (
                <View className="flex-row items-center gap-2 rounded-2xl bg-surface-card px-3 py-1.5">
                  <RatingStars
                    rating={rating.avg_rating}
                    size={16}
                    showFraction
                  />
                  <Text className="text-sm text-ink-subtle font-medium">
                    ({rating.review_count})
                  </Text>
                </View>
              )}
            </View>

            {rating && rating.review_count > 0 ? (
              <>
                {reviews?.map((review: Review) => (
                  <ReviewCard
                    key={review.id}
                    userName={review.user_name || "Usuario"}
                    userImage={review.user_image}
                    rating={review.rating}
                    comment={review.comment}
                    createdAt={review.created_at}
                  />
                ))}

                {rating.review_count > 5 && !showAllReviews && (
                  <Pressable
                    onPress={() => setShowAllReviews(true)}
                    className="mt-2 py-3"
                    accessibilityRole="button"
                    accessibilityLabel={`Ver todas las ${rating.review_count} reseñas`}
                    accessibilityHint="Muestra todas las reseñas disponibles en esta pantalla"
                    accessibilityState={{ expanded: false }}
                  >
                    <Text className="text-green-600 text-center font-semibold">
                      Ver las {rating.review_count} reseñas
                    </Text>
                  </Pressable>
                )}
              </>
            ) : (
              <View className="rounded-[24px] border border-border-subtle bg-surface-card p-6">
                <Text className="text-center text-ink-muted">
                  Sé el primero en valorar este producto
                </Text>
              </View>
            )}

            {/* Botón para escribir reseña */}
            <Pressable
              onPress={() => setReviewModalVisible(true)}
              className="mt-4 rounded-2xl bg-ink py-3.5"
              accessibilityRole="button"
              accessibilityLabel={`Escribir una reseña de ${product.name}`}
            >
              <Text className="text-ink-inverse text-center font-bold">
                Escribir una reseña
              </Text>
            </Pressable>
          </View>

          {/* Review Modal */}
          <ReviewModal
            productId={Number(id)}
            visible={reviewModalVisible}
            onClose={() => setReviewModalVisible(false)}
            onReviewSubmitted={() => {
              refetchReviews();
              refetchRating();
            }}
          />
        </View>
      </ScrollView>

      {/* Sticky CTA bar */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-border-subtle bg-surface-card px-5 pt-3"
        style={{
          paddingBottom: insets.bottom + 12,
          boxShadow: "0 -18px 40px -30px rgba(15,23,42,0.45)",
        }}
      >
        {cartFeedback && (
          <View
            className="mb-3 flex-row items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2"
            accessibilityRole="alert"
          >
            <Text className="flex-1 pr-3 text-sm font-semibold text-amber-900">
              {cartFeedback}
            </Text>
            {!isSignedIn && (
              <Pressable
                onPress={() => router.push("/(auth)/login")}
                className="h-10 flex-row items-center gap-1 rounded-xl bg-ink px-3"
                accessibilityRole="button"
                accessibilityLabel="Iniciar sesión"
              >
                <LogIn size={14} color={colors.ink.inverse} strokeWidth={2.4} />
                <Text className="text-xs font-bold text-ink-inverse">Entrar</Text>
              </Pressable>
            )}
          </View>
        )}
        <View className="flex-row items-center gap-2">
          {/* Favorite button */}
          <View className="h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-surface-muted">
            <FavoriteButton productId={Number(id)} size={20} />
          </View>

          {/* Quantity selector — visible only when item already in cart */}
          {currentInCart > 0 && (
            <View className="h-12 flex-row items-center overflow-hidden rounded-2xl border border-border-default bg-surface-muted">
              <Pressable
                onPress={handleDecrement}
                className="w-11 h-12 items-center justify-center active:bg-surface-elevated"
                style={{ minWidth: 44 }}
                accessibilityRole="button"
                accessibilityLabel={`Quitar una unidad de ${product.name}`}
              >
                <Minus size={16} color={colors.icon.primary} />
              </Pressable>
              <Text className="text-base font-bold w-6 text-center text-ink">
                {currentInCart}
              </Text>
              <Pressable
                onPress={handleAddToCart}
                disabled={!canAddMore}
                className="w-11 h-12 items-center justify-center active:bg-surface-elevated"
                style={{ minWidth: 44 }}
                accessibilityRole="button"
                accessibilityLabel={`Agregar una unidad de ${product.name}`}
                accessibilityState={{ disabled: !canAddMore }}
              >
                <Plus size={16} color={canAddMore ? colors.icon.primary : colors.ink.subtle} />
              </Pressable>
            </View>
          )}

          {/* Primary CTA */}
          <Animated.View style={[ctaAnimatedStyle, { flex: 1 }]}>
            <Pressable
              ref={ctaBtnRef}
              onPress={handleAddToCart}
              disabled={!canAddMore}
              className={`h-12 flex-row items-center justify-center gap-2 rounded-2xl ${
                canAddMore ? "bg-ink active:opacity-80" : "bg-surface-muted"
              }`}
              style={{ minHeight: 48 }}
              accessibilityRole="button"
              accessibilityLabel={
                canAddMore
                  ? `${ctaLabel()} ${product.name}`
                  : `${product.name}: ${ctaLabel()}`
              }
              accessibilityState={{ disabled: !canAddMore }}
            >
              <ShoppingCart
                size={18}
                color={canAddMore ? colors.ink.inverse : colors.ink.subtle}
              />
              <Text
                className={`font-semibold text-base ${canAddMore ? "text-ink-inverse" : "text-ink-subtle"}`}
              >
                {ctaLabel()}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>

      {/* Flying cart bubble — renders above everything, no touch */}
      <Animated.View style={flyingStyle} pointerEvents="none">
        <ShoppingCart size={18} color={colors.ink.inverse} />
      </Animated.View>
    </View>
  );
}
