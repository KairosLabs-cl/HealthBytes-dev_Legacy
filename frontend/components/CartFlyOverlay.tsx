/**
 * CartFlyOverlay — global fly-to-cart animation bubble.
 * Renders above everything in _layout.tsx. ProductCard triggers it via cartAnimationStore.
 */
import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { ShoppingCart } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCartAnimation } from "@/store/cartAnimationStore";

export default function CartFlyOverlay() {
  const pending = useCartAnimation((s) => s.pending);
  const clear = useCartAnimation((s) => s.clear);
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const flyX = useSharedValue(0);
  const flyY = useSharedValue(0);
  const flyScale = useSharedValue(0);
  const flyOpacity = useSharedValue(0);
  const flyRotate = useSharedValue(0);

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
  }));

  useEffect(() => {
    if (!pending) return;
    const { x: startX, y: startY } = pending;
    clear();

    // Cart tab = center of nav pill, mid-height of pill (~60px tall, bottom = max(insets.bottom, 8))
    const targetX = screenWidth / 2;
    const targetY = screenHeight - Math.max(insets.bottom, 8) - 30;

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
      // ─── Phase 2 (500–1000ms): fly + shrink ──────────────────────────
      withTiming(0.5, { duration: 350, easing: Easing.in(Easing.cubic) }),
      withTiming(0, { duration: 150 })
    ); // 1000ms

    flyOpacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withDelay(770, withTiming(0, { duration: 150 }))
    );

    // Jiggle then spin
    flyRotate.value = withSequence(
      withTiming(-22, { duration: 130 }),
      withTiming(22, { duration: 130 }),
      withTiming(-12, { duration: 90 }),
      withTiming(12, { duration: 90 }),
      withTiming(0, { duration: 60 }),
      withTiming(360, { duration: 500, easing: Easing.linear })
    ); // 1000ms

    // Y: hover up, then fly down to nav bar cart
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

    // X: hold while jiggling, then glide to cart center
    flyX.value = withDelay(
      500,
      withTiming(targetX - 22, {
        duration: 500,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      })
    );
  }, [pending]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View
      style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 999 }]}
      pointerEvents="none"
    >
      <Animated.View style={flyingStyle} pointerEvents="none">
        <ShoppingCart size={18} color="white" />
      </Animated.View>
    </View>
  );
}
