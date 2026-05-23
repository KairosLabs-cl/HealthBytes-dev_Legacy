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

    // ─── Simplified Animation Phase ──────────────────────────────
    // Reduced from complex 6-part sequence to simple pop and fly to save frames

    // Pop in and shrink as it flies
    flyScale.value = withSequence(
      withTiming(1.2, { duration: 200, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 150 }),
      withDelay(150, withTiming(0.4, { duration: 400, easing: Easing.in(Easing.cubic) })),
      withTiming(0, { duration: 100 })
    );

    // Fade in, hold, fade out
    flyOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withDelay(600, withTiming(0, { duration: 200 }))
    );

    // Simple single rotation
    flyRotate.value = withSequence(
      withTiming(-15, { duration: 200 }),
      withTiming(360, { duration: 600, easing: Easing.inOut(Easing.ease) })
    );

    // Arching path using bezier
    flyY.value = withSequence(
      withTiming(startY - 40, { duration: 300, easing: Easing.out(Easing.quad) }),
      withTiming(targetY - 22, { duration: 500, easing: Easing.in(Easing.quad) })
    );

    flyX.value = withDelay(
      300,
      withTiming(targetX - 22, { duration: 500, easing: Easing.inOut(Easing.quad) })
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
