import React from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

type Props = {
  /** Pass a shared animated style to avoid duplicate animation timers */
  shimmerStyle?: ViewStyle;
};

/**
 * ProductCardSkeleton - Animated placeholder matching the redesigned product card
 */
function ProductCardSkeleton({ shimmerStyle }: Props) {
  const localOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (shimmerStyle) return;
    localOpacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.ease }),
      -1,
      true
    );
  }, [localOpacity, shimmerStyle]);

  const localAnimatedStyle = useAnimatedStyle(() => ({
    opacity: localOpacity.value,
  }));

  const style = shimmerStyle ?? localAnimatedStyle;

  return (
    <View className="flex-1 overflow-hidden rounded-[24px] border border-border-subtle bg-surface-card">
      {/* Image placeholder */}
      <Animated.View style={[{ aspectRatio: 1 }, style]}>
        <View className="h-full w-full bg-surface-elevated" />
      </Animated.View>
      {/* Content area */}
      <View className="px-3 pt-2.5 pb-3">
        {/* Rating placeholder */}
        <Animated.View style={style}>
          <View className="mb-1 h-3 w-10 rounded bg-surface-elevated" />
        </Animated.View>
        {/* Name placeholder */}
        <Animated.View style={style}>
          <View className="mb-1 h-4 w-4/5 rounded bg-surface-elevated" />
        </Animated.View>
        <Animated.View style={style}>
          <View className="mb-1.5 h-4 w-3/5 rounded bg-surface-elevated" />
        </Animated.View>
        {/* Tag placeholder */}
        <Animated.View style={style}>
          <View className="mb-2 h-5 w-20 rounded-full bg-surface-muted" />
        </Animated.View>
        {/* Price placeholder */}
        <Animated.View style={style}>
          <View className="mb-2.5 h-5 w-1/3 rounded bg-surface-elevated" />
        </Animated.View>
        {/* Button placeholder */}
        <Animated.View style={style}>
          <View className="h-11 w-full rounded-2xl bg-surface-elevated" />
        </Animated.View>
      </View>
    </View>
  );
}

export default React.memo(ProductCardSkeleton);

/**
 * Hook to create a shared shimmer animation.
 * Use in parent components that render multiple skeletons.
 */
export function useShimmerStyle() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.ease }),
      -1,
      true
    );
  }, [opacity]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return shimmerStyle;
}
