import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '@/api/products';
import { View, ScrollView, Pressable, Alert, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '@/store/cartStore';
import { useRecentlyViewed } from '@/store/recentlyViewedStore';
import { useEffect, useMemo, useRef } from 'react';
import { ShoppingCart, RefreshCw, ArrowLeft, Minus, Plus } from 'lucide-react-native';
import { formatPrice } from '@/lib/formatPrice';
import { DietaryBadgeList } from '@/components/DietaryBadge';
import StockBadge from '@/components/StockBadge';
import FavoriteButton from '@/components/FavoriteButton';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
import { useShimmerStyle } from '@/components/ProductCardSkeleton';

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
  const insets = useSafeAreaInsets();
  const addProduct = useCart((state) => state.addProduct);
  const decrementProduct = useCart((state) => state.decrementProduct);
  const cartItems = useCart((state) => state.items);
  const ctaScale = useSharedValue(1);

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  // Fly-to-cart animation
  const ctaBtnRef = useRef<any>(null);
  const flyX = useSharedValue(0);
  const flyY = useSharedValue(0);
  const flyScale = useSharedValue(0);
  const flyOpacity = useSharedValue(0);
  const flyRotate = useSharedValue(0);

  // Cart button (top-right) bounce on impact
  const cartBtnScale = useSharedValue(1);

  const flyingStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: flyX.value,
    top: flyY.value,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111827',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    opacity: flyOpacity.value,
    transform: [{ scale: flyScale.value }, { rotate: `${flyRotate.value}deg` }],
    zIndex: 9999,
  }));

  const cartBtnAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartBtnScale.value }],
  }));

  const triggerFlyAnimation = (startX: number, startY: number) => {
    // Target: cart button top-right (right: 20, top: insets.top + 8, size 48px)
    const targetX = SCREEN_WIDTH - 20 - 24; // right margin + half button
    const targetY = insets.top + 8 + 24;    // top margin + half button

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
      withTiming(1.0,  { duration: 100, easing: Easing.inOut(Easing.ease) }),
      // ─── Phase 2 (500–1000ms): shrink on arrival ─────────────────────
      withTiming(0.5, { duration: 350, easing: Easing.in(Easing.cubic) }),
      withTiming(0,   { duration: 150 })
    ); // 180+120+100+100+350+150 = 1000ms

    flyOpacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withDelay(770, withTiming(0, { duration: 150 }))
    );

    // Jiggle then full spin
    flyRotate.value = withSequence(
      withTiming(-22, { duration: 130 }),
      withTiming( 22, { duration: 130 }),
      withTiming(-12, { duration: 90 }),
      withTiming( 12, { duration: 90 }),
      withTiming(  0, { duration: 60 }),
      withTiming(360, { duration: 500, easing: Easing.linear })
    ); // 1000ms

    // Y: float up slightly during jiggle, then fly straight to cart button
    flyY.value = withSequence(
      withTiming(startY - 52, { duration: 500, easing: Easing.out(Easing.ease) }),
      withTiming(targetY - 22, { duration: 500, easing: Easing.bezier(0.4, 0, 0.2, 1) })
    );

    // X: hold while jiggling, then glide to target
    flyX.value = withDelay(
      500,
      withTiming(targetX - 22, { duration: 500, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) })
    );

    // Cart button bounces when bubble arrives (~950ms)
    setTimeout(() => {
      cartBtnScale.value = withSequence(
        withSpring(1.35, { damping: 6, stiffness: 250 }),
        withSpring(1, { damping: 10, stiffness: 180 })
      );
    }, 950);
  };

  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchProductById(Number(id)),
  });

  const currentInCart = useMemo(
    () => cartItems.find(i => i.product.id === product?.id)?.quantity || 0,
    [cartItems, product?.id]
  );

  const canAddMore = product ? (product.stock ?? 0) > 0 && currentInCart < (product.stock ?? 0) : false;

  const addRecentlyViewed = useRecentlyViewed((state) => state.add);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
    }
  }, [product, addRecentlyViewed]);

  const handleAddToCart = () => {
    ctaScale.value = withTiming(0.95, { duration: 80, easing: Easing.out(Easing.ease) }, () => {
      ctaScale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.back(2)) });
    });

    if (!product || !canAddMore) return;

    try {
      addProduct(product);
      ctaBtnRef.current?.measureInWindow((x: number, y: number, w: number, h: number) => {
        triggerFlyAnimation(x + w / 2, y + h / 2);
      });
    } catch (err) {
      Alert.alert('Error', 'No se pudo agregar al carrito. Intenta nuevamente.');
    }
  };

  const handleDecrement = () => {
    if (!product || currentInCart === 0) return;
    decrementProduct(product.id);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const ctaLabel = () => {
    if (!product || product.stock === 0) return 'Agotado';
    if (currentInCart >= product.stock) return 'Máximo alcanzado';
    if (currentInCart > 0) return 'Agregar uno más';
    return 'Agregar al carrito';
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
          <Text className="text-red-500 text-lg mb-4">Producto no encontrado</Text>
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
      <Stack.Screen options={{ headerShown: false }} />

      {/* Floating Back Button */}
      <Pressable
        onPress={handleBack}
        className="absolute left-5 z-50 bg-white/90 p-3 rounded-full shadow-lg border border-gray-100"
        style={{ top: insets.top + 8, elevation: 5 }}
      >
        <ArrowLeft size={24} color="black" />
      </Pressable>

      {/* Floating Cart Button — nav bar style, fly-to-cart target */}
      <Animated.View
        style={[cartBtnAnimatedStyle, { position: 'absolute', right: 20, top: insets.top + 8, zIndex: 50, elevation: 5 }]}
      >
        <Pressable
          onPress={() => router.push('/cart')}
          className="bg-black p-3 rounded-full"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
          }}
        >
          <View>
            <ShoppingCart size={24} color="white" />
            {cartItems.length > 0 && (
              <View
                className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[18px] h-[18px] px-1 items-center justify-center"
              >
                <Text className="text-white text-[10px] font-bold">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
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
        {/* Hero Image — compact to push content above fold */}
        <Animated.View entering={FadeIn.duration(400)}>
          <View className="bg-gray-50 items-center justify-center py-4">
            <Image
              source={{ uri: product.image }}
              className="w-full h-64"
              alt={`${product.name} image`}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Product Info */}
        <View className="px-5 py-5">
          {/* Dietary trust badges */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <DietaryBadgeList tags={product.dietary_tags} />
          </Animated.View>

          {/* Name */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)}>
            <Text className="text-2xl font-bold text-gray-900 leading-tight mb-2">
              {product.name}
            </Text>
          </Animated.View>

          {/* Price + Stock — same row, left-aligned */}
          <Animated.View entering={FadeInUp.delay(280).duration(400)}>
            <View className="flex-row items-center gap-3 mb-5">
              <Text className="text-2xl font-extrabold text-gray-900">
                {formatPrice(product.price)}
              </Text>
              {product.stock === 0 ? (
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
                  <Text className="text-sm font-medium text-red-600">Agotado</Text>
                </View>
              ) : product.stock <= 5 ? (
                <StockBadge stock={product.stock} variant="inline" />
              ) : (
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                  <Text className="text-sm text-gray-500">En stock</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)}>
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-900 mb-2">
                Descripción
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                {product.description || 'Producto de alta calidad especialmente seleccionado para personas con restricciones alimentarias. Ingredientes cuidadosamente verificados para garantizar su seguridad.'}
              </Text>
            </View>
          </Animated.View>

          {/* Nutritional Info */}
          {product.nutritional_info && (() => {
            try {
              const nutrition = JSON.parse(product.nutritional_info);
              return (
                <Animated.View entering={FadeInUp.delay(460).duration(400)}>
                  <View className="mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <Text className="text-base font-semibold text-gray-900 mb-3">
                      Información nutricional
                    </Text>
                    <View className="gap-2">
                      <View className="flex-row justify-between py-1 border-b border-gray-100">
                        <Text className="text-sm text-gray-600">Calorías</Text>
                        <Text className="text-sm font-medium text-gray-900">{nutrition.calories} kcal</Text>
                      </View>
                      <View className="flex-row justify-between py-1 border-b border-gray-100">
                        <Text className="text-sm text-gray-600">Proteínas</Text>
                        <Text className="text-sm font-medium text-gray-900">{nutrition.protein}g</Text>
                      </View>
                      <View className="flex-row justify-between py-1 border-b border-gray-100">
                        <Text className="text-sm text-gray-600">Carbohidratos</Text>
                        <Text className="text-sm font-medium text-gray-900">{nutrition.carbs}g</Text>
                      </View>
                      <View className="flex-row justify-between py-1">
                        <Text className="text-sm text-gray-600">Grasas</Text>
                        <Text className="text-sm font-medium text-gray-900">{nutrition.fat}g</Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              );
            } catch (e) {
              return null;
            }
          })()}
        </View>
      </ScrollView>

      {/* Sticky CTA bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12, elevation: 10 }}
      >
        <View className="flex-row items-center gap-3">
          {/* Favorite button */}
          <View className="w-12 h-12 rounded-full border border-gray-200 items-center justify-center">
            <FavoriteButton productId={Number(id)} size={22} />
          </View>

          {/* Quantity selector — visible only when item already in cart */}
          {currentInCart > 0 && (
            <View className="flex-row items-center border border-gray-200 rounded-full overflow-hidden h-12">
              <Pressable
                onPress={handleDecrement}
                className="w-11 h-12 items-center justify-center active:bg-gray-100"
                style={{ minWidth: 44 }}
              >
                <Minus size={18} color="#111827" />
              </Pressable>
              <Text className="text-base font-bold w-6 text-center text-gray-900">
                {currentInCart}
              </Text>
              <Pressable
                onPress={handleAddToCart}
                disabled={!canAddMore}
                className="w-11 h-12 items-center justify-center active:bg-gray-100"
                style={{ minWidth: 44 }}
              >
                <Plus size={18} color={canAddMore ? '#111827' : '#D1D5DB'} />
              </Pressable>
            </View>
          )}

          {/* Primary CTA */}
          <Animated.View style={[ctaAnimatedStyle, { flex: 1 }]}>
            <Pressable
              ref={ctaBtnRef}
              onPress={handleAddToCart}
              disabled={!canAddMore}
              className={`h-12 rounded-full items-center justify-center flex-row gap-2 ${
                canAddMore ? 'bg-black active:opacity-80' : 'bg-gray-200'
              }`}
              style={{ minHeight: 48 }}
            >
              <ShoppingCart size={20} color={canAddMore ? 'white' : '#9CA3AF'} />
              <Text className={`font-semibold text-base ${canAddMore ? 'text-white' : 'text-gray-400'}`}>
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
