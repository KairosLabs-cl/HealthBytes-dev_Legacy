import { fetchProductById, getProductRating, getProductReviews, listProducts } from "@/api/products";
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
  Minus,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  Store,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Dimensions, Pressable, ScrollView, View } from "react-native";
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
    <View className="flex-1 bg-white">
      {/* Image placeholder */}
      <Animated.View style={shimmer}>
        <View className="bg-gray-50 items-center justify-center py-4">
          <View className="w-full h-64" />
        </View>
      </Animated.View>

      <View className="px-5 py-5">
        {/* Badges */}
        <View className="flex-row gap-2 mb-3">
          <Animated.View style={shimmer}>
            <View className="h-6 w-20 bg-gray-200 rounded-full" />
          </Animated.View>
          <Animated.View style={shimmer}>
            <View className="h-6 w-24 bg-gray-200 rounded-full" />
          </Animated.View>
        </View>

        {/* Title + Price row */}
        <View className="flex-row items-start justify-between mb-3">
          <Animated.View style={shimmer}>
            <View className="h-7 bg-gray-200 rounded w-48 mr-4" />
          </Animated.View>
          <Animated.View style={shimmer}>
            <View className="h-7 bg-gray-200 rounded w-20" />
          </Animated.View>
        </View>

        {/* Stock */}
        <Animated.View style={shimmer}>
          <View className="h-4 bg-gray-200 rounded w-1/2 mb-5" />
        </Animated.View>

        {/* Description */}
        <Animated.View style={shimmer}>
          <View className="h-4 bg-gray-200 rounded w-full mb-2" />
        </Animated.View>
        <Animated.View style={shimmer}>
          <View className="h-4 bg-gray-200 rounded w-5/6 mb-2" />
        </Animated.View>
        <Animated.View style={shimmer}>
          <View className="h-4 bg-gray-200 rounded w-2/3" />
        </Animated.View>
      </View>
    </View>
  );
}

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const router = useRouter();
  const { isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();
  const addProduct = useCart((state) => state.addProduct);
  const decrementProduct = useCart((state) => state.decrementProduct);
  const cartItemCount = useCart(selectCartItemCount);
  const ctaScale = useSharedValue(1);

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  // Fly-to-cart animation
  const ctaBtnRef = useRef<any>(null);
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
    backgroundColor: "#111827",
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
    // Cancel any in-flight animations so rapid presses start clean
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
    queryFn: () => listProducts({ search: product?.vendor_name }),
    enabled: !!product?.vendor_name,
  });

  const { data: rating } = useQuery({
    queryKey: ['product-rating', id],
    queryFn: () => getProductRating(Number(id)),
    enabled: !!id,
  });

  const { data: reviews, refetch: refetchReviews } = useQuery({
    queryKey: ['product-reviews', id],
    queryFn: () => getProductReviews(Number(id), 0, 5),
    enabled: !!id,
  });

  const { refetch: refetchRating } = useQuery({
    queryKey: ['product-rating', id],
    queryFn: () => getProductRating(Number(id)),
    enabled: false,
  });

  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  // Filter out the current product from the vendor products list
  const otherVendorProducts = useMemo(() => {
    return vendorProducts?.filter((p: any) => p.id.toString() !== id) || [];
  }, [vendorProducts, id]);

  // ⚡ Bolt: Inline selector to prevent full component re-renders when unrelated cart items change
  const currentInCart = useCart((state) => state.items.find((i) => i.product.id === Number(id))?.quantity || 0);

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

    cancelAnimation(ctaScale);
    ctaScale.value = withSequence(
      withTiming(0.95, { duration: 80, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 200, easing: Easing.out(Easing.back(2)) })
    );

    if (!product || !canAddMore) return;

    try {
      addProduct(product);
      ctaBtnRef.current?.measureInWindow(
        (x: number, y: number, w: number, h: number) => {
          triggerFlyAnimation(x + w / 2, y + h / 2);
        }
      );
    } catch (err) {
      Alert.alert(
        "Error",
        "No se pudo agregar al carrito. Intenta nuevamente."
      );
    }
  };

  const handleDecrement = () => {
    if (!product || currentInCart === 0) return;
    decrementProduct(product.id);
  };

  const ctaLabel = () => {
    if (!product || product.stock === 0) return "Agotado";
    if (currentInCart >= product.stock) return "Máximo alcanzado";
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
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 text-lg mb-4">
            Producto no encontrado
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="flex-row items-center gap-2 bg-black px-6 py-3 rounded-full"
            style={{ minHeight: 44 }}
          >
            <RefreshCw size={18} color="white" />
            <Text className="text-white font-bold">Reintentar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
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
          className="bg-black p-3 rounded-full"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
          }}
        >
          <View>
            <ShoppingCart size={24} color="white" />
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
          <View className="bg-gradient-to-b from-gray-50 to-white items-center justify-center py-6">
            <Image
              source={{ uri: product.image }}
              className="w-full h-72"
              resizeMode="contain"
              alt={`Imagen de ${product.name}`}
            />
          </View>
        </Animated.View>

        {/* Product Info */}
        <View className="px-5 py-6">
          {/* SECTION 1: Trust Badges + Name + Price */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <DietaryBadgeList tags={product.dietary_tags} />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(160).duration(400)}
            className="mt-3 mb-4"
          >
            <Text className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
              {product.name}
            </Text>
            {product.vendor_name && (
              <Pressable
                onPress={() => router.push(`/search?q=${encodeURIComponent(product.vendor_name!)}`)}
                className="flex-row items-center py-1 active:opacity-70"
              >
                <Store size={14} color="#166534" style={{ marginRight: 6 }} />
                <Text className="text-green-800 font-semibold text-sm">
                  Vendedor: <Text className="underline">{product.vendor_name}</Text>
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
              <Text className="text-3xl font-black text-black">
                {formatPrice(product.price)}
              </Text>
              {product.stock === 0 ? (
                <View className="flex-row items-center bg-red-50 px-3 py-1.5 rounded-full">
                  <View className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
                  <Text className="text-xs font-semibold text-red-700">
                    Agotado
                  </Text>
                </View>
              ) : product.stock <= 5 ? (
                <StockBadge stock={product.stock} variant="inline" />
              ) : (
                <View className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-full">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                  <Text className="text-xs font-semibold text-green-700">
                    En stock
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Separator */}
          <View className="h-0.5 bg-gray-100 mb-6" />

          {/* Description */}
          <Animated.View
            entering={FadeInUp.delay(340).duration(400)}
            className="mb-6"
          >
            <Text className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
              Descripción
            </Text>
            <Text className="text-base leading-6 text-gray-700">
              {product.description ||
                "Producto de alta calidad especialmente seleccionado para personas con restricciones alimentarias. Ingredientes cuidadosamente verificados para garantizar su seguridad."}
            </Text>
          </Animated.View>

          {/* Separator */}
          <View className="h-0.5 bg-gray-100 mb-6" />

          {/* Nutritional Info */}
          {product.nutritional_info &&
            (() => {
              try {
                const nutrition = JSON.parse(product.nutritional_info);
                return (
                  <Animated.View entering={FadeInUp.delay(400).duration(400)}>
                    <Text className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-3">
                      Información nutricional
                    </Text>
                    <View className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-4">
                      <View className="gap-3">
                        <View className="flex-row justify-between py-2">
                          <Text className="text-sm text-gray-600 font-medium">
                            Calorías
                          </Text>
                          <Text className="text-sm font-bold text-gray-900">
                            {nutrition.calories} kcal
                          </Text>
                        </View>
                        <View className="h-px bg-gray-200" />
                        <View className="flex-row justify-between py-2">
                          <Text className="text-sm text-gray-600 font-medium">
                            Proteínas
                          </Text>
                          <Text className="text-sm font-bold text-gray-900">
                            {nutrition.protein}g
                          </Text>
                        </View>
                        <View className="h-px bg-gray-200" />
                        <View className="flex-row justify-between py-2">
                          <Text className="text-sm text-gray-600 font-medium">
                            Carbohidratos
                          </Text>
                          <Text className="text-sm font-bold text-gray-900">
                            {nutrition.carbs}g
                          </Text>
                        </View>
                        <View className="h-px bg-gray-200" />
                        <View className="flex-row justify-between py-2">
                          <Text className="text-sm text-gray-600 font-medium">
                            Grasas
                          </Text>
                          <Text className="text-sm font-bold text-gray-900">
                            {nutrition.fat}g
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                );
              } catch (e) {
                return null;
              }
            })()}

          {/* Vendor Carousel */}
          {product.vendor_name && otherVendorProducts.length > 0 && (
            <Animated.View entering={FadeInUp.delay(500).duration(400)} className="mt-8 mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-extrabold text-gray-900">
                  Más de {product.vendor_name}
                </Text>
                <Pressable
                  onPress={() => router.push(`/search?q=${encodeURIComponent(product.vendor_name!)}`)}
                  className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-full active:bg-gray-100"
                >
                  <Text className="text-sm font-bold text-gray-700 mr-1">Ver tienda</Text>
                  <ChevronRight size={14} color="#374151" />
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
            </Animated.View>
          )}

          {/* Product Reviews */}
          <Animated.View entering={FadeInUp.delay(550).duration(400)} className="mt-6 mb-8 px-1">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-black text-gray-900">
                Reseñas
              </Text>
              {rating && rating.review_count > 0 && (
                <View className="flex-row items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                  <RatingStars rating={rating.avg_rating} size={16} showFraction />
                  <Text className="text-sm text-gray-500 font-medium">
                    ({rating.review_count})
                  </Text>
                </View>
              )}
            </View>
            
            {rating && rating.review_count > 0 ? (
              <>
                {reviews?.slice(0, 5).map((review: any) => (
                  <ReviewCard
                    key={review.id}
                    userName={review.user_name || 'Usuario'}
                    userImage={review.user_image}
                    rating={review.rating}
                    comment={review.comment}
                    createdAt={review.created_at}
                  />
                ))}
                
                {rating.review_count > 5 && (
                  <Pressable className="mt-2 py-3">
                    <Text className="text-green-600 text-center font-semibold">
                      Ver las {rating.review_count} reseñas
                    </Text>
                  </Pressable>
                )}
              </>
            ) : (
              <View className="bg-gray-50 p-6 rounded-2xl">
                <Text className="text-gray-500 text-center">
                  Sé el primero en valorar este producto
                </Text>
              </View>
            )}
            
            {/* Botón para escribir reseña */}
            <Pressable
              onPress={() => setReviewModalVisible(true)}
              className="mt-4 bg-green-600 py-3.5 rounded-xl shadow-sm"
            >
              <Text className="text-white text-center font-bold">
                Escribir una reseña
              </Text>
            </Pressable>
          </Animated.View>

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
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-3"
        style={{
          paddingBottom: insets.bottom + 12,
          elevation: 10,
          backgroundColor: "rgba(255,255,255,0.98)",
        }}
      >
        <View className="flex-row items-center gap-2">
          {/* Favorite button */}
          <View className="w-12 h-12 rounded-full border border-gray-200 items-center justify-center bg-gray-50">
            <FavoriteButton productId={Number(id)} size={20} />
          </View>

          {/* Quantity selector — visible only when item already in cart */}
          {currentInCart > 0 && (
            <View className="flex-row items-center border border-gray-300 rounded-full overflow-hidden h-12 bg-gray-50">
              <Pressable
                onPress={handleDecrement}
                className="w-11 h-12 items-center justify-center active:bg-gray-200"
                style={{ minWidth: 44 }}
              >
                <Minus size={16} color="#111827" />
              </Pressable>
              <Text className="text-base font-bold w-6 text-center text-gray-900">
                {currentInCart}
              </Text>
              <Pressable
                onPress={handleAddToCart}
                disabled={!canAddMore}
                className="w-11 h-12 items-center justify-center active:bg-gray-200"
                style={{ minWidth: 44 }}
              >
                <Plus size={16} color={canAddMore ? "#111827" : "#D1D5DB"} />
              </Pressable>
            </View>
          )}

          {/* Primary CTA */}
          <Animated.View style={[ctaAnimatedStyle, { flex: 1 }]}>
            <Pressable
              ref={ctaBtnRef}
              onPress={handleAddToCart}
              disabled={!canAddMore}
              className={`h-12 rounded-xl items-center justify-center flex-row gap-2 ${
                canAddMore ? "bg-black active:opacity-80" : "bg-gray-300"
              }`}
              style={{ minHeight: 48 }}
            >
              <ShoppingCart
                size={18}
                color={canAddMore ? "white" : "#9CA3AF"}
              />
              <Text
                className={`font-semibold text-base ${canAddMore ? "text-white" : "text-gray-500"}`}
              >
                {ctaLabel()}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>

      {/* Flying cart bubble — renders above everything, no touch */}
      <Animated.View style={flyingStyle} pointerEvents="none">
        <ShoppingCart size={18} color="white" />
      </Animated.View>
    </View>
  );
}
